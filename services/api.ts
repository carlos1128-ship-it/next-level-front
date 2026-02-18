const API_BASE_URL =
  import.meta.env.VITE_API_URL;

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

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erro na requisição");
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
