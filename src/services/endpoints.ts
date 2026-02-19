import { api, apiDownload } from "./api";
import type {
  Company,
  DashboardSummary,
  DetailLevel,
  TransactionItem,
  UserProfile,
} from "../types/domain";

export async function getDashboardSummary() {
  return (await api.get<Partial<DashboardSummary>>("/api/dashboard/summary")).data;
}

export async function getTransactions() {
  return (await api.get<TransactionItem[]>("/transactions")).data;
}

export async function createTransaction(payload: {
  type: "revenue" | "expense";
  amount: number;
  description: string;
  category?: string;
  manual?: boolean;
}) {
  return (await api.post<TransactionItem>("/transactions", payload)).data;
}

export async function getCompanies() {
  return (await api.get<Company[]>("/companies")).data;
}

export async function createCompany(payload: { name: string; sector?: string }) {
  return (await api.post<Company>("/companies", payload)).data;
}

export async function analyzeData(payload: unknown, detailLevel: DetailLevel) {
  return (
    await api.post<{ analysis?: string; insight?: string; message?: string } | string>(
      "/api/ai/analyze",
      { data: payload, detailLevel }
    )
  ).data;
}

export async function getUserProfile() {
  return (await api.get<UserProfile>("/api/user/profile")).data;
}

export async function updateUserProfile(payload: Partial<UserProfile>) {
  return (await api.patch<UserProfile>("/api/user/profile", payload)).data;
}

export async function changePassword(payload: {
  currentPassword: string;
  newPassword: string;
}) {
  try {
    return (await api.patch("/api/user/password", payload)).data;
  } catch {
    return (await api.patch("/api/user/change-password", payload)).data;
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
  return apiDownload("/api/export/financial");
}
