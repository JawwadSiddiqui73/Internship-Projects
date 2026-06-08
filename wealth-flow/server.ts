import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { format } from "date-fns";
import cron from "node-cron";

import { db, applyMigrations } from "./src/server/db.js";
import { UserRow, TransactionRow, HabitRow, GoalRow, InvestmentRow } from "./src/server/types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const SECRET = process.env.JWT_SECRET;

if (!SECRET && process.env.NODE_ENV === "production") {
  throw new Error("FATAL: JWT_SECRET environment variable is required in production.");
}
const JWT_FINAL_SECRET = SECRET || "dev-secret-keep-it-safe";

// Initialize Database & Migrations
applyMigrations();

// Admin Seeding
(async () => {
  const adminEmail = process.env.ADMIN_EMAIL || "danish100dj@gmail.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Danish@7397";
  const existingAdmin = db.prepare("SELECT * FROM users WHERE email = ?").get(adminEmail) as any;
  
  if (existingAdmin) {
    db.prepare("UPDATE users SET is_admin = 1 WHERE email = ?").run(adminEmail);
  } else {
    try {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      db.prepare("INSERT INTO users (name, email, password, is_admin) VALUES (?, ?, ?, 1)")
        .run("Admin User", adminEmail, hashedPassword);
      console.log(`System: Primary administrator initialized [${adminEmail}]`);
    } catch (e) {
      // Silent pass if collision happens
    }
  }
})();

