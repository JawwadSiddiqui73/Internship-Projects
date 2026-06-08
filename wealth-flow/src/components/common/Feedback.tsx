import React from "react";
import { motion } from "motion/react";
import { Info, Plus } from "lucide-react";
import { cn } from "../../lib/utils";

export function Skeleton({ className, style }: { className?: string, style?: React.CSSProperties, key?: React.Key }) {
  return (
    <div 
      className={cn("animate-pulse bg-white/5 rounded-2xl", className)} 
      style={style}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="glass p-8 rounded-[2rem] border border-white/5 space-y-4">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-12 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="glass p-8 rounded-[3rem] border border-white/5 space-y-8">
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
      <div className="h-[300px] flex items-end gap-2 pb-4">
        {[...Array(12)].map((_, i) => (
          <Skeleton 
            key={i} 
            className="flex-1" 
            style={{ height: `${Math.random() * 80 + 20}%` }} 
          />
        ))}
      </div>
    </div>
  );
}

export function EmptyState({ 
  title, 
  description, 
  actionLabel, 
  onAction,
  icon: Icon = Info
}: { 
  title: string; 
  description: string; 
  actionLabel?: string; 
  onAction?: () => void;
  icon?: any;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-12 text-center glass rounded-[3rem] border border-dashed border-white/10"
    >
      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 mb-6">
        <Icon size={32} />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm max-w-xs mx-auto mb-8">{description}</p>
      {actionLabel && onAction && (
        <button 
          onClick={onAction}
          className="accent-gradient px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-white flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-500/10"
        >
          <Plus size={16} />
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}
