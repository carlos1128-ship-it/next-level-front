const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, "") ||
  "https://next-level-backend.onrender.com";

function normalizeEndpoint(endpoint: string) {
  return endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
}

function buildHeaders(options: RequestInit = {}) {
  const token = localStorage.getItem("token");
  return {
    ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  } as HeadersInit;
}

async function parseError(response: Response) {
  const fallback = "Erro na requisicao";
  try {
    const json = await response.json();
    if (typeof json?.message === "string") return json.message;
  } catch {
    // ignored
  }
  return fallback;
}

export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
) {
  const response = await fetch(`${API_BASE_URL}${normalizeEndpoint(endpoint)}`, {
    ...options,
    headers: buildHeaders(options),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  if (response.status === 204) return null as T;
  return (await response.json()) as T;
}

export async function apiDownload(endpoint: string) {
  const response = await fetch(`${API_BASE_URL}${normalizeEndpoint(endpoint)}`, {
    method: "GET",
    headers: buildHeaders(),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
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
