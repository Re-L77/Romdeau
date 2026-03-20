/**
 * Decodifica un JWT y extrae su payload
 */
export function decodeJWT(token: string): Record<string, any> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const decoded = JSON.parse(atob(parts[1]));
    return decoded;
  } catch (err) {
    console.error("Error decoding JWT:", err);
    return null;
  }
}

/**
 * Obtiene el tiempo de expiración del token en milisegundos desde ahora
 * Retorna null si el token es inválido
 */
export function getTokenExpirationTime(token: string): number | null {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return null;

  // exp está en segundos, convertir a milisegundos
  const expirationTime = decoded.exp * 1000;
  const now = Date.now();
  const timeUntilExpiration = expirationTime - now;

  return timeUntilExpiration > 0 ? timeUntilExpiration : null;
}

/**
 * Verifica si un token está expirado o próximo a expirar
 * @param token - El JWT a verificar
 * @param bufferMs - Tiempo en milisegundos antes de la expiración para considerar como "expirado" (default: 1 minuto)
 */
export function isTokenExpired(
  token: string,
  bufferMs: number = 60000,
): boolean {
  const timeUntilExpiration = getTokenExpirationTime(token);
  if (timeUntilExpiration === null) return true;
  return timeUntilExpiration < bufferMs;
}

/**
 * Obtiene el ID de usuario del token
 */
export function getUserIdFromToken(token: string): string | null {
  const decoded = decodeJWT(token);
  return decoded?.sub || null;
}
