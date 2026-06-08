import React, { useState, useEffect } from "react";
import { TrendingUp, Plus, Trash2, PieChart, Activity, DollarSign, Calendar, Loader2 } from "lucide-react";
import { api } from "../lib/api";
import { formatCurrency, cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import toast from "react-hot-toast";

import { EmptyState, Skeleton } from "../components/common/Feedback";

export default function Investments() {
  const [investments, setInvestments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "stocks",
    initial_amount: "",
    current_amount: "",
    date: new Date().toISOString().split('T')[0],
  });

  const fetchInvestments = async () => {
    try {
      const data = await api.investments.list();
      setInvestments(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.investments.create({
        ...formData,
        initial_amount: parseFloat(formData.initial_amount),
        current_amount: parseFloat(formData.current_amount),
      });
      toast.success("Investment added");
      setShowAddModal(false);
      setFormData({ name: "", type: "stocks", initial_amount: "", current_amount: "", date: new Date().toISOString().split('T')[0] });
      fetchInvestments();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      await api.investments.delete(id);
      toast.success("Investment removed");
      fetchInvestments();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const totalValue = investments.reduce((sum, inv) => sum + inv.current_amount, 0);
  const totalProfit = investments.reduce((sum, inv) => sum + (inv.current_amount - inv.initial_amount), 0);
  const profitPercentage = investments.reduce((sum, inv) => sum + inv.initial_amount, 0) > 0 
    ? (totalProfit / investments.reduce((sum, inv) => sum + inv.initial_amount, 0)) * 100 
    : 0;

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
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-44 rounded-[2rem]" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-[2rem]" />)}
        </div>
        <Skeleton className="h-64 rounded-[2.5rem]" />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Investments</h1>
          <p className="text-slate-400 font-medium">See how your investments grow over time.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="accent-gradient px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-white shadow-xl shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2"
        >
          <Plus size={16} /> Add Asset
        </button>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8 rounded-[2rem] border border-white/5 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 -mr-4 -mt-4 group-hover:scale-110 transition-transform">
            <DollarSign size={80} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Total Invested</p>
          <p className="text-3xl font-black text-white tracking-tighter">{formatCurrency(totalValue)}</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass p-8 rounded-[2rem] border border-white/5 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 -mr-4 -mt-4 group-hover:scale-110 transition-transform">
            <TrendingUp size={80} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Net Growth</p>
          <p className={cn("text-3xl font-black tracking-tighter", totalProfit >= 0 ? "text-emerald-400" : "text-rose-400")}>
            {totalProfit >= 0 ? "+" : ""}{formatCurrency(totalProfit)}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass p-8 rounded-[2rem] border border-white/5 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 -mr-4 -mt-4 group-hover:scale-110 transition-transform">
            <Activity size={80} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Return on Investment</p>
          <p className={cn("text-3xl font-black tracking-tighter", profitPercentage >= 0 ? "text-emerald-400" : "text-rose-400")}>
            {profitPercentage >= 0 ? "+" : ""}{profitPercentage.toFixed(2)}%
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-slate-600 ml-4">Your Investments</h2>
          <div className="space-y-4">
            {investments.length === 0 ? (
              <EmptyState 
                title="Portfolio Empty" 
                description="Strategic capital allocation detected as zero. Initiate your first asset to build wealth."
                actionLabel="Add Asset"
                onAction={() => setShowAddModal(true)}
                icon={TrendingUp}
              />
            ) : (
              investments.map((inv, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={inv.id}
                  className="glass p-6 rounded-[2rem] border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-white/[0.03] rounded-2xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform border border-white/5">
                      {inv.type === 'stocks' && <TrendingUp size={24} />}
                      {inv.type === 'crypto' && <Activity size={24} />}
                      {inv.type === 'real_estate' && <DollarSign size={24} />}
                    </div>
                    <div>
                      <h3 className="text-white font-black">{inv.name}</h3>
                      <div className="flex gap-4 mt-1">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{inv.type}</p>
                        <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">{inv.date}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-12">
                    <div className="text-right">
                      <p className="text-white font-black tracking-tighter">{formatCurrency(inv.current_amount)}</p>
                      <p className={cn("text-[10px] font-black uppercase tracking-widest mt-1", inv.current_amount >= inv.initial_amount ? "text-emerald-500" : "text-rose-500")}>
                        {inv.current_amount >= inv.initial_amount ? "+" : ""}{((inv.current_amount - inv.initial_amount) / inv.initial_amount * 100).toFixed(1)}%
                      </p>
                    </div>
                    <button 
                      onClick={() => handleDelete(inv.id)}
                      className="text-slate-600 hover:text-rose-500 p-2 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-slate-600 ml-4">Diversification</h2>
          <div className="glass p-8 rounded-[2.5rem] border border-white/5 text-center">
            <PieChart size={64} className="mx-auto text-indigo-500 mb-6 opacity-20" />
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              Spread your money across different types of investments to reduce risk.
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass max-w-md w-full rounded-[3rem] border border-white/10 p-10 relative"
            >
              <h2 className="text-2xl font-black text-white tracking-tight mb-8 text-center uppercase tracking-widest">Add Investment</h2>
              <form onSubmit={handleAdd} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Asset Name</label>
                  <input 
                    type="text" 
                    required 
                    autoFocus
                    placeholder="Apple Inc, Bitcoin, etc."
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-6 py-4 bg-white/[0.03] border border-white/5 rounded-2xl text-sm font-bold text-white focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Category</label>
                  <select 
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    className="w-full px-6 py-4 bg-[#0F172A] border border-white/5 rounded-2xl text-sm font-bold text-white focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                  >
                    <option value="stocks">Stocks</option>
                    <option value="crypto">Crypto</option>
                    <option value="real_estate">Real Estate</option>
                    <option value="others">Other</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Invested Amount</label>
                    <input 
                      type="number" 
                      required 
                      placeholder="5000"
                      value={formData.initial_amount}
                      onChange={e => setFormData({...formData, initial_amount: e.target.value})}
                      className="w-full px-6 py-4 bg-white/[0.03] border border-white/5 rounded-2xl text-sm font-bold text-white focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Current Value</label>
                    <input 
                      type="number" 
                      required 
                      placeholder="6500"
                      value={formData.current_amount}
                      onChange={e => setFormData({...formData, current_amount: e.target.value})}
                      className="w-full px-6 py-4 bg-white/[0.03] border border-white/5 rounded-2xl text-sm font-bold text-white focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Date</label>
                  <input 
                    type="date" 
                    required 
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full px-6 py-4 bg-[#0F172A] border border-white/5 rounded-2xl text-sm font-bold text-white focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 accent-gradient py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-500/20 active:scale-95 transition-all"
                  >
                    Save Investment
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
