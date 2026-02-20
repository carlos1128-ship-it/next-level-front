export type DetailLevel = "low" | "medium" | "high";

export interface DashboardSummary {
  revenue: number;
  conversion: number;
  cac: number;
  retention: number;
  lineData: Array<{ name: string; Vendas: number; Picos?: number }>;
  pieData: Array<{ name: string; value: number }>;
}

export interface TransactionItem {
  id: string;
  type: "revenue" | "expense";
  description: string;
  amount: number;
  createdAt: string;
  category?: string;
}

export interface Company {
  id?: string;
  _id?: string;
  name: string;
  sector?: string;
  status?: string;
}

export interface UserProfile {
  id?: string;
  name?: string;
  email?: string;
  detailLevel?: DetailLevel;
  theme?: "light" | "dark";
}
