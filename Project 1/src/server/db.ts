import Database from "better-sqlite3";

export const db = new Database("wealthflow.db");

export function applyMigrations() {
  // 1. Initial Schema
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      monthly_income REAL DEFAULT 0,
      savings_target REAL DEFAULT 0,
      financial_goals TEXT,
      is_admin INTEGER DEFAULT 0,
      reminder_active INTEGER DEFAULT 0,
      reminder_time TEXT DEFAULT '09:00',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      description TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
    CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);

    CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      frequency TEXT NOT NULL,
      streak INTEGER DEFAULT 0,
      last_completed TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
    CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);

    CREATE TABLE IF NOT EXISTS habit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      FOREIGN KEY(habit_id) REFERENCES habits(id)
    );

    CREATE TABLE IF NOT EXISTS savings_goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      target_amount REAL NOT NULL,
      current_amount REAL DEFAULT 0,
      deadline TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS goal_contributions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      goal_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      FOREIGN KEY(goal_id) REFERENCES savings_goals(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS investments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      initial_amount REAL NOT NULL,
      current_amount REAL NOT NULL,
      date TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      rating INTEGER DEFAULT 5,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS wealth_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      net_worth REAL NOT NULL,
      savings REAL NOT NULL,
      investments REAL NOT NULL,
      date TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);

  // 2. Incremental Migrations
  const migrations = [
    {
      name: "initial_setup",
      up: () => { /* Logic captured in initial db.exec */ }
    },
    {
       name: "add_reminder_preferences",
       up: () => {
         const tableInfo = db.prepare("PRAGMA table_info(users)").all() as any[];
         const columnNames = tableInfo.map(col => col.name);
         if (!columnNames.includes('reminder_active')) {
           db.exec("ALTER TABLE users ADD COLUMN reminder_active INTEGER DEFAULT 0");
         }
         if (!columnNames.includes('reminder_time')) {
           db.exec("ALTER TABLE users ADD COLUMN reminder_time TEXT DEFAULT '09:00'");
         }
       }
    }
  ];

  for (const migration of migrations) {
    const exists = db.prepare("SELECT id FROM migrations WHERE name = ?").get(migration.name);
    if (!exists) {
      db.transaction(() => {
        migration.up();
        db.prepare("INSERT INTO migrations (name) VALUES (?)").run(migration.name);
      })();
      console.log(`System: Applied migration [${migration.name}]`);
    }
  }
}
