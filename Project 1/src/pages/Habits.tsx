import React, { useState, useEffect, useMemo } from "react";
import { Plus, Check, Flame, Trophy, Loader2, Sparkles, Zap, Brain, Target } from "lucide-react";
import { api } from "../lib/api";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import toast from "react-hot-toast";

import { EmptyState, Skeleton } from "../components/common/Feedback";

export default function Habits() {
  const [habits, setHabits] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({ name: "", frequency: "daily" });

  const fetchHabits = async () => {
    try {
      const data = await api.habits.list();
      setHabits(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.habits.create(formData);
      toast.success("Habit protocol initiated");
      setFormData({ name: "", frequency: "daily" });
      setIsModalOpen(false);
      fetchHabits();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const completeHabit = async (id: number) => {
    try {
      await api.habits.complete(id);
      toast.success("Action verified");
      fetchHabits();
    } catch (error: any) {
      toast.error("Already verified for today");
    }
  };

  const consistencyIndex = useMemo(() => {
    if (habits.length === 0) return 0;
    const completedToday = habits.filter(h => h.last_completed === new Date().toISOString().split('T')[0]).length;
    return Math.round((completedToday / habits.length) * 100);
  }, [habits]);

  const maxStreak = useMemo(() => {
    return habits.length > 0 ? Math.max(0, ...habits.map(h => h.streak)) : 0;
  }, [habits]);

  if (isLoading) return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div className="space-y-4">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-14 w-40 rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 rounded-[3.5rem]" />)}
      </div>
      <div className="space-y-8">
        <Skeleton className="h-6 w-1/4 mx-auto" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 rounded-[3rem]" />)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-12 pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-widest uppercase flex items-center gap-4">
            Financial Habits
            <Brain className="text-indigo-500" size={28} />
          </h1>
          <p className="text-slate-500 font-medium mt-1">Track your daily financial rituals and stay consistent.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-3 accent-gradient text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:scale-[1.02] transition-all active:scale-95 text-xs"
        >
          <Plus size={18} />
          Add Habit
        </button>
      </header>

      {/* Global Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: "Completion Rate", value: `${consistencyIndex}%`, icon: Zap, color: "from-blue-500 to-indigo-700", desc: "Daily habits done" },
          { label: "Best Streak", value: `${maxStreak} Days`, icon: Flame, color: "from-orange-500 to-rose-600", desc: "Longest active streak" },
          { label: "Badge Level", value: "Beginner", icon: Trophy, color: "from-purple-500 to-fuchsia-600", desc: "Your progress level" }
        ].map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
            className={cn("p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden bg-gradient-to-br", stat.color)}
          >
            <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12 -mr-4 -mt-4">
              <stat.icon size={160} />
            </div>
            <div className="bg-white/20 p-4 rounded-2xl w-fit mb-8 relative z-10 backdrop-blur-md border border-white/10">
              <stat.icon size={32} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60 relative z-10 mb-2">{stat.label}</p>
            <h3 className="text-4xl font-black tracking-tighter relative z-10 mb-1">{stat.value}</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 relative z-10">{stat.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Habits Grid */}
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-white/5" />
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Your Habits</h3>
          <div className="h-px flex-1 bg-white/5" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {habits.map((habit, idx) => {
            const isCompleted = habit.last_completed === new Date().toISOString().split('T')[0];
            return (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={habit.id} 
                className={cn(
                  "p-10 rounded-[3rem] border transition-all duration-700 relative overflow-hidden group shadow-2xl",
                  isCompleted 
                    ? "bg-emerald-500/[0.02] border-emerald-500/20" 
                    : "glass border-white/5 hover:border-white/10"
                )}
              >
                {isCompleted && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-0 right-0 p-8 opacity-5 text-emerald-400 group-hover:rotate-12 transition-transform"
                  >
                    <Trophy size={140} />
                  </motion.div>
                )}
                
                <div className="flex justify-between items-start mb-10 relative z-10">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all",
                        isCompleted ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-slate-500 group-hover:bg-indigo-500/10 group-hover:text-indigo-400"
                      )}>
                        {habit.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-black text-white text-lg tracking-tight group-hover:text-indigo-400 transition-colors uppercase">{habit.name}</h4>
                        <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">{habit.frequency} cadence</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-white/[0.02] text-orange-400 px-4 py-2 rounded-2xl text-xs font-black border border-white/5 shadow-inner">
                    <Flame size={18} className="animate-pulse" /> {habit.streak}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/[0.02] relative z-10">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Status</span>
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest",
                      isCompleted ? "text-emerald-500" : "text-yellow-500/50"
                    )}>
                      {isCompleted ? "Done for Today" : "Waiting for You"}
                    </span>
                  </div>
                  <button 
                    disabled={isCompleted}
                    onClick={() => completeHabit(habit.id)}
                    className={cn(
                      "w-16 h-16 rounded-[2rem] flex items-center justify-center transition-all active:scale-90 shadow-2xl border-4",
                      isCompleted 
                        ? "bg-emerald-500 text-white border-emerald-500/20 shadow-emerald-500/20" 
                        : "bg-white/[0.03] border-white/5 text-slate-500 hover:text-white hover:bg-indigo-600 hover:border-indigo-500 hover:shadow-indigo-500/20"
                    )}
                  >
                    {isCompleted ? <Sparkles size={28} /> : <Check size={28} />}
                  </button>
                </div>
              </motion.div>
            );
          })}
          {habits.length === 0 && (
            <div className="col-span-full">
              <EmptyState 
                title="No active protocols" 
                description="Atomic actions are the building blocks of global wealth. Initiate your first behavioural protocol."
                actionLabel="Add Habit"
                onAction={() => setIsModalOpen(true)}
                icon={Brain}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modal - Polished */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="glass rounded-[4rem] w-full max-w-lg overflow-hidden shadow-[0_0_100px_rgba(99,102,241,0.2)] border border-white/10"
          >
            <div className="p-12 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-widest">Append Protocol</h2>
                <p className="text-[10px] text-slate-700 font-black uppercase tracking-[0.3em] mt-1">Behavioural Habit Initiation</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-700 hover:text-white transition-colors p-2">
                <Plus size={32} className="rotate-45" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-12 space-y-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-700 ml-4">Descriptor</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="E.G. CAPITAL REINVESTMENT"
                  className="w-full px-8 py-5 bg-white/[0.02] border border-white/5 rounded-[2rem] text-sm font-black text-white focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-800 uppercase tracking-widest"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-700 ml-4">Frequency Spectrum</label>
                <div className="grid grid-cols-3 gap-4 bg-white/[0.02] p-2 rounded-[2rem] border border-white/5">
                  {['daily', 'weekly', 'monthly'].map(f => (
                    <button 
                      key={f}
                      type="button"
                      onClick={() => setFormData({...formData, frequency: f})}
                      className={cn(
                        "py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all",
                        formData.frequency === f ? "accent-gradient text-white shadow-xl" : "text-slate-700 hover:text-white"
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full accent-gradient text-white py-6 rounded-[2.5rem] font-black uppercase tracking-[0.4em] shadow-2xl shadow-indigo-500/20 active:scale-[0.98] transition-all mt-6 text-sm">
                Commit Protocol
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
