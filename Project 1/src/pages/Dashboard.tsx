import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Target, 
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Check,
  Brain,
  Star,
  Activity,
  Award,
  Bell,
  Sparkles,
  ChevronRight,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Rocket,
  Clock,
  Zap
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { api } from "../lib/api";
import { formatCurrency, cn } from "../lib/utils";
import { useAuth } from "../lib/AuthContext";
import { format } from "date-fns";

import { CardSkeleton, ChartSkeleton, EmptyState, Skeleton } from "../components/common/Feedback";

interface DashboardData {
  transactions: any[];
  habits: any[];
  goals: any[];
  investments: any[];
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.analytics.get(),
      api.profile.get(),
      api.insights.get(),
      api.notifications.list()
    ]).then(([analyticsData, profileData, insightData, notifData]) => {
      setData(analyticsData);
      setProfile(profileData);
      setInsights(Array.isArray(insightData) ? insightData : []);
      setNotifications(Array.isArray(notifData) ? notifData.slice(0, 3) : []);
    }).catch(error => {
      console.error("Systems initialization failure:", error);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  // Chart data moved before early returns
  const chartData = React.useMemo(() => {
    if (!data?.transactions) return [];
    return data.transactions.slice(0, 7).reverse().map((t: any) => ({
      name: format(new Date(t.date), "EEE"),
      amount: t.amount,
    }));
  }, [data?.transactions]);

  if (loading) return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-4">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-6 w-1/2" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ChartSkeleton />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-[2.5rem]" />
          <Skeleton className="h-64 w-full rounded-[2.5rem]" />
        </div>
      </div>
    </div>
  );

  if (!data || !profile) return (
    <EmptyState 
      title="System Offline" 
      description="Unable to sync financial data. Please re-authenticate." 
      actionLabel="Retry Link"
      onAction={() => window.location.reload()}
    />
  );

  const transactions = data.transactions || [];
  const habits = data.habits || [];
  const goals = data.goals || [];
  const investments = data.investments || [];
  
  const income = transactions.filter((t: any) => t.type === 'income').reduce((acc: number, t: any) => acc + t.amount, 0);
  const expenses = transactions.filter((t: any) => t.type === 'expense').reduce((acc: number, t: any) => acc + t.amount, 0);
  const investmentValue = investments.reduce((acc: number, inv: any) => acc + inv.current_amount, 0);
  const netWorth = (income - expenses) + investmentValue;
  const savingsRatio = income > 0 ? ((income - expenses) / income) * 100 : 0;

  // Financial Score Logic (Improved calculation)
  const habitConsistency = habits.reduce((acc: number, h: any) => acc + (h.streak || 0), 0) / (habits.length || 1);
  const goalProgress = goals.reduce((acc: number, g: any) => acc + (g.current_amount / g.target_amount), 0) / (goals.length || 1);
  const score = Math.min(950, 400 + (savingsRatio * 3) + (habitConsistency * 50) + (goalProgress * 150));

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="text-rose-400" size={18} />;
      case 'success': return <CheckCircle2 className="text-emerald-400" size={18} />;
      case 'streak': return <Zap className="text-yellow-400" size={18} />;
      case 'goal': return <Rocket className="text-indigo-400" size={18} />;
      default: return <Lightbulb className="text-indigo-400" size={18} />;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-[2.5rem] font-black text-white tracking-tighter leading-tight">
            Systems Online. <br/>
            Welcome, <span className="text-indigo-400">{profile?.name.split(' ')[0]}</span>.
          </h1>
          <p className="text-slate-400 font-medium text-lg mt-2">Your financial protocol is operating at peak efficiency.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/transactions" className="glass px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all border border-white/5 flex items-center gap-2">
            <Activity size={16} /> Transactions
          </Link>
          <Link to="/investments" className="accent-gradient px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-500/20 hover:scale-[1.02] transition-all active:scale-95 flex items-center gap-2">
            <Plus size={16} /> Add Asset
          </Link>
        </div>
      </header>

      {/* Primary Stats Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Net Worth", value: netWorth, icon: Wallet, color: "indigo" },
          { label: "Monthly Income", value: income, icon: TrendingUp, color: "emerald" },
          { label: "Monthly Expenses", value: expenses, icon: TrendingDown, color: "rose" },
          { label: "Savings Ratio", value: `${savingsRatio.toFixed(1)}%`, icon: Target, showCurrency: false, color: "amber" },
        ].map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label} 
            className="glass p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 -mr-4 -mt-4 group-hover:scale-110 transition-transform">
              <stat.icon size={64} />
            </div>
            <div className="space-y-4 relative z-10">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner",
                stat.color === 'indigo' && "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
                stat.color === 'emerald' && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
                stat.color === 'rose' && "bg-rose-500/10 text-rose-400 border border-rose-500/20",
                stat.color === 'amber' && "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              )}>
                <stat.icon size={22} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">{stat.label}</p>
                <h3 className="text-2xl font-black text-white tracking-tighter">
                  {stat.showCurrency === false ? stat.value : formatCurrency(stat.value as number)}
                </h3>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trajectory Block */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 min-w-0 glass rounded-[3rem] p-10 border border-white/5 relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                Cash Flow Intelligence
                <Activity size={18} className="text-indigo-500" />
              </h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.25em] mt-1">Transaction Velocity Matrix</p>
            </div>
            <div className="flex gap-2 p-1 bg-white/[0.02] rounded-2xl border border-white/5">
              {['7D', '30D', '90D'].map(t => (
                <button key={t} className={cn(
                  "px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all",
                  t === '30D' ? "accent-gradient text-white shadow-lg shadow-indigo-500/20" : "text-slate-600 hover:text-white"
                )}>{t}</button>
              ))}
            </div>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.02)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 900, textAnchor: 'middle'}} dy={20} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderRadius: '20px', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    fontSize: '10px',
                    fontWeight: 900,
                    textTransform: 'uppercase'
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={5} fillOpacity={1} fill="url(#colorNetWorth)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Intelligence Sidepanel */}
        <div className="space-y-8">
          {/* Smart Insights */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden group hover:border-indigo-500/30 transition-all"
          >
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-[60px] group-hover:bg-indigo-500/20 transition-all" />
            
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="text-indigo-400" size={18} />
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-300">Neural Insights</h3>
            </div>

            <div className="space-y-4">
              {insights.length > 0 ? insights.map((insight, idx) => (
                <div key={idx} className="glass p-4 rounded-2xl border border-white/5 flex gap-4">
                  <div className="mt-1">{getInsightIcon(insight.type)}</div>
                  <div>
                    <p className="text-white font-bold text-xs uppercase tracking-widest">{insight.title}</p>
                    <p className="text-slate-400 text-[10px] mt-1 leading-relaxed">{insight.message}</p>
                  </div>
                </div>
              )) : (
                <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest text-center py-8 italic">Analyzing patterns...</p>
              )}
            </div>
          </motion.div>

          {/* Terminal Notifications */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-[2.5rem] p-8 border border-white/5"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Bell className="text-indigo-400" size={18} />
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-300">New Signals</h3>
              </div>
              <Link to="/notifications" className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
                View All <ChevronRight size={12} />
              </Link>
            </div>

            <div className="space-y-4">
              {notifications.length > 0 ? notifications.map((notif, idx) => (
                <div key={idx} className="flex gap-4 items-start pb-4 border-b border-white/5 last:border-0 last:pb-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-slate-200 font-bold text-xs">{notif.title}</p>
                    <p className="text-slate-500 text-[10px] font-medium mt-0.5 line-clamp-1">{notif.message}</p>
                  </div>
                </div>
              )) : (
                <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest text-center py-4 italic">No new signals.</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Neural Health Score */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-[2.5rem] p-8 border border-white/5 flex flex-col items-center justify-center text-center"
        >
          <div className="flex justify-between items-center w-full mb-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Health Score</h3>
            <Brain size={18} className="text-indigo-400" />
          </div>
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90">
              <circle cx="80" cy="80" r="70" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="10" />
              <circle cx="80" cy="80" r="70" fill="transparent" stroke="url(#scoreGradient)" strokeWidth="10" strokeDasharray={440} strokeDashoffset={440 - (440 * (score/1000))} strokeLinecap="round" />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-white tracking-tighter">{Math.round(score)}</span>
              <span className="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1">Excellent</span>
            </div>
          </div>
        </motion.div>

        {/* Strategic Goals */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="lg:col-span-2 glass rounded-[3rem] p-10 border border-white/5 space-y-8"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Priority Milestones</h3>
            <Link to="/goals" className="text-[10px] font-black uppercase tracking-widest text-indigo-400">View All</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {goals.slice(0, 2).map((goal: any) => {
              const progress = (goal.current_amount / goal.target_amount) * 100;
              return (
                <div key={goal.id} className="space-y-4 p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                  <div className="flex justify-between items-end">
                    <div>
                      <h4 className="text-white font-black text-sm uppercase tracking-tighter">{goal.name}</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Target: ${goal.target_amount.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-white">{Math.min(100, Math.round(progress))}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-white/[0.03] h-2 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${progress}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, ease: "circOut" }}
                      className="accent-gradient h-full rounded-full" 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
