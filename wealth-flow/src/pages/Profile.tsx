import React, { useState, useEffect } from "react";
import { User, Mail, DollarSign, Target, Award, Save, Loader2, Bell, Clock } from "lucide-react";
import { api } from "../lib/api";
import { motion } from "motion/react";
import toast from "react-hot-toast";

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await api.profile.get();
      setProfile(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.profile.update(profile);
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <header>
        <h1 className="text-3xl font-bold text-white tracking-tight">System Settings</h1>
        <p className="text-slate-400 font-medium">Calibrating your personal financial protocol and identity.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-1 space-y-6"
        >
          <div className="glass rounded-[2rem] p-8 border border-white/5 text-center">
            <div className="w-24 h-24 accent-gradient rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <User size={48} className="text-white" />
            </div>
            <h2 className="text-xl font-black text-white">{profile?.name}</h2>
            <p className="text-slate-500 text-sm mb-6">{profile?.email}</p>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
              <Award size={14} />
              {profile?.is_admin ? "Elite Admin" : "Wealth Builder"}
            </div>
          </div>

          <div className="glass rounded-[2rem] p-8 border border-white/5">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-6 flex items-center gap-2">
              <Bell size={14} className="text-indigo-400" />
              Notifications
            </h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-slate-400 text-sm group-hover:text-white transition-colors">Daily Reminder</span>
                <div 
                  onClick={() => setProfile({...profile, reminder_active: !profile.reminder_active})}
                  className={cn(
                    "w-12 h-6 rounded-full p-1 transition-all duration-300",
                    profile.reminder_active ? "bg-indigo-500" : "bg-white/5 border border-white/10"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 bg-white rounded-full transition-all duration-300",
                    profile.reminder_active ? "translate-x-6" : "translate-x-0"
                  )} />
                </div>
              </label>
              {profile.reminder_active && (
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Clock size={12} /> Sync Time
                  </label>
                  <input 
                    type="time" 
                    value={profile.reminder_time}
                    onChange={(e) => setProfile({...profile, reminder_time: e.target.value})}
                    className="w-full px-4 py-2 bg-white/[0.03] border border-white/5 rounded-xl text-sm font-bold text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-2"
        >
          <form onSubmit={handleUpdate} className="glass rounded-[2.5rem] p-10 border border-white/5 space-y-8 shadow-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Legal Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" />
                  <input 
                    type="text" 
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    className="w-full pl-14 pr-6 py-4 bg-white/[0.03] border border-white/5 rounded-2xl text-sm font-bold text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2 opacity-50">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email (Read Only)</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" />
                  <input 
                    type="email" 
                    value={profile.email}
                    disabled
                    className="w-full pl-14 pr-6 py-4 bg-white/[0.03] border border-white/5 rounded-2xl text-sm font-bold text-white outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Monthly Income</label>
                <div className="relative">
                  <DollarSign size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" />
                  <input 
                    type="number" 
                    value={profile.monthly_income}
                    onChange={(e) => setProfile({...profile, monthly_income: parseFloat(e.target.value) || 0})}
                    className="w-full pl-14 pr-6 py-4 bg-white/[0.03] border border-white/5 rounded-2xl text-sm font-bold text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Target Savings per Month</label>
                <div className="relative">
                  <Target size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" />
                  <input 
                    type="number" 
                    value={profile.savings_target}
                    onChange={(e) => setProfile({...profile, savings_target: parseFloat(e.target.value) || 0})}
                    className="w-full pl-14 pr-6 py-4 bg-white/[0.03] border border-white/5 rounded-2xl text-sm font-bold text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Financial Goals</label>
              <textarea 
                value={profile.financial_goals || ""}
                onChange={(e) => setProfile({...profile, financial_goals: e.target.value})}
                placeholder="Where do you see yourself in 5 years?"
                className="w-full p-6 bg-white/[0.03] border border-white/5 rounded-2xl text-sm font-bold text-white focus:ring-2 focus:ring-indigo-500 outline-none min-h-[120px]"
              />
            </div>

            <button 
              type="submit"
              disabled={isSaving}
              className="w-full accent-gradient py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] text-white shadow-xl shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Authorize Protocol Changes
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
