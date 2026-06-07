import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/AuthContext";
import AppLayout from "./components/AppLayout";

// Lazy loaded Pages
const LandingPage = lazy(() => import("./pages/LandingPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Transactions = lazy(() => import("./pages/Transactions"));
const Habits = lazy(() => import("./pages/Habits"));
const SavingsGoals = lazy(() => import("./pages/SavingsGoals"));
const WealthAnalytics = lazy(() => import("./pages/WealthAnalytics"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const Investments = lazy(() => import("./pages/Investments"));
const Profile = lazy(() => import("./pages/Profile"));
const Reports = lazy(() => import("./pages/Reports"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Feedback = lazy(() => import("./pages/Feedback"));
const GoalDetails = lazy(() => import("./pages/GoalDetails"));
const NotFound = lazy(() => import("./pages/NotFound"));
import { Toaster } from "react-hot-toast";

function LoadingFallback() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-950">
      <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
      <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">Initializing WealthFlow OS...</p>
    </div>
  );
}

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const { token, user, isLoading } = useAuth();
  
  if (isLoading) return <div className="h-screen flex items-center justify-center font-black text-slate-700 bg-[#020617] uppercase tracking-[0.5em] text-xs">Synchronizing Protocol...</div>;
  if (!token) return <Navigate to="/login" />;
  if (adminOnly && !user?.is_admin) return <Navigate to="/dashboard" />;

  return <AppLayout>{children}</AppLayout>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  if (token) return <Navigate to="/dashboard" />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0F172A',
              color: '#fff',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.05)',
              fontSize: '12px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            },
          }}
        />
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
            <Route path="/login" element={<PublicRoute><AuthPage mode="login" /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><AuthPage mode="register" /></PublicRoute>} />
            
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
            <Route path="/habits" element={<ProtectedRoute><Habits /></ProtectedRoute>} />
            <Route path="/goals" element={<ProtectedRoute><SavingsGoals /></ProtectedRoute>} />
            <Route path="/goals/:id" element={<ProtectedRoute><GoalDetails /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><WealthAnalytics /></ProtectedRoute>} />
            <Route path="/investments" element={<ProtectedRoute><Investments /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
            
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
}
