import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  MessageSquare, 
  Send, 
  Star, 
  Sparkles,
  Heart,
  Lightbulb,
  Bug,
  Smile
} from "lucide-react";
import { api } from "../lib/api";
import { toast } from "react-hot-toast";

export default function Feedback() {
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSending(true);
    try {
      await api.feedback.submit({ rating, message });
      toast.success("Feedback submitted successfully. Thank you!");
      setMessage("");
      setRating(5);
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit feedback");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-12 pb-24">
      <header className="text-center space-y-4">
        <div className="inline-flex p-4 rounded-3xl bg-indigo-500/10 text-indigo-400 mb-2">
          <MessageSquare size={32} />
        </div>
        <h1 className="text-4xl font-black text-white tracking-tighter">Shape WealthFlow</h1>
        <p className="text-slate-400 font-medium max-w-lg mx-auto">
          Your insights drive our protocol evolution. Report bugs, suggest features, or share your experience.
        </p>
      </header>

      <motion.form 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="glass p-12 rounded-[3.5rem] border border-white/5 space-y-10 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Sparkles size={120} />
        </div>

        <div className="space-y-6">
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">Overall Experience</label>
          <div className="flex justify-between gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={cn(
                  "flex-1 py-6 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all border",
                  rating === star 
                    ? "bg-indigo-500/10 border-indigo-500/50 text-indigo-400 scale-[1.02] shadow-xl shadow-indigo-500/10" 
                    : "glass border-white/5 text-slate-600 hover:text-slate-400"
                )}
              >
                <Star size={24} fill={rating >= star ? "currentColor" : "none"} strokeWidth={rating >= star ? 0 : 2} />
                <span className="text-[10px] font-black uppercase tracking-widest">{star}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">Detailed Insight</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What's on your mind? Be descriptive..."
            className="w-full glass p-8 rounded-3xl text-white font-medium focus:ring-2 focus:ring-indigo-500 outline-none min-h-[200px] border border-white/5 placeholder:text-slate-700"
            required
          />
        </div>

        <button
          type="submit"
          disabled={sending || !message.trim()}
          className="w-full accent-gradient py-6 rounded-3xl text-white font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {sending ? (
            <span className="flex items-center gap-2">
              <Smile className="animate-bounce" size={20} />
              Transmitting...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Send size={20} />
              Submit Feedback
            </span>
          )}
        </button>
      </motion.form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-8 rounded-[2rem] border border-white/5 flex flex-col items-center text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
            <Bug size={24} />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm">Report Bugs</h3>
            <p className="text-slate-500 text-xs mt-1">Help us eliminate glitches within the system.</p>
          </div>
        </div>
        <div className="glass p-8 rounded-[2rem] border border-white/5 flex flex-col items-center text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Lightbulb size={24} />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm">New Features</h3>
            <p className="text-slate-500 text-xs mt-1">Suggest mechanics to improve your wealth growth.</p>
          </div>
        </div>
        <div className="glass p-8 rounded-[2rem] border border-white/5 flex flex-col items-center text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Heart size={24} />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm">Success Stories</h3>
            <h3 className="text-white font-bold text-sm">Success Stories</h3>
            <p className="text-slate-500 text-xs mt-1">We love hearing how WealthFlow changed your life.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
