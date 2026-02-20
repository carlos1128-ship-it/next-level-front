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
  return (await api.get<Partial<DashboardSummary>>("/dashboard/summary")).data;
}

export async function getTransactions() {
  return (await api.get<TransactionItem[]>("/financial/transactions")).data;
}

export async function createTransaction(payload: {
  type: "revenue" | "expense";
  amount: number;
  description: string;
  category?: string;
  manual?: boolean;
}) {
  return (await api.post<TransactionItem>("/financial/transactions", payload)).data;
}

export async function getCompanies() {
  const data = (await api.get<Company[] | { companies?: Company[] }>("/companies")).data;
  const companies = Array.isArray(data)
    ? data
    : Array.isArray((data as { companies?: Company[] })?.companies)
      ? (data as { companies?: Company[] }).companies
      : [];

  return companies.filter((company) => Boolean(extractCompanyId(company)));
}

export async function createCompany(payload: { name: string; sector?: string }) {
  const data = (
    await api.post<Company | { company?: Company; data?: Company }>("/companies", payload)
  ).data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    if ((data as { company?: Company }).company) return (data as { company: Company }).company;
    if ((data as { data?: Company }).data) return (data as { data: Company }).data;
  }
  return data as Company;
}

export async function analyzeData(payload: unknown, detailLevel: DetailLevel) {
  return (
    await api.post<{ analysis?: string; insight?: string; message?: string } | string>(
      "/ai/analyze",
      { data: payload, detailLevel }
    )
  ).data;
}

export async function getUserProfile() {
  return (await api.get<UserProfile>("/profile")).data;
}

export async function updateUserProfile(payload: Partial<UserProfile>) {
  return (await api.patch<UserProfile>("/profile", payload)).data;
}

export async function changePassword(payload: {
  currentPassword: string;
  newPassword: string;
}) {
  try {
    return (await api.patch("/profile/password", payload)).data;
  } catch {
    return (await api.patch("/profile/change-password", payload)).data;
  }
}

export async function chatWithAi(payload: {
  message: string;
  detailLevel: DetailLevel;
}) {
  return (
    await api.post<{ response?: string; message?: string } | string>("/chat", payload)
  ).data;
}

export async function exportFinancialCsv() {
  return apiDownload("/export/financial");
}
