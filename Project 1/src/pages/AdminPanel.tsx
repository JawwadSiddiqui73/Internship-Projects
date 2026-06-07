import React, { useState, useEffect } from "react";
import { 
  Users, 
  Settings, 
  Trash2, 
  ShieldCheck, 
  Activity, 
  CheckCircle2, 
  Clock, 
  MessageSquare,
  Search,
  ChevronLeft,
  ChevronRight,
  Monitor,
  TrendingUp,
  Target,
  Rocket,
  Loader2,
  MoreVertical
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { api } from "../lib/api";
import { toast } from "react-hot-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

export default function AdminPanel() {
  const [stats, setStats] = useState<any>(null);
  const [usersData, setUsersData] = useState<any>({ users: [], totalCount: 0, totalPages: 0 });
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [userFilters, setUserFilters] = useState({ page: 1, limit: 10, search: "" });

  useEffect(() => {
    fetchStats();
    fetchFeedback();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [userFilters]);

  const fetchStats = async () => {
    try {
      const data = await api.admin.getStats();
      setStats(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await api.admin.getUsers(userFilters);
      setUsersData(data);
    } catch (error) {
      console.error(error);
    } finally {
      if (activeTab === "users") setLoading(false);
    }
  };

  const fetchFeedback = async () => {
    try {
      const data = await api.feedback.list();
      setFeedback(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: number) => {
    if (!confirm("Are you certain? This action is irreversible.")) return;
    try {
      await api.admin.deleteUser(id);
      toast.success("User identity purged from system");
      fetchUsers();
    } catch (error) {
      toast.error("Deletion protocol failed");
    }
  };

  const updateFeedbackStatus = async (id: number, status: string) => {
    try {
      await api.feedback.updateStatus(id, { status });
      toast.success(`Status updated to ${status}`);
      fetchFeedback();
    } catch (error) {
      toast.error("Status update failed");
    }
  };

  if (loading && !stats) return (
    <div className="h-screen flex flex-col items-center justify-center space-y-6">
      <Loader2 className="animate-spin text-indigo-500" size={48} />
      <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-xs underline underline-offset-8">Initializing Admin Hub...</p>
    </div>
  );

  return (
    <div className="space-y-12 pb-24">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-4">
            <Monitor className="text-indigo-500" size={32} />
            Command Center
          </h1>
          <p className="text-slate-400 font-medium text-lg mt-1">Universal protocol oversight and system telemetry.</p>
        </div>
        <div className="glass flex p-1.5 rounded-2xl border border-white/5">
          {["overview", "users", "feedback"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === tab ? "bg-indigo-500 text-white shadow-xl shadow-indigo-500/20" : "text-slate-500 hover:text-white"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {activeTab === "overview" && stats && (
        <div className="space-y-12">
          {/* High-Level Telemetry */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatBlock label="Total Identities" value={stats.totalUsers} icon={<Users />} trend="+4.2%" />
            <StatBlock label="Transmissions" value={stats.totalTransactions} icon={<Activity />} trend="+12.8%" />
            <StatBlock label="Capital Managed" value={`$${(stats.totalInvested + stats.totalSaved).toLocaleString()}`} icon={<TrendingUp />} trend="+8.5%" />
            <StatBlock label="Habit Velocity" value={stats.habitCompletion} icon={<ShieldCheck />} trend="+3.1%" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="glass min-w-0 p-10 rounded-[3rem] border border-white/5"
            >
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-10">Identity Growth Trends</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.userGrowth ? [...stats.userGrowth].reverse() : []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="date" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                    <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={4} dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass p-10 rounded-[3rem] border border-white/5">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-10">Feedback Pulse</h3>
              <div className="space-y-6">
                {stats.recentFeedback?.map((f: any) => (
                  <div key={f.id} className="flex gap-4 items-start p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-indigo-400">
                      <MessageSquare size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-xs flex justify-between">
                        {f.user_name}
                        <span className="text-[10px] text-slate-500 uppercase">{f.status}</span>
                      </p>
                      <p className="text-slate-400 text-[10px] mt-1 line-clamp-2">{f.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
              <input 
                type="text" 
                placeholder="Synchronize user search..." 
                value={userFilters.search}
                onChange={(e) => setUserFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                className="w-full glass pl-14 pr-8 py-4 rounded-2xl text-white font-medium focus:ring-2 focus:ring-indigo-500 outline-none border border-white/5"
              />
            </div>
          </div>

          <div className="glass rounded-[3rem] border border-white/5 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Identity</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Protocol Email</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Clearance</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Created At</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Sanction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(usersData?.users || []).map((u: any) => (
                  <tr key={u.id} className="group hover:bg-white/[0.01] transition-colors">
                    <td className="px-8 py-6">
                      <p className="text-white font-black text-sm">{u.name}</p>
                    </td>
                    <td className="px-8 py-6 text-slate-400 font-mono text-xs">{u.email}</td>
                    <td className="px-8 py-6">
                      {u.is_admin ? (
                        <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-[9px] font-black uppercase tracking-widest border border-indigo-500/20 flex items-center w-fit gap-1">
                          <ShieldCheck size={10} /> Admin Hub
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-white/5 text-slate-500 text-[9px] font-black uppercase tracking-widest">Operational</span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-slate-500 text-[10px] uppercase font-black">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="px-8 py-6 text-right">
                      {!u.is_admin && (
                        <button onClick={() => deleteUser(u.id)} className="p-2 rounded-lg hover:bg-rose-500/10 text-slate-700 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="p-8 bg-white/[0.01] border-t border-white/5 flex justify-between items-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Identities captured: {usersData.totalCount}</p>
              <div className="flex items-center gap-2">
                <button 
                  disabled={userFilters.page === 1} 
                  onClick={() => setUserFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                  className="w-10 h-10 rounded-xl glass flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-[10px] font-black text-white px-4">Cycle {userFilters.page} of {usersData.totalPages}</span>
                <button 
                  disabled={userFilters.page === usersData.totalPages} 
                  onClick={() => setUserFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                  className="w-10 h-10 rounded-xl glass flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "feedback" && (
        <div className="glass rounded-[3rem] border border-white/5 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Origin</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Spectrum</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Information Payload</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Resolve</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {feedback.map((f: any) => (
                <tr key={f.id} className="group hover:bg-white/[0.01] transition-colors">
                  <td className="px-8 py-6 text-white font-bold text-sm">{f.user_name}</td>
                  <td className="px-8 py-6">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Rocket key={i} size={10} className={i < f.rating ? "text-indigo-400" : "text-slate-800"} fill={i < f.rating ? "currentColor" : "none"} />
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-slate-300 text-xs w-[300px] line-clamp-2">{f.message}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                      f.status === 'pending' ? "bg-amber-500/10 text-amber-400" : 
                      f.status === 'reviewed' ? "bg-indigo-500/10 text-indigo-400" : "bg-emerald-500/10 text-emerald-400"
                    )}>
                      {f.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => updateFeedbackStatus(f.id, 'reviewed')} className="p-2 rounded-lg glass text-slate-500 hover:text-indigo-400 transition-colors tooltip" title="Review">
                        <Activity size={14} />
                      </button>
                      <button onClick={() => updateFeedbackStatus(f.id, 'resolved')} className="p-2 rounded-lg glass text-slate-500 hover:text-emerald-400 transition-colors tooltip" title="Resolve">
                        <CheckCircle2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatBlock({ label, value, icon, trend }: any) {
  return (
    <div className="glass p-8 rounded-[2.5rem] border border-white/5 relative group overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-5 -mr-4 -mt-4 group-hover:scale-110 transition-transform">
        {React.cloneElement(icon, { size: 80 })}
      </div>
      <div className="flex justify-between items-start mb-6">
        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-indigo-400 shadow-inner">
          {React.cloneElement(icon, { size: 20 })}
        </div>
        {trend && (
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">{label}</p>
        <h3 className="text-2xl font-black text-white tracking-tighter">{value}</h3>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
