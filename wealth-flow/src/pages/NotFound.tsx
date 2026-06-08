import React from "react";
import { Link } from "react-router-dom";
import { TrendingUp, Home, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-rose-600/10 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-8 relative z-10"
      >
        <div className="w-24 h-24 accent-gradient rounded-[2rem] flex items-center justify-center mx-auto mb-12 shadow-[0_0_50px_rgba(99,102,241,0.3)] animate-bounce">
          <TrendingUp size={48} className="text-white" />
        </div>
        
        <h1 className="text-9xl font-black tracking-tighter opacity-10 absolute -top-24 left-1/2 -translate-x-1/2 select-none">404</h1>
        
        <div className="space-y-4">
          <h2 className="text-5xl font-black tracking-tight">Page Not Found</h2>
          <p className="text-slate-500 font-medium max-w-sm mx-auto text-lg leading-relaxed">
            The page you are looking for has been moved or deleted.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Link 
            to="/" 
            className="accent-gradient px-10 py-5 rounded-3xl text-[10px] font-black uppercase tracking-[0.25em] text-white shadow-xl shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <Home size={18} />
            Back to Dashboard
          </Link>
          <Link 
            to={-1 as any}
            className="glass px-10 py-5 rounded-3xl text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 border border-white/5 hover:text-white transition-all flex items-center justify-center gap-3"
          >
            <ArrowLeft size={18} />
            Go Back
          </Link>
        </div>

        <div className="pt-12">
          <p className="text-[9px] text-slate-700 font-black uppercase tracking-[0.4em]">Error: PROTOCOL_NOT_FOUND • Sector 0x404</p>
        </div>
      </motion.div>
    </div>
  );
}
