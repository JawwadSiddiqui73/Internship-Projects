export interface UserRow {
  id: number;
  name: string;
  email: string;
  password?: string;
  monthly_income: number;
  savings_target: number;
  financial_goals: string | null;
  is_admin: number;
  reminder_active: number;
  reminder_time: string;
  created_at: string;
}

export interface TransactionRow {
  id: number;
  user_id: number;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
  description: string | null;
}

export interface HabitRow {
  id: number;
  user_id: number;
  name: string;
  streak: number;
  frequency: string;
  last_completed: string | null;
}

export interface GoalRow {
  id: number;
  user_id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
}

export interface InvestmentRow {
  id: number;
  user_id: number;
  name: string;
  type: string;
  initial_amount: number;
  current_amount: number;
  date: string;
}

export interface NotificationRow {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  is_read: number;
  created_at: string;
}
