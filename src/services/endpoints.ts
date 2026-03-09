import api from "./api";
import type {
  Company,
  DashboardPeriod,
  DashboardSummary,
  DetailLevel,
  TransactionItem,
  UserProfile,
} from "../types/domain";

function extractCompanyId(company: Partial<Company> | null | undefined) {
  return company?.id || company?._id || null;
}

function normalizeTransaction(transaction: any): TransactionItem {
  const rawType = String(transaction?.type || "").toLowerCase();
  const normalizedDate =
    transaction?.date || transaction?.occurredAt || transaction?.createdAt || new Date().toISOString();
  return {
    ...transaction,
    type: rawType === "income" ? "income" : "expense",
    amount: Number(transaction?.amount || 0),
    date: normalizedDate,
    createdAt: transaction?.createdAt || normalizedDate,
  } as TransactionItem;
}

export async function getDashboardSummary(params?: {
  companyId?: string | null;
  period?: DashboardPeriod;
}) {
  const { data } = await api.get<Partial<DashboardSummary>>("/dashboard/summary", {
    params: {
      companyId: params?.companyId || undefined,
      period: params?.period || undefined,
    },
  });
  return data;
}

export async function getTransactions(companyId?: string) {
  const { data } = await api.get<any[]>("/financial/transactions", {
    params: companyId ? { companyId } : undefined,
  });
  return Array.isArray(data) ? data.map((item) => normalizeTransaction(item)) : [];
}

export async function createTransaction(payload: {
  companyId: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  category?: string;
  date: string;
  manual?: boolean;
}) {
  const { data } = await api.post<{
    transaction: TransactionItem;
    totalIncome: number;
    totalExpense: number;
    balance: number;
    transactionsCount: number;
  }>("/financial/transactions", {
    ...payload,
    amount: Number(payload.amount),
    date: new Date(payload.date).toISOString(),
  });
  return {
    ...data,
    transaction: normalizeTransaction(data.transaction),
  };
}

export async function getCompanies() {
  const { data } = await api.get<Company | Company[] | { companies?: Company[]; company?: Company }>(
    "/company"
  );

  const companies = Array.isArray(data)
    ? data
    : data && typeof data === "object" && !Array.isArray(data) && extractCompanyId(data as Company)
      ? [data as Company]
      : Array.isArray((data as { companies?: Company[] })?.companies)
        ? (data as { companies?: Company[] }).companies
        : (data as { company?: Company })?.company && extractCompanyId((data as { company?: Company }).company)
          ? [(data as { company: Company }).company]
          : [];

  return companies.filter((company) => Boolean(extractCompanyId(company)));
}

export async function createCompany(payload: {
  name: string;
  userId?: string;
  sector?: string;
  segment?: string;
  document?: string;
  description?: string;
  openedAt?: string;
}) {
  const { data } = await api.post<Company | { company?: Company; data?: Company }>("/company", payload);
  const normalizedData =
    data && typeof data === "object" && !Array.isArray(data) && "company" in data
      ? (data as { company?: Company }).company || data
      : data;
  if (normalizedData && typeof normalizedData === "object" && !Array.isArray(normalizedData)) {
    if ((normalizedData as { company?: Company }).company) return (normalizedData as { company: Company }).company;
    if ((normalizedData as { data?: Company }).data) return (normalizedData as { data: Company }).data;
  }
  return normalizedData as Company;
}

export async function analyzeData(payload: unknown, detailLevel: DetailLevel) {
  const { data } = await api.post<{ analysis?: string; insight?: string; message?: string } | string>(
    "/ai/analyze",
    { data: payload, detailLevel }
  );
  return data;
}

export async function getUserProfile() {
  const { data } = await api.get<UserProfile>("/profile");
  return data;
}

export async function updateUserProfile(payload: Partial<UserProfile>) {
  const { data } = await api.patch<UserProfile>("/profile", payload);
  return data;
}

export async function changePassword(payload: {
  currentPassword: string;
  newPassword: string;
}) {
  try {
    const { data } = await api.patch("/profile/password", payload);
    return data;
  } catch {
    const { data } = await api.patch("/profile/change-password", payload);
    return data;
  }
}

export async function chatWithAi(payload: {
  companyId?: string;
  message: string;
  detailLevel: DetailLevel;
}) {
  try {
    const { data } = await api.post<{ response?: string; message?: string } | string>("/chat", payload);
    return data;
  } catch {
    // Compatibility fallback for environments still exposing AI chat in /ai/chat.
    const { data } = await api.post<{ response?: string; message?: string } | string>("/ai/chat", {
      message: payload.message,
      detailLevel: payload.detailLevel,
    });
    return data;
  }
}

export async function getFinancialReport(companyId: string) {
  const { data } = await api.get<{ income: number; expense: number; balance: number }>(
    "/financial/report",
    { params: { companyId } }
  );
  return data;
}

export async function deleteMyAccount() {
  const { data } = await api.delete<{ success: boolean }>("/profile");
  return data;
}

export async function exportFinancialCsv(params?: { companyId?: string | null }) {
  const { data } = await api.get<Blob>("/export/financial", {
    params: {
      companyId: params?.companyId || undefined,
    },
    responseType: "blob",
  });
  return data;
}
