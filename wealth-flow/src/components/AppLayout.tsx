import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Receipt, 
  CheckCircle2, 
  Target, 
  BarChart3, 
  Settings, 
  LogOut,
  TrendingUp,
  ShieldCheck,
  Bell,
  MessageSquare,
  FileText,
  Menu,
  X,
  User as UserIcon
} from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Transactions", icon: Receipt, path: "/transactions" },
  { name: "Habits", icon: CheckCircle2, path: "/habits" },
  { name: "Savings Goals", icon: Target, path: "/goals" },
  { name: "Wealth Insights", icon: BarChart3, path: "/analytics" },
  { name: "Reports", icon: FileText, path: "/reports" },
  { name: "Notifications", icon: Bell, path: "/notifications" },
  { name: "Feedback", icon: MessageSquare, path: "/feedback" },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const SidebarContent = () => (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-8">
        <Link to="/" className="flex items-center gap-3 font-bold text-2xl text-white tracking-tight">
          <div className="w-10 h-10 rounded-xl accent-gradient flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <TrendingUp size={24} />
          </div>
          <span>WealthFlow</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar" aria-label="Main Navigation">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            aria-label={item.name}
            className={cn(
              "flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-300 group",
              location.pathname === item.path 
                ? "bg-white/10 text-white shadow-xl shadow-black/10" 
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <item.icon size={20} className={cn(
              "transition-colors",
              location.pathname === item.path ? "text-indigo-400" : "text-slate-500 group-hover:text-indigo-400"
            )} />
            <span className="font-semibold text-sm">{item.name}</span>
          </Link>
        ))}
        
        {user?.is_admin === 1 && (
          <Link
            to="/admin"
            aria-label="Admin Panel"
            className={cn(
              "flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-300 group mt-6",
              location.pathname === "/admin" 
                ? "bg-white/10 text-white shadow-xl shadow-black/10" 
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <ShieldCheck size={20} className={cn(
              "transition-colors",
              location.pathname === "/admin" ? "text-purple-400" : "text-slate-500 group-hover:text-purple-400"
            )} />
            <span className="font-semibold text-sm">Admin Panel</span>
          </Link>
        )}
      </nav>

      <div className="p-6 border-t border-white/5 bg-white/[0.01]">
        <Link 
          to="/profile" 
          aria-label="User Settings"
          className="flex items-center gap-3 px-2 py-2 mb-4 hover:bg-white/5 rounded-2xl transition-colors group"
        >
          <div className="w-9 h-9 rounded-full accent-gradient flex items-center justify-center text-white font-bold text-xs shadow-inner">
            {user?.name?.[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{user?.name}</p>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider truncate">Settings</p>
          </div>
          <Settings size={14} className="text-slate-500 group-hover:text-white transition-colors" />
        </Link>
        <button 
          onClick={logout}
          aria-label="Sign Out"
          className="w-full flex items-center gap-3 px-5 py-3 rounded-2xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all font-bold text-xs"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-slate-950 text-white overflow-hidden p-0 lg:p-6 lg:gap-6">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 glass rounded-[2.5rem] flex-col h-full shadow-2xl shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between p-6 glass border-b border-white/5 z-20">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-white tracking-tight">
          <TrendingUp size={24} className="text-indigo-500" />
          <span>WealthFlow</span>
        </Link>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-10 h-10 glass rounded-xl flex items-center justify-center text-slate-400 border border-white/10"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="fixed inset-0 bg-slate-950/95 z-40 lg:hidden p-6"
          >
            <div className="h-full glass rounded-[2.5rem] border border-white/10 relative">
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-6 right-6 w-10 h-10 glass rounded-full flex items-center justify-center text-slate-400"
              >
                <X size={20} />
              </button>
              <SidebarContent />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-auto custom-scrollbar relative px-6 lg:px-0">
        <div className="max-w-6xl mx-auto py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