async function startServer() {
  const app = express();
  
  app.set('trust proxy', 1);
  
  app.use(helmet({
    contentSecurityPolicy: false,
  }));
  app.use(cors());
  app.use(express.json());

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 1000000, // Highly permissive for preview and shared development environment
    validate: false,
    handler: (req, res) => {
      res.status(429).json({
        error: "Too many requests. Please try again later.",
        retryAfter: res.getHeader('Retry-After')
      });
    }
  });
  app.use("/api/", limiter);

  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    jwt.verify(token, JWT_FINAL_SECRET, (err: any, decoded: any) => {
      if (err) return res.status(403).json({ error: "Forbidden" });
      req.user = decoded;
      next();
    });
  };

  // --- Auth Routes ---
  app.post("/api/auth/register", async (req, res) => {
    const { name, email, password } = req.body;
    try {
      if (!name || !email || !password) throw new Error("Missing alignment parameters");
      const hashedPassword = await bcrypt.hash(password, 10);
      const stmt = db.prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
      const info = stmt.run(name, email, hashedPassword);
      const token = jwt.sign({ id: info.lastInsertRowid, email }, JWT_FINAL_SECRET);
      res.json({ token, user: { id: info.lastInsertRowid, name, email } });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Email already exists" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id, email: user.email, is_admin: user.is_admin }, JWT_FINAL_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, is_admin: user.is_admin } });
  });

  // --- Profile Routes ---
  app.get("/api/profile", authenticateToken, (req: any, res) => {
    const user = db.prepare("SELECT id, name, email, monthly_income, savings_target, financial_goals, is_admin, reminder_active, reminder_time FROM users WHERE id = ?").get(req.user.id);
    res.json(user);
  });

  app.put("/api/profile", authenticateToken, (req: any, res) => {
    const { name, monthly_income, savings_target, financial_goals, reminder_active, reminder_time } = req.body;
    db.prepare("UPDATE users SET name = ?, monthly_income = ?, savings_target = ?, financial_goals = ?, reminder_active = ?, reminder_time = ? WHERE id = ?")
      .run(name, monthly_income, savings_target, financial_goals, reminder_active ? 1 : 0, reminder_time, req.user.id);
    res.json({ success: true });
  });

  // --- Transaction Routes ---
  app.get("/api/transactions", authenticateToken, (req: any, res) => {
    const { page = 1, limit = 20, search = "", category = "", type = "", startDate = "", endDate = "" } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    let query = "SELECT * FROM transactions WHERE user_id = ?";
    const params: any[] = [req.user.id];
    
    if (search) {
      query += " AND (description LIKE ? OR category LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category) {
      query += " AND category = ?";
      params.push(category);
    }
    if (type) {
      query += " AND type = ?";
      params.push(type);
    }
    if (startDate) {
      query += " AND date >= ?";
      params.push(startDate);
    }
    if (endDate) {
      query += " AND date <= ?";
      params.push(endDate);
    }
    
    const countQuery = query.replace("SELECT *", "SELECT COUNT(*) as count");
    const totalCount = (db.prepare(countQuery).get(...params) as any).count;
    
    query += " ORDER BY date DESC LIMIT ? OFFSET ?";
    params.push(Number(limit), offset);
    
    const transactions = db.prepare(query).all(...params);
    res.json({ transactions, totalCount, totalPages: Math.ceil(totalCount / Number(limit)) });
  });

  app.post("/api/transactions", authenticateToken, (req: any, res) => {
    const { type, category, amount, date, description } = req.body;
    db.prepare("INSERT INTO transactions (user_id, type, category, amount, date, description) VALUES (?, ?, ?, ?, ?, ?)")
      .run(req.user.id, type, category, amount, date, description);
    res.json({ success: true });
  });

  app.delete("/api/transactions/:id", authenticateToken, (req: any, res) => {
    db.prepare("DELETE FROM transactions WHERE id = ? AND user_id = ?").run(req.params.id, req.user.id);
    res.json({ success: true });
  });

  // --- Habit Routes ---
  app.get("/api/habits", authenticateToken, (req: any, res) => {
    const habits = db.prepare("SELECT * FROM habits WHERE user_id = ?").all(req.user.id);
    res.json(habits);
  });

  app.post("/api/habits", authenticateToken, (req: any, res) => {
    const { name, frequency } = req.body;
    db.prepare("INSERT INTO habits (user_id, name, frequency) VALUES (?, ?, ?)")
      .run(req.user.id, name, frequency);
    res.json({ success: true });
  });

  app.post("/api/habits/:id/complete", authenticateToken, (req: any, res) => {
    const habitId = req.params.id;
    const date = new Date().toISOString().split('T')[0];
    
    const existing = db.prepare("SELECT id FROM habit_logs WHERE habit_id = ? AND date = ?").get(habitId, date);
    if (existing) return res.status(400).json({ error: "Already completed today" });

    db.prepare("INSERT INTO habit_logs (habit_id, date) VALUES (?, ?)").run(habitId, date);
    db.prepare("UPDATE habits SET streak = streak + 1, last_completed = ? WHERE id = ?").run(date, habitId);
    
    res.json({ success: true });
  });

  // --- Management Routes ---
  app.get("/api/goals", authenticateToken, (req: any, res) => {
    const goals = db.prepare("SELECT * FROM savings_goals WHERE user_id = ?").all(req.user.id);
    res.json(goals);
  });

  app.post("/api/goals", authenticateToken, (req: any, res) => {
    const { name, target_amount, deadline } = req.body;
    db.prepare("INSERT INTO savings_goals (user_id, name, target_amount, deadline) VALUES (?, ?, ?, ?)")
      .run(req.user.id, name, target_amount, deadline);
    res.json({ success: true });
  });

  app.patch("/api/goals/:id", authenticateToken, (req: any, res) => {
    const { current_amount } = req.body;
    db.prepare("UPDATE savings_goals SET current_amount = ? WHERE id = ? AND user_id = ?")
      .run(current_amount, req.params.id, req.user.id);
    res.json({ success: true });
  });

  app.delete("/api/goals/:id", authenticateToken, (req: any, res) => {
    db.prepare("DELETE FROM savings_goals WHERE id = ? AND user_id = ?").run(req.params.id, req.user.id);
    res.json({ success: true });
  });

  app.get("/api/goals/:id/contributions", authenticateToken, (req: any, res) => {
    const contributions = db.prepare("SELECT * FROM goal_contributions WHERE goal_id = ? ORDER BY date DESC").all(req.params.id);
    res.json(contributions);
  });

  app.post("/api/goals/:id/contributions", authenticateToken, (req: any, res) => {
    const { amount, date } = req.body;
    db.prepare("INSERT INTO goal_contributions (goal_id, amount, date) VALUES (?, ?, ?)")
      .run(req.params.id, amount, date);
    db.prepare("UPDATE savings_goals SET current_amount = current_amount + ? WHERE id = ?").run(amount, req.params.id);
    res.json({ success: true });
  });

  app.get("/api/investments", authenticateToken, (req: any, res) => {
    const investments = db.prepare("SELECT * FROM investments WHERE user_id = ? ORDER BY date DESC").all(req.user.id);
    res.json(investments);
  });

  app.post("/api/investments", authenticateToken, (req: any, res) => {
    const { name, type, initial_amount, current_amount, date } = req.body;
    db.prepare("INSERT INTO investments (user_id, name, type, initial_amount, current_amount, date) VALUES (?, ?, ?, ?, ?, ?)")
      .run(req.user.id, name, type, initial_amount, current_amount, date);
    res.json({ success: true });
  });

  app.delete("/api/investments/:id", authenticateToken, (req: any, res) => {
    db.prepare("DELETE FROM investments WHERE id = ? AND user_id = ?").run(req.params.id, req.user.id);
    res.json({ success: true });
  });

  // --- Insight Engine ---
  app.get("/api/insights", authenticateToken, (req: any, res) => {
    const userId = req.user.id;
    const user = db.prepare("SELECT monthly_income, savings_target FROM users WHERE id = ?").get(userId) as UserRow;
    const transactions = db.prepare("SELECT * FROM transactions WHERE user_id = ? AND date >= date('now', '-30 days')").all(userId) as TransactionRow[];
    const habits = db.prepare("SELECT * FROM habits WHERE user_id = ?").all(userId) as HabitRow[];
    const goals = db.prepare("SELECT * FROM savings_goals WHERE user_id = ?").all(userId) as GoalRow[];
    const investments = db.prepare("SELECT * FROM investments WHERE user_id = ?").all(userId) as InvestmentRow[];
    
    const insights: any[] = [];
    
    const monthlyExpenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const monthlyIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0) || user.monthly_income;
    
    if (monthlyIncome > 0 && monthlyExpenses > monthlyIncome * 0.85) {
      insights.push({ type: 'warning', title: 'Capital Depletion Risk', impact: 'High', message: `Current expenditure is at ${(monthlyExpenses / monthlyIncome * 100).toFixed(0)}% of realized capacity.` });
    }

    const categoryTotals = transactions.filter(t => t.type === 'expense').reduce((acc: any, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});
    
    const topCategory = Object.entries(categoryTotals).sort((a: any, b: any) => b[1] - a[1])[0];
    if (topCategory && (topCategory[1] as number) > monthlyExpenses * 0.4) {
      insights.push({ type: 'info', title: 'Asset Concentration', message: `${topCategory[0]} accounts for ${( (topCategory[1] as number) / monthlyExpenses * 100).toFixed(0)}% of your monthly delta.` });
    }
    
    const activeStreaks = habits.filter(h => h.streak >= 7).length;
    if (activeStreaks > 0) {
      insights.push({ type: 'streak', title: 'Discipline Momentum', impact: 'Positive', message: `${activeStreaks} protocol(s) showing high synchronization.` });
    }
    
    // --- Predictive Analytics ---
    const avgDailySaving = monthlyIncome > 0 ? (monthlyIncome - monthlyExpenses) / 30 : 0;
    
    goals.forEach(g => {
      const progress = (g.current_amount / g.target_amount) * 100;
      const remainingAmount = g.target_amount - g.current_amount;

      if (progress >= 75 && progress < 100) {
        insights.push({ type: 'goal', title: 'Milestone Convergence', message: `Goal "${g.name}" is reaching terminal phase (${progress.toFixed(0)}%).` });
      }

      if (avgDailySaving > 0 && remainingAmount > 0) {
        const daysToFinish = Math.ceil(remainingAmount / avgDailySaving);
        if (daysToFinish <= 180) { // Only show for the next 6 months
          insights.push({ 
            type: 'prediction', 
            title: 'Goal Finalization Forecast', 
            message: `Estimated arrival for "${g.name}": ~${daysToFinish} cycles based on current liquidity velocity.`,
            impact: 'Positive'
          });
        }
      }
    });

    if (avgDailySaving > 0) {
      const sixMonthForecast = (monthlyIncome - monthlyExpenses) * 6;
      insights.push({
        type: 'forecast',
        title: 'Capital Expansion Forecast',
        message: `Projected capital growth: +$${sixMonthForecast.toLocaleString()} over the next 180 cycles at current velocity.`,
        impact: 'High'
      });
    }

    const totalInvested = investments.reduce((acc, inv) => acc + inv.initial_amount, 0);
    const currentInvestmentValue = investments.reduce((acc, inv) => acc + inv.current_amount, 0);
    if (totalInvested > 0) {
      const yield_val = ((currentInvestmentValue - totalInvested) / totalInvested) * 100;
      if (yield_val > 5) {
        insights.push({ type: 'success', title: 'Yield Optimization', message: `Portfolio yield is at +${yield_val.toFixed(1)}% above entry baseline.` });
      }
    }

    res.json(insights);
  });

  // --- Notification Routes ---
  app.get("/api/notifications", authenticateToken, (req: any, res) => {
    const notifications = db.prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC").all(req.user.id);
    res.json(notifications);
  });

  app.patch("/api/notifications/:id/read", authenticateToken, (req: any, res) => {
    db.prepare("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?").run(req.params.id, req.user.id);
    res.json({ success: true });
  });

  app.patch("/api/notifications/read-all", authenticateToken, (req: any, res) => {
    db.prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?").run(req.user.id);
    res.json({ success: true });
  });

  // --- Analytics Route ---
  app.get("/api/analytics", authenticateToken, (req: any, res) => {
    const userId = req.user.id;
    const transactions = db.prepare("SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC LIMIT 100").all(userId);
    const habits = db.prepare("SELECT * FROM habits WHERE user_id = ?").all(userId);
    const goals = db.prepare("SELECT * FROM savings_goals WHERE user_id = ?").all(userId);
    const investments = db.prepare("SELECT * FROM investments WHERE user_id = ?").all(userId);
    
    res.json({ transactions, habits, goals, investments });
  });

  // --- Wealth History Route ---
  app.get("/api/wealth-history", authenticateToken, (req: any, res) => {
    const history = db.prepare("SELECT * FROM wealth_history WHERE user_id = ? ORDER BY date DESC LIMIT 50").all(req.user.id);
    res.json(history);
  });

  app.post("/api/wealth-history/snapshot", authenticateToken, (req: any, res) => {
    const userId = req.user.id;
    const transactions = db.prepare("SELECT * FROM transactions WHERE user_id = ?").all(userId) as TransactionRow[];
    const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const investments = db.prepare("SELECT * FROM investments WHERE user_id = ?").all(userId) as InvestmentRow[];
    const investmentValue = investments.reduce((acc, inv) => acc + inv.current_amount, 0);
    const savings = db.prepare("SELECT SUM(current_amount) as total FROM savings_goals WHERE user_id = ?").get(userId) as any;
    
    const netWorth = (income - expenses) + investmentValue;
    const date = new Date().toISOString().split('T')[0];
    
    db.prepare("INSERT INTO wealth_history (user_id, net_worth, savings, investments, date) VALUES (?, ?, ?, ?, ?)")
      .run(userId, netWorth, savings.total || 0, investmentValue, date);
      
    res.json({ success: true });
  });

  // --- Feedback Routes ---
  app.get("/api/feedback", authenticateToken, (req: any, res) => {
    let feedback;
    if (req.user.is_admin) {
      feedback = db.prepare("SELECT f.*, u.name as user_name FROM feedback f JOIN users u ON f.user_id = u.id ORDER BY f.created_at DESC").all();
    } else {
      feedback = db.prepare("SELECT * FROM feedback WHERE user_id = ? ORDER BY created_at DESC").all(req.user.id);
    }
    res.json(feedback);
  });

  app.post("/api/feedback", authenticateToken, (req: any, res) => {
    const { message, rating } = req.body;
    db.prepare("INSERT INTO feedback (user_id, message, rating) VALUES (?, ?, ?)")
      .run(req.user.id, message, rating || 5);
    res.json({ success: true });
  });

  app.patch("/api/feedback/:id/status", authenticateToken, (req: any, res) => {
    if (!req.user.is_admin) return res.status(403).json({ error: "Admin only" });
    const { status } = req.body;
    db.prepare("UPDATE feedback SET status = ? WHERE id = ?").run(status, req.params.id);
    res.json({ success: true });
  });

  // --- Admin User Management ---
  app.get("/api/admin/users", authenticateToken, (req: any, res) => {
    if (!req.user.is_admin) return res.status(403).json({ error: "Admin only" });
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string || "";
    
    const offset = (page - 1) * limit;
    const searchPattern = `%${search}%`;
    
    const countRow = db.prepare("SELECT COUNT(*) as count FROM users WHERE name LIKE ? OR email LIKE ?").get(searchPattern, searchPattern) as any;
    const totalCount = countRow ? countRow.count : 0;
    const totalPages = Math.ceil(totalCount / limit) || 1;
    
    const users = db.prepare("SELECT id, name, email, is_admin, created_at FROM users WHERE name LIKE ? OR email LIKE ? LIMIT ? OFFSET ?").all(searchPattern, searchPattern, limit, offset);
    
    res.json({ users, totalCount, totalPages });
  });

  app.delete("/api/admin/users/:id", authenticateToken, (req: any, res) => {
    if (!req.user.is_admin) return res.status(403).json({ error: "Admin only" });
    if (req.params.id == req.user.id) return res.status(400).json({ error: "Cannot delete self" });
    
    db.transaction(() => {
      db.prepare("DELETE FROM transactions WHERE user_id = ?").run(req.params.id);
      db.prepare("DELETE FROM habits WHERE user_id = ?").run(req.params.id);
      db.prepare("DELETE FROM savings_goals WHERE user_id = ?").run(req.params.id);
      db.prepare("DELETE FROM investments WHERE user_id = ?").run(req.params.id);
      db.prepare("DELETE FROM notifications WHERE user_id = ?").run(req.params.id);
      db.prepare("DELETE FROM feedback WHERE user_id = ?").run(req.params.id);
      db.prepare("DELETE FROM wealth_history WHERE user_id = ?").run(req.params.id);
      db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);
    })();
    
    res.json({ success: true });
  });

  // --- Admin stats ---
  app.get("/api/admin/stats", authenticateToken, (req: any, res) => {
    if (!req.user.is_admin) return res.status(403).json({ error: "Admin only" });
    
    const stats = {
      totalUsers: (db.prepare("SELECT COUNT(*) as count FROM users").get() as any).count,
      totalTransactions: (db.prepare("SELECT COUNT(*) as count FROM transactions").get() as any).count,
      habitCompletion: (db.prepare("SELECT COUNT(*) as count FROM habit_logs").get() as any).count,
      totalInvested: (db.prepare("SELECT SUM(current_amount) as total FROM investments").get() as any).total || 0,
      totalSaved: (db.prepare("SELECT SUM(current_amount) as total FROM savings_goals").get() as any).total || 0,
      userGrowth: db.prepare("SELECT date(created_at) as date, COUNT(*) as count FROM users GROUP BY date(created_at) ORDER BY date DESC LIMIT 30").all(),
      recentFeedback: db.prepare("SELECT f.*, u.name as user_name FROM feedback f JOIN users u ON f.user_id = u.id ORDER BY f.created_at DESC LIMIT 5").all(),
    };
    res.json(stats);
  });

  // --- Report Routes ---
  app.get("/api/reports/monthly", authenticateToken, (req: any, res) => {
    const { month } = req.query; // format YYYY-MM
    const userId = req.user.id;
    
    const transactions = db.prepare("SELECT * FROM transactions WHERE user_id = ? AND date LIKE ?").all(userId, `${month}%`) as any[];
    const habits = db.prepare("SELECT * FROM habits WHERE user_id = ?").all(userId) as any[];
    const goals = db.prepare("SELECT * FROM savings_goals WHERE user_id = ?").all(userId) as any[];
    
    const income = transactions.filter((t: any) => t.type === 'income').reduce((acc: number, t: any) => acc + t.amount, 0);
    const expenses = transactions.filter((t: any) => t.type === 'expense').reduce((acc: number, t: any) => acc + t.amount, 0);
    
    const categoryBreakdown = transactions
      .filter((t: any) => t.type === 'expense')
      .reduce((acc: any, t: any) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});

    const summary = {
      income,
      expenses,
      savings: income - expenses,
      habitCount: habits.length,
      goalCount: goals.length,
      transactions,
      habits,
      goals,
      categoryBreakdown
    };
    
    res.json(summary);
  });

  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api/')) return res.status(404).json({ error: "Endpoint not found" });
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.use((err: any, req: any, res: any, next: any) => {
    console.error("System Error Overlay:", err);
    res.status(500).json({ 
      error: "Critical system failure", 
      message: process.env.NODE_ENV === 'production' ? "Internal Server Error" : err.message 
    });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // Enterprise Scheduler
  cron.schedule('* * * * *', () => {
    const now = new Date();
    const currentTime = format(now, 'HH:mm');
    const usersToRemind = db.prepare("SELECT id, name FROM users WHERE reminder_active = 1 AND reminder_time = ?").all(currentTime);
    
    usersToRemind.forEach((user: any) => {
      const date = now.toISOString().split('T')[0];
      const title = "Financial Signal Required";
      const message = `Hello ${user.name}, synchronization required for today's financial signals.`;
      const existing = db.prepare("SELECT id FROM notifications WHERE user_id = ? AND title = ? AND date(created_at) = ?").get(user.id, title, date);
      if (!existing) {
        db.prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'info')").run(user.id, title, message);
      }
    });
  });
}

startServer();
