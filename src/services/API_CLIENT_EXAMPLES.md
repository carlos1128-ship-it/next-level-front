# API Client Examples

## Fetch (correct POST)

```ts
await fetch(`${API_BASE_URL}/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});

await fetch(`${API_BASE_URL}/companies`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  body: JSON.stringify({ name: "Minha Empresa", sector: "Servicos" }),
});

await fetch(`${API_BASE_URL}/transactions`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  body: JSON.stringify({ type: "revenue", amount: 1000, description: "Venda" }),
});

await fetch(`${API_BASE_URL}/chat`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  body: JSON.stringify({ message: "Resumo financeiro", detailLevel: "medium" }),
});
```

## Axios (correct POST)

```ts
import axios from "axios";

const http = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

await http.post("/auth/login", { email, password });
await http.post("/companies", { name, sector });
await http.post("/transactions", { type, amount, description });
await http.post("/chat", { message, detailLevel });
```

## Form submit safety

```ts
const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  // call POST here
};
```

## Centralized client in this project

- `src/services/api.ts` handles base URL, auth headers, JSON parsing, and errors.
- `src/services/endpoints.ts` exposes domain methods (`createCompany`, `createTransaction`, `chatWithAi`).
- UI components call only endpoint methods, not raw `fetch`.
