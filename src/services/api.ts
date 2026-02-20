const env = import.meta.env as Record<string, string | undefined>;
const COMPANY_ID_STORAGE_KEY = "selectedCompanyId";

function normalizeBaseUrl(url: string) {
  return url.replace(/\/+$/, "").replace(/\/api$/i, "");
}

const configuredApiUrl = (env.VITE_API_URL || env.NEXT_PUBLIC_API_URL || "").trim();

export const API_URL =
  (configuredApiUrl ? normalizeBaseUrl(configuredApiUrl) : "") ||
  "https://next-level-backend.onrender.com";

function normalizeEndpoint(endpoint: string) {
  const withSlash = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return withSlash.replace(/^\/api(?=\/|$)/i, "") || "/";
}

function buildUrl(endpoint: string) {
  return `${API_URL}${normalizeEndpoint(endpoint)}`;
}

function getSelectedCompanyId() {
  return localStorage.getItem(COMPANY_ID_STORAGE_KEY);
}

function endpointAllowsMissingCompany(endpoint: string) {
  const normalized = normalizeEndpoint(endpoint);
  return (
    normalized.startsWith("/auth") ||
    normalized.startsWith("/companies") ||
    normalized.startsWith("/profile")
  );
}

function appendCompanyIdToUrl(url: string, companyId: string) {
  const parsedUrl = new URL(url);
  parsedUrl.searchParams.set("companyId", companyId);
  return parsedUrl.toString();
}

function mergeCompanyIdInBody(body: BodyInit | null | undefined, companyId: string) {
  if (!body) return JSON.stringify({ companyId });
  if (typeof body !== "string") return body;

  try {
    const parsed = JSON.parse(body);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return body;
    const merged = { ...(parsed as Record<string, unknown>), companyId };
    return JSON.stringify(merged);
  } catch {
    return body;
  }
}

function buildHeaders(options: RequestInit = {}) {
  const token = localStorage.getItem("token");
  const selectedCompanyId = getSelectedCompanyId();
  return {
    ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(selectedCompanyId ? { "X-Company-Id": selectedCompanyId } : {}),
    ...options.headers,
  } as HeadersInit;
}

function parseJsonFromText<T>(text: string) {
  if (!text) return null as T;
  return JSON.parse(text) as T;
}

function extractBackendMessage(payload: unknown) {
  if (!payload || typeof payload !== "object") return null;
  const candidate = payload as Record<string, unknown>;
  if (typeof candidate.message === "string") return candidate.message;
  if (typeof candidate.error === "string") return candidate.error;
  if (typeof candidate.details === "string") return candidate.details;
  return null;
}

function isBusinessFailure(payload: unknown) {
  if (!payload || typeof payload !== "object") return false;
  const candidate = payload as Record<string, unknown>;
  if (candidate.success === false) return true;
  if (candidate.ok === false) return true;
  if (typeof candidate.error === "string" && candidate.error.trim()) return true;
  if (typeof candidate.status === "string" && candidate.status.toLowerCase() === "error") {
    return true;
  }
  return false;
}

function logRequest(method: string, url: string, status?: number) {
  if (typeof status === "number") {
    console.info(`[API] ${method} ${url} -> ${status}`);
    return;
  }
  console.info(`[API] ${method} ${url}`);
}

function parsePayloadSafely<T>(text: string) {
  if (!text) return null as T;
  const trimmed = text.trim();
  if (!trimmed) return null as T;
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
    return trimmed as T;
  }
  try {
    return parseJsonFromText<T>(text);
  } catch {
    throw new Error("Resposta invalida da API.");
  }
}

function parseRequestError(status: number, payload: unknown) {
  const message =
    extractBackendMessage(payload) ||
    (typeof payload === "string" && payload.trim() ? payload : null) ||
    `Erro na requisicao (${status}).`;
  return new Error(message);
}

export function getErrorMessage(error: unknown, fallback = "Erro na requisicao.") {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return fallback;
}

export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
) {
  const method = (options.method || "GET").toUpperCase();
  const selectedCompanyId = getSelectedCompanyId();
  console.log("Enviando companyId:", selectedCompanyId);

  if (!selectedCompanyId && !endpointAllowsMissingCompany(endpoint)) {
    throw new Error("Selecione uma empresa primeiro");
  }

  let url = buildUrl(endpoint);
  let requestOptions: RequestInit = { ...options };

  if (selectedCompanyId) {
    if (method === "GET" || method === "HEAD") {
      url = appendCompanyIdToUrl(url, selectedCompanyId);
    } else {
      requestOptions = {
        ...requestOptions,
        body: mergeCompanyIdInBody(requestOptions.body, selectedCompanyId),
      };
    }
  }

  logRequest(method, url);

  const response = await fetch(url, {
    ...requestOptions,
    headers: buildHeaders(requestOptions),
  });
  logRequest(method, url, response.status);

  const text = await response.text();
  const parsed = text ? parsePayloadSafely<unknown>(text) : null;

  if (!response.ok) throw parseRequestError(response.status, parsed);
  if (isBusinessFailure(parsed)) throw parseRequestError(response.status, parsed);

  if (response.status === 204) return null as T;
  return parsed as T;
}

export async function apiDownload(endpoint: string) {
  const method = "GET";
  const selectedCompanyId = getSelectedCompanyId();
  console.log("Enviando companyId:", selectedCompanyId);

  if (!selectedCompanyId && !endpointAllowsMissingCompany(endpoint)) {
    throw new Error("Selecione uma empresa primeiro");
  }

  const url = selectedCompanyId
    ? appendCompanyIdToUrl(buildUrl(endpoint), selectedCompanyId)
    : buildUrl(endpoint);
  logRequest(method, url);

  const response = await fetch(url, {
    method: "GET",
    headers: buildHeaders(),
  });
  logRequest(method, url, response.status);

  if (!response.ok) {
    const text = await response.text();
    const parsed = text ? parsePayloadSafely<unknown>(text) : null;
    throw parseRequestError(response.status, parsed);
  }

  return response.blob();
}

export const api = {
  async get<T = unknown>(endpoint: string, options: RequestInit = {}) {
    const data = await apiRequest<T>(endpoint, { ...options, method: "GET" });
    return { data };
  },
  async post<T = unknown>(
    endpoint: string,
    body?: unknown,
    options: RequestInit = {}
  ) {
    const data = await apiRequest<T>(endpoint, {
      ...options,
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return { data };
  },
  async patch<T = unknown>(
    endpoint: string,
    body?: unknown,
    options: RequestInit = {}
  ) {
    const data = await apiRequest<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return { data };
  },
};
