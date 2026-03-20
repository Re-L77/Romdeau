export type ErrorType =
  | "INVALID_CREDENTIALS"
  | "NETWORK_ERROR"
  | "SERVER_ERROR"
  | "UNAUTHORIZED"
  | "TOKEN_EXPIRED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "UNKNOWN";

export interface ExtendedApiError {
  message: string;
  statusCode: number;
  type: ErrorType;
}

/**
 * Clasifica un error según su tipo
 */
export function classifyError(message: string, statusCode: number): ErrorType {
  if (!statusCode || statusCode === 0) {
    return "NETWORK_ERROR";
  }

  switch (statusCode) {
    case 401:
      return "UNAUTHORIZED";
    case 403:
      return "FORBIDDEN";
    case 404:
      return "NOT_FOUND";
    case 422:
    case 400:
      if (message.toLowerCase().includes("credential")) {
        return "INVALID_CREDENTIALS";
      }
      return "VALIDATION_ERROR";
    case 500:
    case 502:
    case 503:
    case 504:
      return "SERVER_ERROR";
    default:
      return "UNKNOWN";
  }
}

/**
 * Obtiene un mensaje de error amigable basado en el tipo
 */
export function getErrorMessage(errorType: ErrorType): string {
  const messages: Record<ErrorType, string> = {
    INVALID_CREDENTIALS:
      "Email o contraseña incorrectos. Por favor intenta de nuevo.",
    NETWORK_ERROR: "Error de conexión. Verifica tu conexión a internet.",
    SERVER_ERROR:
      "El servidor está experimentando problemas. Por favor intenta más tarde.",
    UNAUTHORIZED: "Tu sesión ha expirado. Por favor inicia sesión nuevamente.",
    TOKEN_EXPIRED:
      "Tu token de acceso ha expirado. Por favor inicia sesión nuevamente.",
    FORBIDDEN: "No tienes permiso para acceder a este recurso.",
    NOT_FOUND: "El recurso solicitado no fue encontrado.",
    VALIDATION_ERROR: "Verifica que todos los campos sean válidos.",
    UNKNOWN: "Ocurrió un error inesperado. Por favor intenta de nuevo.",
  };

  return messages[errorType] || "Ocurrió un error inesperado.";
}
