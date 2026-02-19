const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, "") ||
  "https://next-level-backend.onrender.com";

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = localStorage.getItem("token");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const response = await fetch(`${API_BASE_URL}${normalizedEndpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = "Erro na requisicao";
    try {
      const error = await response.json();
      if (typeof error?.message === "string") errorMessage = error.message;
    } catch {
      // keep default message when backend returns non-JSON
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export const api = {
  async get<T = unknown>(endpoint: string, options: RequestInit = {}) {
    const data = await apiRequest(endpoint, { ...options, method: "GET" });
    return { data: data as T };
  },
  async post<T = unknown>(
    endpoint: string,
    body?: unknown,
    options: RequestInit = {}
  ) {
    const data = await apiRequest(endpoint, {
      ...options,
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return { data: data as T };
  },
};
