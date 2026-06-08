import { 
  User, 
  Transaction, 
  Habit, 
  Goal, 
  Investment, 
  Notification, 
  Feedback,
  FinancialInsight
} from "../types";

const API_URL = "/api";

export const api = {
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    
    const contentType = response.headers.get("content-type");
    let data;
    
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { error: text || response.statusText };
    }

    if (!response.ok) {
      throw new Error(data.error || data.message || "Request failed");
    }
    
    return data;
  },

  auth: {
    login: (body: any) => api.request<{ token: string; user: User }>("/auth/login", { method: "POST", body: JSON.stringify(body) }),
    register: (body: any) => api.request<{ token: string; user: User }>("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  },
  
  profile: {
    get: () => api.request<User>("/profile"),
    update: (body: any) => api.request<{ success: boolean }>("/profile", { method: "PUT", body: JSON.stringify(body) }),
  },

  transactions: {
    list: (params: any = {}) => {
      const query = new URLSearchParams(params).toString();
      return api.request<{ transactions: Transaction[]; totalCount: number; totalPages: number }>(`/transactions?${query}`);
    },
    create: (body: any) => api.request<{ success: boolean }>("/transactions", { method: "POST", body: JSON.stringify(body) }),
    delete: (id: number) => api.request<{ success: boolean }>(`/transactions/${id}`, { method: "DELETE" }),
  },

  habits: {
    list: () => api.request<Habit[]>("/habits"),
    create: (body: any) => api.request<{ success: boolean }>("/habits", { method: "POST", body: JSON.stringify(body) }),
    complete: (id: number) => api.request<{ success: boolean }>(`/habits/${id}/complete`, { method: "POST" }),
  },

  goals: {
    list: () => api.request<Goal[]>("/goals"),
    create: (body: any) => api.request<{ success: boolean }>("/goals", { method: "POST", body: JSON.stringify(body) }),
    update: (id: number, body: any) => api.request<{ success: boolean }>(`/goals/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    delete: (id: number) => api.request<{ success: boolean }>(`/goals/${id}`, { method: "DELETE" }),
    getContributions: (id: number) => api.request<any[]>(`/goals/${id}/contributions`),
    addContribution: (id: number, body: any) => api.request<{ success: boolean }>(`/goals/${id}/contributions`, { method: "POST", body: JSON.stringify(body) }),
  },

  investments: {
    list: () => api.request<Investment[]>("/investments"),
    create: (body: any) => api.request<{ success: boolean }>("/investments", { method: "POST", body: JSON.stringify(body) }),
    update: (id: number, body: any) => api.request<{ success: boolean }>(`/investments/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    delete: (id: number) => api.request<{ success: boolean }>(`/investments/${id}`, { method: "DELETE" }),
  },

  notifications: {
    list: () => api.request<Notification[]>("/notifications"),
    markRead: (id: number) => api.request<{ success: boolean }>(`/notifications/${id}/read`, { method: "PATCH" }),
    markAllRead: () => api.request<{ success: boolean }>("/notifications/read-all", { method: "PATCH" }),
  },

  feedback: {
    list: () => api.request<Feedback[]>("/feedback"),
    submit: (body: any) => api.request<{ success: boolean }>("/feedback", { method: "POST", body: JSON.stringify(body) }),
    updateStatus: (id: number, body: any) => api.request<{ success: boolean }>(`/feedback/${id}/status`, { method: "PATCH", body: JSON.stringify(body) }),
  },

  insights: {
    get: () => api.request<FinancialInsight[]>("/insights"),
  },

  wealthHistory: {
    list: () => api.request<any[]>("/wealth-history"),
    snapshot: () => api.request<{ success: boolean }>("/wealth-history/snapshot", { method: "POST" }),
  },

  reports: {
    getMonthly: (month: string) => api.request<any>(`/reports/monthly?month=${month}`),
  },

  admin: {
    getStats: () => api.request<any>("/admin/stats"),
    getUsers: (params: any = {}) => {
      const query = new URLSearchParams(params).toString();
      return api.request<any>(`/admin/users?${query}`);
    },
    deleteUser: (id: number) => api.request<{ success: boolean }>(`/admin/users/${id}`, { method: "DELETE" }),
  },

  analytics: {
    get: () => api.request<{ transactions: Transaction[]; habits: Habit[]; goals: Goal[]; investments: Investment[] }>("/analytics"),
  },
};
