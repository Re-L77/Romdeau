import { describe, it, expect } from 'vitest';
import { classifyError, getErrorMessage, type ErrorType } from './errors';

describe('classifyError', () => {
  it('retorna NETWORK_ERROR cuando statusCode es 0 o falsy', () => {
    expect(classifyError('cualquier mensaje', 0)).toBe('NETWORK_ERROR');
  });

  it('retorna UNAUTHORIZED para status 401', () => {
    expect(classifyError('no autorizado', 401)).toBe('UNAUTHORIZED');
  });

  it('retorna FORBIDDEN para status 403', () => {
    expect(classifyError('acceso denegado', 403)).toBe('FORBIDDEN');
  });

  it('retorna NOT_FOUND para status 404', () => {
    expect(classifyError('no encontrado', 404)).toBe('NOT_FOUND');
  });

  it('retorna INVALID_CREDENTIALS para 400 con "credential" en el mensaje', () => {
    expect(classifyError('Invalid credentials', 400)).toBe('INVALID_CREDENTIALS');
    expect(classifyError('bad Credential provided', 422)).toBe('INVALID_CREDENTIALS');
  });

  it('retorna VALIDATION_ERROR para 400/422 sin "credential"', () => {
    expect(classifyError('campo inválido', 400)).toBe('VALIDATION_ERROR');
    expect(classifyError('datos incorrectos', 422)).toBe('VALIDATION_ERROR');
  });

  it('retorna SERVER_ERROR para códigos 5xx', () => {
    expect(classifyError('error interno', 500)).toBe('SERVER_ERROR');
    expect(classifyError('bad gateway', 502)).toBe('SERVER_ERROR');
    expect(classifyError('servicio no disponible', 503)).toBe('SERVER_ERROR');
    expect(classifyError('timeout', 504)).toBe('SERVER_ERROR');
  });

  it('retorna UNKNOWN para códigos no mapeados', () => {
    expect(classifyError('raro', 418)).toBe('UNKNOWN');
    expect(classifyError('redirect', 301)).toBe('UNKNOWN');
  });
});

describe('getErrorMessage', () => {
  const expectedMessages: Record<ErrorType, string> = {
    INVALID_CREDENTIALS: 'Email o contraseña incorrectos. Por favor intenta de nuevo.',
    NETWORK_ERROR: 'Error de conexión. Verifica tu conexión a internet.',
    SERVER_ERROR: 'El servidor está experimentando problemas. Por favor intenta más tarde.',
    UNAUTHORIZED: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
    TOKEN_EXPIRED: 'Tu token de acceso ha expirado. Por favor inicia sesión nuevamente.',
    FORBIDDEN: 'No tienes permiso para acceder a este recurso.',
    NOT_FOUND: 'El recurso solicitado no fue encontrado.',
    VALIDATION_ERROR: 'Verifica que todos los campos sean válidos.',
    UNKNOWN: 'Ocurrió un error inesperado. Por favor intenta de nuevo.',
  };

  it('retorna el mensaje correcto para cada tipo de error', () => {
    for (const [type, expected] of Object.entries(expectedMessages)) {
      expect(getErrorMessage(type as ErrorType)).toBe(expected);
    }
  });
});
