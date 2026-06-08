import React, { useState, useEffect, useMemo } from "react";
import { Plus, Target, Calendar, ArrowRight, MoreHorizontal, Trophy, Loader2, Sparkles, AlertCircle, Clock, Trash2 } from "lucide-react";
import { api } from "../lib/api";
import { formatCurrency, cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import toast from "react-hot-toast";

import { EmptyState, Skeleton } from "../components/common/Feedback";

export default function SavingsGoals() {
  const [goals, setGoals] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({ name: "", target_amount: "", deadline: "" });
  const [updatingGoal, setUpdatingGoal] = useState<any>(null);
  const [updateAmount, setUpdateAmount] = useState("");

  const fetchGoals = async () => {
    try {
      const data = await api.goals.list();
      setGoals(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.goals.create(formData);
      toast.success("Strategic vault initialized");
      setFormData({ name: "", target_amount: "", deadline: "" });
      setIsModalOpen(false);
      fetchGoals();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingGoal) return;
    try {
      await api.goals.update(updatingGoal.id, { current_amount: Number(updateAmount) });
      toast.success("Allocation verified");
      setUpdatingGoal(null);
      setUpdateAmount("");
      fetchGoals();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Decommission this vault? Funds will be reabsorbed.")) return;
    try {
      await api.goals.delete(id);
      toast.success("Vault decommissioned");
      fetchGoals();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getDaysRemaining = (deadline: string) => {
    const diff = new Date(deadline).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  if (isLoading) return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div className="space-y-4">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-14 w-48 rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass rounded-[3.5rem] p-10 border border-white/5 space-y-8">
            <div className="flex gap-4">
              <Skeleton className="h-16 w-16 rounded-3xl" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex justify-between">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-6 w-1/4" />
              </div>
              <Skeleton className="h-4 w-full rounded-full" />
              <Skeleton className="h-14 w-full rounded-[2rem]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-12 pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-widest uppercase flex items-center gap-4">
            Savings Goals
            <Target className="text-indigo-500" size={28} />
          </h1>
          <p className="text-slate-500 font-medium mt-1">Set and track your future financial milestones.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-3 accent-gradient text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:scale-[1.02] transition-all active:scale-95 text-xs"
        >
          <Plus size={18} />
          Start New Goal
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <AnimatePresence mode="popLayout">
          {goals.map((goal, idx) => {
            const progress = (goal.current_amount / goal.target_amount) * 100;
            const remaining = Math.max(0, goal.target_amount - goal.current_amount);
            const daysLeft = getDaysRemaining(goal.deadline);
            
            return (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.1 }}
                key={goal.id} 
                className="glass rounded-[3.5rem] border border-white/5 p-10 shadow-2xl relative overflow-hidden group hover:border-white/10 transition-all flex flex-col"
              >
                <div className="absolute top-0 right-0 p-12 opacity-5 -mr-6 -mt-6 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700">
                  <Target size={180} />
                </div>

                <div className="flex justify-between items-start mb-10 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="p-5 bg-white/[0.04] text-indigo-400 rounded-3xl border border-white/5 shadow-inner">
                      <Target size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white tracking-tight uppercase group-hover:text-indigo-400 transition-colors">{goal.name}</h3>
                      <div className="flex items-center gap-2 text-slate-600 font-black uppercase tracking-[0.2em] text-[9px] mt-1">
                        <Clock size={12} className="text-indigo-500/50" />
                        {daysLeft} Days Remaining
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleDelete(goal.id)}
                      className="p-3 text-slate-800 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                <div className="space-y-8 flex-1 relative z-10">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none">Saved So Far</p>
                      <p className="text-3xl font-black text-white tabular-nums tracking-tighter">{formatCurrency(goal.current_amount)}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none">Goal Amount</p>
                      <p className="text-lg font-bold text-white/30 tabular-nums">/ {formatCurrency(goal.target_amount)}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="w-full bg-white/[0.02] h-4 rounded-full overflow-hidden border border-white/5 p-1 relative">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, progress)}%` }}
                        transition={{ duration: 1.5, ease: "circOut", delay: 0.5 }}
                        className={cn(
                          "absolute inset-1 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.3)]",
                          progress >= 100 ? "bg-emerald-500" : "accent-gradient"
                        )}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                      <span className={cn(
                        "px-3 py-1.5 rounded-full border",
                        progress >= 100 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                      )}>
                        {Math.round(progress)}% COMPLETED
                      </span>
                      {remaining > 0 ? (
                        <span className="text-slate-600">Left: {formatCurrency(remaining)}</span>
                      ) : (
                        <span className="text-emerald-400 flex items-center gap-2">
                          <Sparkles size={14} className="animate-pulse" /> Goal Reached!
                        </span>
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={() => { setUpdatingGoal(goal); setUpdateAmount(goal.current_amount); }}
                    className="w-full mt-6 py-5 rounded-[2rem] bg-white/[0.04] border border-white/5 text-white font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white hover:text-slate-900 transition-all active:scale-95 shadow-xl hover:shadow-white/5"
                  >
                    Add Money to Goal
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {goals.length === 0 && (
          <div className="col-span-full">
            <EmptyState 
              title="No active objectives" 
              description="Define your financial horizons. Each milestone is a vector towards ultimate capital freedom."
              actionLabel="Start New Goal"
              onAction={() => setIsModalOpen(true)}
              icon={Target}
            />
          </div>
        )}
      </div>

      {/* Strategic Insights */}
      {goals.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-10 rounded-[3rem] border border-white/5 flex flex-col md:flex-row items-center gap-10 bg-indigo-500/5"
        >
          <div className="w-20 h-20 rounded-[2rem] bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 border border-indigo-500/20">
            <Sparkles size={32} />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-black text-white uppercase tracking-widest mb-2">Savings Advice</h4>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">To reach your goals on time, you need to save about <span className="text-white font-bold">{formatCurrency((goals.reduce((acc, g) => acc + (g.target_amount - g.current_amount), 0)) / 12)}</span> every month. You are currently on track!</p>
          </div>
          <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white hover:text-slate-900 transition-all">
            Recalculate
          </button>
        </motion.div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="glass rounded-[4rem] w-full max-w-lg overflow-hidden shadow-[0_0_100px_rgba(99,102,241,0.2)] border border-white/10"
          >
            <div className="p-12 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-widest">New Savings Goal</h2>
                <p className="text-[10px] text-slate-700 font-black uppercase tracking-[0.3em] mt-1">Set a new target for your future</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-700 hover:text-white transition-colors p-2">
                <Plus size={32} className="rotate-45" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-12 space-y-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-700 ml-4">Goal Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="E.G. NEW CAR OR VACATION"
                  className="w-full px-8 py-5 bg-white/[0.02] border border-white/5 rounded-[2rem] text-sm font-black text-white focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-800 uppercase tracking-widest"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-700 ml-4">Target Amount (₹)</label>
                  <input 
                    type="number" 
                    required
                    value={formData.target_amount}
                    onChange={(e) => setFormData({...formData, target_amount: e.target.value})}
                    placeholder="100000"
                    className="w-full px-8 py-5 bg-white/[0.02] border border-white/5 rounded-[2rem] text-sm font-black text-white focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-800 tabular-nums"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-700 ml-4">Target Date</label>
                  <input 
                    type="date" 
                    required
                    value={formData.deadline}
                    onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                    className="w-full px-8 py-5 bg-white/[0.02] border border-white/5 rounded-[2rem] text-xs font-black text-white focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
                  />
                </div>
              </div>
              <button type="submit" className="w-full accent-gradient text-white py-6 rounded-[2.5rem] font-black uppercase tracking-[0.4em] shadow-2xl shadow-indigo-500/20 active:scale-[0.98] transition-all mt-6 text-sm">
                Create Goal
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Update Modal */}
      {updatingGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="glass rounded-[3.5rem] w-full max-w-lg overflow-hidden shadow-[0_0_100px_rgba(99,102,241,0.2)] border border-white/10"
          >
            <div className="p-12 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-widest text-center">Protocol Recalibration</h2>
                <p className="text-[10px] text-slate-700 font-black uppercase tracking-[0.3em] mt-1 text-center">{updatingGoal.name}</p>
              </div>
              <button onClick={() => setUpdatingGoal(null)} className="text-slate-700 hover:text-white transition-colors p-2">
                <Plus size={32} className="rotate-45" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-12 space-y-10">
              <div className="space-y-4">
                <label className="text-center block text-[10px] font-black uppercase tracking-[0.4em] text-slate-700">Accumulated Cumulative Capital</label>
                <input 
                  type="number" 
                  required
                  autoFocus
                  value={updateAmount}
                  onChange={(e) => setUpdateAmount(e.target.value)}
                  className="w-full px-10 py-8 bg-white/[0.04] border border-white/5 rounded-[3rem] text-4xl font-black text-white focus:ring-2 focus:ring-indigo-500 outline-none text-center tabular-nums shadow-inner"
                />
                <div className="flex items-center gap-3 justify-center text-slate-600 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                  <AlertCircle size={16} className="text-amber-500" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-center">Verify the adjusted total reserve for this objective.</p>
                </div>
              </div>
              <button type="submit" className="w-full accent-gradient text-white py-6 rounded-[2.5rem] font-black uppercase tracking-[0.4em] shadow-2xl shadow-indigo-500/20 active:scale-[0.98] transition-all text-sm">
                Authorize Allocation
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
