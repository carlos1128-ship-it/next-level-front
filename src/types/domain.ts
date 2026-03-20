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

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface Product {
  id: string;
  companyId: string;
  name: string;
  sku?: string | null;
  category?: string | null;
  price: number;
  cost?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  companyId: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OperationalCost {
  id: string;
  companyId: string;
  name: string;
  category?: string | null;
  amount: number;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export type IntegrationProvider = "WHATSAPP" | "INSTAGRAM" | "MERCADOLIVRE";

export interface IntegrationStatus {
  provider: IntegrationProvider;
  status: string;
  connected: boolean;
  externalId: string | null;
  updatedAt?: string | null;
}

export interface ForecastPoint {
  date: string;
  value: number;
}

export interface ForecastInterval {
  lower: number;
  upper: number;
  margin: number;
}

export interface ForecastResponse {
  status: "ok" | "insufficient_data";
  type: "SALES" | "DEMAND" | "REVENUE";
  historicalData?: ForecastPoint[];
  predictedData?: ForecastPoint[];
  confidenceInterval?: ForecastInterval;
  accuracyScore?: number;
  generatedAt?: string;
  message?: string;
}

export type StrategicActionType = "MARKETING" | "ESTOQUE" | "FINANCEIRO";
export type StrategicActionStatus = "SUGGESTED" | "APPROVED" | "EXECUTED" | "REJECTED";

export interface StrategicAction {
  id: string;
  companyId: string;
  title: string;
  description: string;
  type: StrategicActionType;
  status: StrategicActionStatus;
  impactScore: number;
  payload: any;
  createdAt: string;
}

export type MarketBadge = 'sem_dados' | 'competitivo' | 'acima';

export interface MarketComparison {
  productId: string;
  productName: string;
  internalPrice: number;
  marketAverage: number;
  gapPct: number;
  badge: MarketBadge;
}

export interface MarketTrend {
  id?: string;
  companyId?: string;
  term: string;
  volume: number;
  growthPercentage: number;
  createdAt?: string;
}
