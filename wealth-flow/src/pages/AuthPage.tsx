import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TrendingUp, Mail, Lock, User, ArrowRight, Github } from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { api } from "../lib/api";
import { motion } from "motion/react";

export default function AuthPage({ mode = "login" }: { mode?: "login" | "register" }) {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = mode === "login" 
        ? await api.auth.login({ email: formData.email, password: formData.password })
        : await api.auth.register(formData);
      
      login(response);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#020617]">
      {/* Background Orbs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-rose-600/10 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-[3rem] w-full max-w-md overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/5 relative z-10"
      >
        <div className="p-10 border-b border-white/5 text-center">
          <div className="w-16 h-16 accent-gradient rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/20 rotate-3 group transition-all hover:rotate-0">
            <TrendingUp className="text-white group-hover:scale-110 transition-transform" size={32} />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-slate-500 text-sm mt-3 font-medium">
            {mode === "login" ? "Login to manage your money." : "Start your journey to wealth today."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center"
            >
              {error}
            </motion.div>
          )}
          
          {mode === "register" && (
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
              <div className="relative">
                <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" />
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="John Doe"
                  className="w-full pl-14 pr-6 py-4 bg-white/[0.03] border border-white/5 rounded-2xl text-sm font-bold text-white focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-700 transition-all shadow-inner"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" />
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="name@example.com"
                className="w-full pl-14 pr-6 py-4 bg-white/[0.03] border border-white/5 rounded-2xl text-sm font-bold text-white focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-700 transition-all font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" />
              <input 
                type="password" 
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="••••••••"
                className="w-full pl-14 pr-6 py-4 bg-white/[0.03] border border-white/5 rounded-2xl text-sm font-bold text-white focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-700 transition-all font-mono"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full accent-gradient text-white py-5 rounded-2xl font-black uppercase tracking-[0.25em] shadow-xl shadow-indigo-500/20 active:scale-95 transition-all text-xs mt-4 disabled:opacity-50 flex items-center justify-center gap-2 group"
          >
            {isLoading ? "Checking..." : (mode === "login" ? "Login" : "Create Account")}
            {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </button>

          <p className="text-center text-[10px] font-black uppercase tracking-widest text-slate-500">
            {mode === "login" ? "No access yet?" : "Already verified?"}
            <Link 
              to={mode === "login" ? "/register" : "/login"} 
              className="text-white ml-2 hover:underline decoration-indigo-500 underline-offset-4"
            >
              {mode === "login" ? "Register" : "Sign In"}
            </Link>
          </p>
        </form>

        <div className="p-8 bg-white/[0.01] border-t border-white/5 text-center">
          <p className="text-[9px] text-slate-700 font-black uppercase tracking-[0.3em]">Secure Connection • Privacy Protected</p>
        </div>
      </motion.div>
    </div>
  );
}
