export function getErrorMessage(error: unknown, fallback = "Erro na requisicao.") {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return fallback;
}
