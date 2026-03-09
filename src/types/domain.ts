export type DetailLevel = "low" | "medium" | "high";
export type DashboardPeriod = "today" | "yesterday" | "week" | "month" | "year";

export interface DashboardSummary {
  revenue: number;
  losses: number;
  profit: number;
  cashflow: number;
  companyCount: number;
  period: DashboardPeriod;
  lineData: Array<{ name: string; Receitas: number; Saidas: number }>;
  pieData: Array<{ name: string; value: number }>;
}

export interface TransactionItem {
  id: string;
  type: "income" | "expense";
  description: string;
  amount: number;
  date?: string;
  createdAt: string;
  category?: string;
}

export interface Company {
  id?: string;
  _id?: string;
  name: string;
  sector?: string;
  segment?: string;
  document?: string;
  description?: string;
  openedAt?: string;
  status?: string;
}

export interface UserProfile {
  id?: string;
  name?: string;
  email?: string;
  detailLevel?: DetailLevel;
  theme?: "light" | "dark";
  companyCount?: number;
}
