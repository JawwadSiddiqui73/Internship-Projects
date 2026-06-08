import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Target, 
  ArrowLeft, 
  Plus, 
  History, 
  TrendingUp, 
  Calendar,
  DollarSign,
  ChevronRight,
  Loader2
} from "lucide-react";
import { api } from "../lib/api";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Contribution {
  id: number;
  amount: number;
  date: string;
}

interface Goal {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
}

export default function GoalDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAmount, setNewAmount] = useState("");
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const goals = await api.goals.list();
      const currentGoal = goals.find((g: Goal) => g.id === Number(id));
      if (!currentGoal) {
        toast.error("Goal not found");
        navigate("/goals");
        return;
      }
      setGoal(currentGoal);
      const contribs = await api.goals.getContributions(Number(id));
      setContributions(Array.isArray(contribs) ? contribs : []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load goal data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.goals.addContribution(Number(id), {
        amount: Number(newAmount),
        date: newDate
      });
      toast.success("Contribution added!");
      setShowAddModal(false);
      setNewAmount("");
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to add contribution");
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-indigo-500" size={48} />
        <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Processing Goal Matrix...</p>
      </div>
    );
  }

  if (!goal) return null;

  const progress = (goal.current_amount / goal.target_amount) * 100;
  
  // Chart data: current_amount over time
  const chartData = [...contributions]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .reduce((acc: any[], curr) => {
      const prevTotal = acc.length > 0 ? acc[acc.length - 1].total : 0;
      acc.push({
        date: format(new Date(curr.date), "MMM d"),
        amount: curr.amount,
        total: prevTotal + curr.amount
      });
      return acc;
    }, []);

  return (
    <div className="space-y-8 pb-12">
      <header className="flex items-center gap-6">
        <button 
          onClick={() => navigate("/goals")}
          className="w-12 h-12 rounded-2xl glass hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter">{goal.name}</h1>
          <div className="flex items-center gap-3 text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
            <Calendar size={12} />
            Target: {goal.deadline || "Ongoing"}
          </div>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="ml-auto accent-gradient px-8 py-3 rounded-2xl text-white font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-indigo-500/20 active:scale-95 transition-all"
        >
          <Plus size={16} />
          Contribute
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 min-w-0 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-10 rounded-[3rem] border border-white/5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
              <TrendingUp size={120} />
            </div>
            
            <div className="flex justify-between items-end mb-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Current Progress</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-white tracking-tighter">${goal.current_amount.toLocaleString()}</span>
                  <span className="text-slate-500 font-bold text-xl">/ ${goal.target_amount.toLocaleString()}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-4xl font-black text-indigo-400 tracking-tighter">{progress.toFixed(1)}%</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mt-1">Completion Status</p>
              </div>
            </div>

            <div className="h-6 w-full bg-white/5 rounded-3xl overflow-hidden mb-4 border border-white/[0.02]">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                className="h-full accent-gradient relative"
              >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
              </motion.div>
            </div>
            
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">
              <span>Genesis</span>
              <span>Financial Freedom</span>
            </div>
          </motion.div>

          <div className="glass p-8 rounded-[2.5rem] border border-white/5 h-[400px]">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-8 ml-1 flex items-center gap-2">
              <TrendingUp size={14} className="text-indigo-400" />
              Growth Timeline
            </h3>
            <div className="h-[300px] w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#475569" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                      dy={10}
                    />
                    <YAxis 
                      stroke="#475569" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(val) => `$${val}`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        background: '#0F172A', 
                        border: '1px solid rgba(255,255,255,0.1)', 
                        borderRadius: '16px',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="total" 
                      stroke="#6366f1" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorTotal)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-slate-600 font-bold uppercase tracking-widest text-[10px]">No growth data detected.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="glass rounded-[2.5rem] border border-white/5 overflow-hidden h-fit">
          <div className="p-8 border-b border-white/5 flex items-center gap-3 bg-white/[0.01]">
            <History className="text-indigo-400" size={18} />
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Contribution Log</h3>
          </div>
          <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
            {contributions.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">Empty Ledger</p>
              </div>
            ) : (
              contributions.map((c) => (
                <div key={c.id} className="p-6 flex items-center gap-4 group hover:bg-white/[0.02] transition-colors">
                  <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-emerald-400">
                    <Plus size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-black text-sm">+${c.amount.toLocaleString()}</p>
                    <p className="text-slate-500 font-mono text-[10px] mt-0.5">{c.date}</p>
                  </div>
                  <ChevronRight size={14} className="text-slate-700 group-hover:text-slate-400 transition-colors" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg glass p-10 rounded-[3rem] border border-white/10 shadow-2xl"
            >
              <h2 className="text-2xl font-black text-white tracking-tighter mb-8">Fuel Goal Progress</h2>
              <form onSubmit={handleAddContribution} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Contribution Amount</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-500">
                      <DollarSign size={18} />
                    </div>
                    <input
                      type="number"
                      required
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      className="w-full glass pl-14 pr-8 py-5 rounded-2xl text-white font-black text-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Transmission Date</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full glass px-8 py-5 rounded-2xl text-white font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full accent-gradient py-6 rounded-2xl text-white font-black uppercase tracking-[0.3em] text-xs shadow-xl shadow-indigo-500/20 active:scale-95 transition-all mt-4"
                >
                  Confirm Contribution
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
