import { Link, useNavigate } from "react-router-dom";
import { TrendingUp, Shield, Brain, BarChart2, Zap, ArrowRight, Github } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-indigo-500/30 overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[180px] -mr-96 -mt-96 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-rose-600/5 rounded-full blur-[180px] -ml-48 -mb-48" />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#020617]/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 font-black text-2xl tracking-tighter">
            <div className="w-10 h-10 accent-gradient rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <TrendingUp size={24} />
            </div>
            <span>WealthFlow<span className="text-indigo-500">.</span></span>
          </div>
          <div className="flex items-center gap-8">
            <Link to="/login" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Sign In</Link>
            <Link to="/register" className="accent-gradient px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:scale-[1.02] transition-all active:scale-95">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Version 2.0 Now Live
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9] mb-8"
          >
            Manage Wealth With <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-white to-blue-400">Easy Habits.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium leading-relaxed"
          >
            Take control of your money by tracking your habits and net worth. 
            Stay consistent and grow your wealth effortlessly with our smart tools.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button 
              onClick={() => navigate("/register")}
              className="accent-gradient px-10 py-5 rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/40 hover:scale-[1.05] transition-all active:scale-95"
            >
              Get Started Now
            </button>
            <button className="glass px-10 py-5 rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] border border-white/5 hover:bg-white/10 transition-all">
              Learn More
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              title: "Smart Habit Tracker", 
              desc: "Build good financial habits that lead to big wealth growth over time.", 
              icon: Zap,
              color: "text-indigo-400"
            },
            { 
              title: "Savings Goals", 
              desc: "Set and track your savings goals with easy-to-read progress charts.", 
              icon: Shield,
              color: "text-emerald-400"
            },
            { 
              title: "Detailed Reports", 
              desc: "See exactly where your money goes with clear charts and reports.", 
              icon: BarChart2,
              color: "text-rose-400"
            }
          ].map((item, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              key={item.title}
              className="glass p-10 rounded-[3rem] border border-white/5 hover:border-white/10 transition-all group"
            >
              <div className={cn("p-4 bg-white/[0.03] w-fit rounded-2xl mb-8 group-hover:scale-110 transition-transform", item.color)}>
                <item.icon size={32} />
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight mb-4">{item.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Social Proof / Footer-lite */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 mb-8">Trusted by next-gen wealth builders globally</p>
          <div className="flex flex-wrap justify-center gap-12 opacity-30 grayscale hover:grayscale-0 transition-all">
            <span className="text-xl font-black">FORTUNE</span>
            <span className="text-xl font-black">BLOOMBERG</span>
            <span className="text-xl font-black">REUTERS</span>
            <span className="text-xl font-black">WIRED</span>
          </div>
        </div>
      </section>
    </div>
  );
}
