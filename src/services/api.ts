import axios, { AxiosError, AxiosHeaders, type AxiosRequestConfig } from "axios";

const env = import.meta.env as Record<string, string | undefined>;
const COMPANY_ID_STORAGE_KEY = "selectedCompanyId";

function normalizeBaseUrl(url: string) {
  const trimmed = url.replace(/\/+$/, "");
  return /\/api$/i.test(trimmed) ? trimmed : `${trimmed}/api`;
}

const runtimeApiUrl = env.VITE_API_URL || "";

const configuredApiUrl = runtimeApiUrl.trim();

export const API_URL = configuredApiUrl ? normalizeBaseUrl(configuredApiUrl) : "";

function normalizeEndpoint(endpoint: string) {
  const withSlash = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return withSlash.replace(/^\/api(?=\/|$)/i, "") || "/";
}

function endpointAllowsMissingCompany(endpoint: string) {
  const normalized = normalizeEndpoint(endpoint);
  return (
    normalized.startsWith("/auth") ||
    normalized.startsWith("/companies") ||
    normalized.startsWith("/company") ||
    normalized.startsWith("/profile")
  );
}

function extractBackendMessage(payload: unknown) {
  if (!payload || typeof payload !== "object") return null;
  const candidate = payload as Record<string, unknown>;
  if (typeof candidate.message === "string") return candidate.message;
  if (Array.isArray(candidate.message) && typeof candidate.message[0] === "string") {
    return candidate.message[0];
  }
  if (typeof candidate.error === "string") return candidate.error;
  if (typeof candidate.details === "string") return candidate.details;
  return null;
}

function buildApiError(error: AxiosError) {
  const responseData = error.response?.data;
  const responseStatus = error.response?.status;

  const message =
    extractBackendMessage(responseData) ||
    error.message ||
    (responseStatus ? `Erro na requisicao (${responseStatus}).` : "Erro na requisicao.");

  return new Error(message);
}

function getSelectedCompanyId() {
  return localStorage.getItem(COMPANY_ID_STORAGE_KEY);
}

if (!API_URL) {
  // Keep app booting, but requests will fail with explicit message in interceptor.
  console.warn("VITE_API_URL nao configurada.");
}

export const api = axios.create({
  baseURL: API_URL || undefined,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (!API_URL) {
    throw new Error("VITE_API_URL nao configurada.");
  }

  const token = localStorage.getItem("token");
  const selectedCompanyId = getSelectedCompanyId();
  const endpoint = normalizeEndpoint(config.url || "/");

  config.headers = new AxiosHeaders(config.headers);
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  if (selectedCompanyId) {
    config.headers.set("X-Company-Id", selectedCompanyId);
  }

  if (!selectedCompanyId && !endpointAllowsMissingCompany(endpoint)) {
    throw new Error("Selecione uma empresa primeiro");
  }

  if (selectedCompanyId && !endpointAllowsMissingCompany(endpoint)) {
    const method = (config.method || "get").toLowerCase();
    if (method === "get" || method === "head") {
      config.params = {
        ...(config.params || {}),
        companyId: selectedCompanyId,
      };
    } else if (config.data && typeof config.data === "object" && !Array.isArray(config.data)) {
      config.data = {
        ...(config.data as Record<string, unknown>),
        companyId: (config.data as Record<string, unknown>).companyId || selectedCompanyId,
      };
    } else if (!config.data) {
      config.data = { companyId: selectedCompanyId };
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("selectedCompanyId");
      localStorage.removeItem("auth_user");
      if (!window.location.hash.includes("/login")) {
        window.location.assign("/#/login");
      }
    }
    throw buildApiError(error);
  }
);

export function getErrorMessage(error: unknown, fallback = "Erro na requisicao.") {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return fallback;
}

export async function apiRequest<T = unknown>(
  endpoint: string,
  options: AxiosRequestConfig = {}
): Promise<T> {
  const response = await api.request<T>({
    url: normalizeEndpoint(endpoint),
    ...options,
  });
  return response.data;
}

export async function apiDownload(endpoint: string) {
  const response = await api.request<Blob>({
    url: normalizeEndpoint(endpoint),
    method: "GET",
    responseType: "blob",
  });
  return response.data;
}
