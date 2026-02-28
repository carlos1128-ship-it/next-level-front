import { AxiosError } from "axios";

export function getErrorMessage(error: unknown, fallback = "Erro na requisicao.") {
  if (error instanceof AxiosError) {
    const payload = error.response?.data;
    if (typeof payload === "string" && payload.trim()) return payload;
    if (payload && typeof payload === "object") {
      const message = (payload as { message?: unknown }).message;
      if (typeof message === "string" && message.trim()) return message;
      if (Array.isArray(message) && message.length > 0) {
        const first = message.find((item) => typeof item === "string" && item.trim());
        if (typeof first === "string") return first;
      }
      const errorText = (payload as { error?: unknown }).error;
      if (typeof errorText === "string" && errorText.trim()) return errorText;
    }
    if (error.message) return error.message;
  }
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return fallback;
}
