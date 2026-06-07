import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight,
  Target,
  Zap,
  Loader2,
  Calendar,
  History,
  Info,
  Shield,
  Brain,
  Star
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from "recharts";
import { api } from "../lib/api";
import { cn, formatCurrency } from "../lib/utils";
import { format } from "date-fns";
import { toast } from "react-hot-toast";

const COLORS = ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#3b82f6', '#ec4899'];

import { EmptyState, Skeleton, ChartSkeleton } from "../components/common/Feedback";

export default function WealthAnalytics() {
  const [data, setData] = useState<any>(null);
  const [wealthHistory, setWealthHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [analytics, history] = await Promise.all([
        api.analytics.get(),
        api.wealthHistory.list()
      ]);
      setData(analytics);
      setWealthHistory(history);
      
      const currentMonth = new Date().toISOString().slice(0, 7);
      if (!history.find((h: any) => h.date === currentMonth)) {
        await api.wealthHistory.snapshot();
        const updatedHistory = await api.wealthHistory.list();
        setWealthHistory(updatedHistory);
      }
    } catch (error) {
       console.error(error);
       toast.error("Telemetry failed to synchronize");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="space-y-4">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-6 w-1/2" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Skeleton className="h-[400px] rounded-[3rem]" />
        <Skeleton className="h-[400px] rounded-[3rem]" />
      </div>
      <ChartSkeleton />
    </div>
  );

  if (!data) return (
    <EmptyState 
      title="Analytics Offline" 
      description="Unable to synthesize wealth matrix. Re-synchronize data stream." 
      onAction={fetchData}
      actionLabel="Sync Now"
    />
  );

  const transactions = data.transactions || [];
  const habits = data.habits || [];
  const goals = data.goals || [];
  const investments = data.investments || [];

  // Wealth distribution
  const totalSavings = goals.reduce((acc: number, g: any) => acc + g.current_amount, 0);
  const totalInvestments = investments.reduce((acc: number, i: any) => acc + i.current_amount, 0);
  const distributionData = [
    { name: 'Savings', value: totalSavings, color: '#6366f1' },
    { name: 'Investments', value: totalInvestments, color: '#a855f7' },
    { name: 'Cash', value: Math.max(0, transactions.filter((t: any) => t.type === 'income').reduce((acc: number, t: any) => acc + t.amount, 0) - transactions.filter((t: any) => t.type === 'expense').reduce((acc: number, t: any) => acc + t.amount, 0)), color: '#ec4899' }
  ];

  // Spending breakdown
  const categoryData = transactions
    .filter((t: any) => t.type === 'expense')
    .reduce((acc: any[], t: any) => {
      const existing = acc.find(item => item.name === t.category);
      if (existing) existing.value += t.amount;
      else acc.push({ name: t.category, value: t.amount });
      return acc;
    }, [])
    .sort((a, b) => b.value - a.value);

  const income = transactions.filter((t: any) => t.type === 'income').reduce((acc: number, t: any) => acc + t.amount, 0);
  const expenses = transactions.filter((t: any) => t.type === 'expense').reduce((acc: number, t: any) => acc + t.amount, 0);
  const savingsRatio = income > 0 ? ((income - expenses) / income) * 100 : 0;
  const score = Math.min(950, 400 + (savingsRatio * 3) + (habits.reduce((acc: number, h: any) => acc + h.streak, 0) * 5) + (goals.length * 20));

  return (
    <div className="space-y-12 pb-24">
      <header>
        <h1 className="text-4xl font-black text-white tracking-tighter">Wealth Insights</h1>
        <p className="text-slate-400 font-medium text-lg mt-1">Deep analysis of your financial trajectories and patterns.</p>
      </header>

      {/* Hero Analytics Block */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass min-w-0 rounded-[3rem] p-10 border border-white/5 relative overflow-hidden"
        >
          <div className="flex justify-between items-center mb-12">
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-widest">Health Score</h3>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1">Universal Financial Performance</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-2xl">
              <Brain size={28} className="text-indigo-400" />
            </div>
          </div>
          
          <div className="flex items-center justify-center pt-4 pb-12">
            <div className="relative w-56 h-56 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle cx="112" cy="112" r="100" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="16" />
                <circle cx="112" cy="112" r="100" fill="transparent" stroke="url(#scoreGradAn)" strokeWidth="16" strokeDasharray={628} strokeDashoffset={628 - (628 * (score/1000))} strokeLinecap="round" />
                <defs>
                  <linearGradient id="scoreGradAn" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-6xl font-black text-white tracking-tighter"
                >
                  {Math.round(score)}
                </motion.span>
                <div className="flex items-center gap-2 mt-2">
                  <Star size={14} className="text-indigo-400" />
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em]">Optimized</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }} 
          className="glass min-w-0 p-10 rounded-[3rem] border border-white/5 flex flex-col"
        >
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-10 text-center">Capital Allocation Pool</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '10px' }}
                />
                <Legend iconType="circle" formatter={(v) => <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{v}</span>} />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Net Worth Timeline */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="glass min-w-0 p-10 rounded-[3rem] border border-white/5 relative overflow-hidden"
      >
        <div className="flex justify-between items-start mb-10">
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Wealth Progression Vector</h3>
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1">Multi-cycle financial accumulation analysis</p>
          </div>
          <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-indigo-400 shadow-inner">
            <History size={20} />
          </div>
        </div>
        <div className="h-[350px] w-full">
          {wealthHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={wealthHistory.map(h => ({ name: h.date, netWorth: h.net_worth }))}>
                <defs>
                  <linearGradient id="colorNetWorthTimeline" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip 
                  contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '10px', fontWeight: 900 }}
                />
                <Area type="monotone" dataKey="netWorth" stroke="#6366f1" strokeWidth={5} fillOpacity={1} fill="url(#colorNetWorthTimeline)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center flex-col space-y-4">
              <Info size={32} className="text-slate-700" />
              <p className="text-slate-600 font-bold uppercase tracking-widest text-[10px]">Data synchronization required for projection.</p>
            </div>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }} 
          className="glass min-w-0 p-10 rounded-[3rem] border border-white/5"
        >
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-10">Expenditure Delta</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip 
                   cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                   contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
                />
                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? "#6366f1" : "rgba(99,102,241,0.2)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass p-10 rounded-[3rem] border border-white/5">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-10">Neural Efficiency Matrix</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <EfficiencyCard 
              label="Savings Velocity" 
              value={`${savingsRatio.toFixed(1)}%`} 
              icon={<Target />} 
              color="indigo" 
            />
            <EfficiencyCard 
              label="Habit Consistency" 
              value={`${Math.round(habits.reduce((acc: any, h: any)=>acc+h.streak, 0)/Math.max(1, habits.length))}%`} 
              icon={<Zap />} 
              color="amber" 
            />
            <EfficiencyCard 
              label="Asset Growth" 
              value="+15.4%" 
              icon={<TrendingUp />} 
              color="emerald" 
            />
            <EfficiencyCard 
              label="Protocol Integrity" 
              value="Validated" 
              icon={<Activity />} 
              color="blue" 
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function EfficiencyCard({ label, value, icon, color }: any) {
  return (
    <div className="glass p-6 rounded-[2rem] border border-white/5 group hover:border-white/10 transition-all">
      <div className={cn(
        "w-10 h-10 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 shadow-inner",
        color === 'indigo' && "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
        color === 'amber' && "bg-amber-500/10 text-amber-400 border border-amber-500/20",
        color === 'emerald' && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
        color === 'blue' && "bg-blue-500/10 text-blue-400 border border-blue-500/20"
      )}>
        {React.cloneElement(icon, { size: 18 })}
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">{label}</p>
      <p className="text-xl font-black text-white tracking-tighter">{value}</p>
    </div>
  );
}
