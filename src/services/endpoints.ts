import { api, apiDownload } from "./api";
import type {
  Company,
  DashboardSummary,
  DetailLevel,
  TransactionItem,
  UserProfile,
} from "../types/domain";

function extractCompanyId(company: Partial<Company> | null | undefined) {
  return company?.id || company?._id || null;
}

export async function getDashboardSummary() {
  const { data } = await api.get<Partial<DashboardSummary>>("/dashboard/summary");
  return data;
}

export async function getTransactions(companyId?: string) {
  const endpoint = companyId ? `/finance/${companyId}` : "/finance";
  const { data } = await api.get<TransactionItem[]>(endpoint);
  return data;
}

export async function createTransaction(payload: {
  type: "income" | "expense";
  amount: number;
  description: string;
  category?: string;
  manual?: boolean;
}) {
  const { data } = await api.post<{
    transaction: TransactionItem;
    totalIncome: number;
    totalExpense: number;
    balance: number;
    transactionsCount: number;
  }>("/finance", payload);
  return data;
}

export async function getCompanies() {
  const { data } = await api.get<Company | Company[] | { companies?: Company[]; company?: Company }>(
    "/companies"
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
  description?: string;
}) {
  const { data } = await api.post<Company | { company?: Company; data?: Company }>("/companies", payload);
  if (data && typeof data === "object" && !Array.isArray(data)) {
    if ((data as { company?: Company }).company) return (data as { company: Company }).company;
    if ((data as { data?: Company }).data) return (data as { data: Company }).data;
  }
  return data as Company;
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
  message: string;
  detailLevel: DetailLevel;
}) {
  const { data } = await api.post<{ response?: string; message?: string } | string>("/chat", payload);
  return data;
}

export async function exportFinancialCsv() {
  return apiDownload("/export/financial");
}
