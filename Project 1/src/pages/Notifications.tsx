import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Bell, 
  Check, 
  Trash2, 
  Info, 
  AlertTriangle, 
  CheckCircle, 
  Target, 
  Zap,
  Clock,
  CheckCheck
} from "lucide-react";
import { api } from "../lib/api";
import { format } from "date-fns";
import { toast } from "react-hot-toast";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'goal' | 'streak';
  is_read: number;
  created_at: string;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await api.notifications.list();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await api.notifications.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (error) {
      console.error(error);
    }
  };

  const markAllRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      toast.success("All cleared");
    } catch (error) {
      console.error(error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="text-amber-400" size={20} />;
      case 'success': return <CheckCircle className="text-emerald-400" size={20} />;
      case 'goal': return <Target className="text-indigo-400" size={20} />;
      case 'streak': return <Zap className="text-yellow-400" size={20} />;
      default: return <Info className="text-blue-400" size={20} />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <header className="flex justify-between items-center bg-[#020617] sticky top-0 py-4 z-10">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Notification Center</h1>
          <p className="text-slate-400 font-medium">Protocol alerts and wealth milestone signals.</p>
        </div>
        <button 
          onClick={markAllRead}
          className="glass flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-bold text-xs hover:bg-white/10 transition-all"
        >
          <CheckCheck size={16} />
          Clear All
        </button>
      </header>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="glass h-24 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="glass p-24 rounded-[3rem] text-center flex flex-col items-center justify-center space-y-6">
          <div className="w-20 h-20 rounded-[2rem] bg-white/5 flex items-center justify-center text-slate-700">
            <Bell size={40} />
          </div>
          <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-xs">Awaiting New Signals</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {notifications.map((n) => (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "glass p-6 rounded-3xl border border-white/5 transition-all group flex items-start gap-5",
                  n.is_read ? "opacity-60" : "hover:scale-[1.01] hover:bg-white/[0.03]"
                )}
                onClick={() => !n.is_read && markAsRead(n.id)}
              >
                <div className="mt-1 flex-shrink-0">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5",
                    !n.is_read && "ring-2 ring-indigo-500/20"
                  )}>
                    {getTypeIcon(n.type)}
                  </div>
                </div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <h3 className={cn("font-bold text-base transition-colors", n.is_read ? "text-slate-400" : "text-white")}>
                      {n.title}
                    </h3>
                    <div className="flex items-center gap-2 text-slate-500 font-mono text-[10px]">
                      <Clock size={10} />
                      {format(new Date(n.created_at), "MMM d, HH:mm")}
                    </div>
                  </div>
                  <p className={cn("text-sm leading-relaxed", n.is_read ? "text-slate-500" : "text-slate-400")}>
                    {n.message}
                  </p>
                </div>

                {!n.is_read && (
                  <div className="self-center">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
