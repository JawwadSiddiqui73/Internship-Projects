export interface User {
  id: number;
  name: string;
  email: string;
  monthly_income: number;
  savings_target: number;
  financial_goals: string | null;
  is_admin: number;
  reminder_active: number;
  reminder_time: string;
  created_at: string;
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: number;
  user_id: number;
  type: TransactionType;
  category: string;
  amount: number;
  date: string;
  description: string | null;
}

export interface Habit {
  id: number;
  user_id: number;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  streak: number;
  last_completed: string | null;
  created_at: string;
}

export interface Goal {
  id: number;
  user_id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  created_at: string;
}

export interface Investment {
  id: number;
  user_id: number;
  name: string;
  type: string;
  initial_amount: number;
  current_amount: number;
  date: string;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'goal' | 'streak';
  is_read: number;
  created_at: string;
}

export interface Feedback {
  id: number;
  user_id: number;
  user_name?: string;
  message: string;
  rating: number;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
}

export interface WealthSnapshot {
  id: number;
  user_id: number;
  net_worth: number;
  savings: number;
  investments: number;
  date: string;
}

export interface FinancialInsight {
  type: 'info' | 'warning' | 'success' | 'goal' | 'streak';
  title: string;
  message: string;
  impact?: string;
  suggestion?: string;
}
