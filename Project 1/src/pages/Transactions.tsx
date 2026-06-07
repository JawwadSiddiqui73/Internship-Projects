import React, { useState, useEffect } from "react";
import { 
  Receipt, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  TrendingDown,
  TrendingUp,
  X,
  Calendar,
  Loader2,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { api } from "../lib/api";
import { toast } from "react-hot-toast";

const CATEGORIES = ["Housing", "Food", "Transport", "Utilities", "Healthcare", "Entertainment", "Shopping", "Income", "Investment", "Others"];

export default function Transactions() {
  const [data, setData] = useState<any>({ transactions: [], totalCount: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
    category: "",
    type: "",
    startDate: "",
    endDate: ""
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTx, setNewTx] = useState({
    type: "expense",
    category: "Others",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    description: ""
  });

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await api.transactions.list(filters);
      setData({
        transactions: Array.isArray(response?.transactions) ? response.transactions : [],
        totalCount: response?.totalCount || 0,
        totalPages: response?.totalPages || 0
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      await api.transactions.delete(id);
      toast.success("Transaction purged from registry");
      fetchTransactions();
    } catch (error) {
      toast.error("Deletion failed");
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.transactions.create({
        ...newTx,
        amount: Number(newTx.amount)
      });
      toast.success("Transaction recorded");
      setShowAddModal(false);
      fetchTransactions();
    } catch (error) {
      toast.error("Failed to record transaction");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
  };

  return (
    <div className="space-y-8 pb-24">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter">Transaction Ledger</h1>
          <p className="text-slate-400 font-medium">Monitoring financial transmissions across the network.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowAddModal(true)}
            className="accent-gradient px-8 py-3 rounded-2xl text-white font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-indigo-500/20 active:scale-95 transition-all"
          >
            <Plus size={16} />
            Record Transaction
          </button>
        </div>
      </header>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        <form onSubmit={handleSearch} className="relative flex-1 w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
          <input
            type="text"
            placeholder="Search by description or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full glass pl-14 pr-8 py-4 rounded-2xl text-white font-medium focus:ring-2 focus:ring-indigo-500 outline-none border border-white/5"
          />
        </form>
        <div className="flex gap-3 w-full lg:w-auto">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "glass px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all",
              showFilters ? "bg-white/10 text-white" : "text-slate-500"
            )}
          >
            <Filter size={16} />
            Filters
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="glass rounded-[2.5rem] border border-white/5 overflow-hidden"
          >
            <div className="p-8 grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Type</label>
                <select 
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value, page: 1 }))}
                  className="w-full glass px-6 py-3 rounded-xl text-white text-xs font-bold outline-none border border-white/5 appearance-none"
                >
                  <option value="">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Category</label>
                <select 
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value, page: 1 }))}
                  className="w-full glass px-6 py-3 rounded-xl text-white text-xs font-bold outline-none border border-white/5"
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Start Date</label>
                <input 
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value, page: 1 }))}
                  className="w-full glass px-6 py-3 rounded-xl text-white text-xs font-bold outline-none border border-white/5"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">End Date</label>
                <input 
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value, page: 1 }))}
                  className="w-full glass px-6 py-3 rounded-xl text-white text-xs font-bold outline-none border border-white/5"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="glass rounded-[3rem] border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Signal</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Description</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Category</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Amount</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Timeline</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-8 py-6 h-20 bg-white/[0.01]" />
                  </tr>
                ))
              ) : data.transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-24 text-center">
                    <div className="space-y-4">
                      <div className="w-16 h-16 rounded-2xl glass mx-auto flex items-center justify-center text-slate-700">
                        <Receipt size={32} />
                      </div>
                      <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">No transaction signals captured.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.transactions.map((t: any) => (
                  <tr key={t.id} className="group hover:bg-white/[0.01] transition-colors">
                    <td className="px-8 py-6">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        t.type === 'income' ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                      )}>
                        {t.type === 'income' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-white font-bold text-sm">{t.description || "System Transmission"}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 rounded-full bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {t.category}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <p className={cn("font-black text-base tabular-nums", t.type === 'income' ? "text-emerald-400" : "text-white")}>
                        {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-slate-500 font-mono text-[10px] uppercase font-black">
                        <Calendar size={12} />
                        {t.date}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => handleDelete(t.id)}
                        className="p-2 rounded-lg hover:bg-rose-500/10 text-slate-700 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-8 bg-white/[0.01] border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Scanning result {((filters.page - 1) * filters.limit) + 1} to {Math.min(filters.page * filters.limit, data.totalCount)} of {data.totalCount}
          </p>
          <div className="flex items-center gap-2">
            <button 
              disabled={filters.page === 1}
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
              className="w-10 h-10 rounded-xl glass flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            {[...Array(data.totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setFilters(prev => ({ ...prev, page: i + 1 }))}
                className={cn(
                  "w-10 h-10 rounded-xl font-black text-xs transition-all",
                  filters.page === i + 1 ? "accent-gradient text-white" : "glass text-slate-500 hover:text-white"
                )}
              >
                {i + 1}
              </button>
            ))}
            <button 
              disabled={filters.page === data.totalPages}
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
              className="w-10 h-10 rounded-xl glass flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-xl glass p-10 rounded-[3rem] border border-white/10">
              <h2 className="text-2xl font-black text-white tracking-tighter mb-8 uppercase italic">Signal Injection</h2>
              <form onSubmit={handleAdd} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Type</label>
                    <div className="flex gap-2 p-1 bg-white/[0.02] rounded-2xl border border-white/5">
                      {['income', 'expense'].map(t => (
                        <button key={t} type="button" onClick={() => setNewTx(prev => ({ ...prev, type: t }))} className={cn(
                          "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                          newTx.type === t ? "accent-gradient text-white shadow-lg" : "text-slate-600 hover:text-white"
                        )}>{t}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Category</label>
                    <select value={newTx.category} onChange={(e) => setNewTx(prev => ({ ...prev, category: e.target.value }))} className="w-full glass px-6 py-4 rounded-xl text-white text-xs font-bold outline-none border border-white/5">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Quantum Amount</label>
                  <input type="number" step="0.01" required value={newTx.amount} onChange={(e) => setNewTx(prev => ({ ...prev, amount: e.target.value }))} className="w-full glass px-8 py-5 rounded-2xl text-white font-black text-2xl focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-700" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Timeline Timestamp</label>
                  <input type="date" required value={newTx.date} onChange={(e) => setNewTx(prev => ({ ...prev, date: e.target.value }))} className="w-full glass px-8 py-4 rounded-2xl text-white font-bold outline-none border border-white/5" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Description Logic</label>
                  <input type="text" required value={newTx.description} onChange={(e) => setNewTx(prev => ({ ...prev, description: e.target.value }))} className="w-full glass px-8 py-4 rounded-2xl text-white font-medium outline-none border border-white/5" placeholder="Reason for transmission..." />
                </div>
                <button type="submit" className="w-full accent-gradient py-6 rounded-2xl text-white font-black uppercase tracking-[0.3em] text-xs shadow-xl shadow-indigo-500/20 active:scale-[0.98] transition-all mt-4">
                  Authorize Protocol
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
