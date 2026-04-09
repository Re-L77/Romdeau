import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { decodeJWT, getTokenExpirationTime, isTokenExpired, getUserIdFromToken } from './jwt';

// Helper: crea un JWT falso con un payload dado
function createFakeJWT(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  const signature = 'fake-signature';
  return `${header}.${body}.${signature}`;
}

describe('decodeJWT', () => {
  it('decodifica correctamente el payload de un JWT válido', () => {
    const token = createFakeJWT({ sub: 'user-123', email: 'test@test.com' });
    const decoded = decodeJWT(token);

    expect(decoded).toEqual({ sub: 'user-123', email: 'test@test.com' });
  });

  it('retorna null para un token con formato inválido', () => {
    expect(decodeJWT('not-a-jwt')).toBeNull();
    expect(decodeJWT('')).toBeNull();
    expect(decodeJWT('one.two')).toBeNull();
  });

  it('retorna null para un payload no-JSON', () => {
    const token = `header.${btoa('esto no es json')}.signature`;
    expect(decodeJWT(token)).toBeNull();
  });
});

describe('getTokenExpirationTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('retorna milisegundos restantes para un token no expirado', () => {
    // exp = 1 hora en el futuro
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    const token = createFakeJWT({ exp: futureExp });

    const result = getTokenExpirationTime(token);

    expect(result).toBe(3600 * 1000); // 1 hora en ms
  });

  it('retorna null para un token ya expirado', () => {
    const pastExp = Math.floor(Date.now() / 1000) - 3600;
    const token = createFakeJWT({ exp: pastExp });

    expect(getTokenExpirationTime(token)).toBeNull();
  });

  it('retorna null si el token no tiene campo exp', () => {
    const token = createFakeJWT({ sub: 'user-1' });
    expect(getTokenExpirationTime(token)).toBeNull();
  });
});

describe('isTokenExpired', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('retorna true si el token expira dentro del buffer (default 60s)', () => {
    // expira en 30 segundos (dentro del buffer de 60s)
    const exp = Math.floor(Date.now() / 1000) + 30;
    const token = createFakeJWT({ exp });

    expect(isTokenExpired(token)).toBe(true);
  });

  it('retorna false si el token tiene tiempo suficiente', () => {
    // expira en 2 horas
    const exp = Math.floor(Date.now() / 1000) + 7200;
    const token = createFakeJWT({ exp });

    expect(isTokenExpired(token)).toBe(false);
  });

  it('retorna true para un token inválido', () => {
    expect(isTokenExpired('invalid-token')).toBe(true);
  });

  it('respeta un buffer personalizado', () => {
    // expira en 5 minutos
    const exp = Math.floor(Date.now() / 1000) + 300;
    const token = createFakeJWT({ exp });

    // con buffer de 10 minutos → expirado
    expect(isTokenExpired(token, 600_000)).toBe(true);
    // con buffer de 1 minuto → no expirado
    expect(isTokenExpired(token, 60_000)).toBe(false);
  });
});

describe('getUserIdFromToken', () => {
  it('extrae el sub del token', () => {
    const token = createFakeJWT({ sub: 'abc-123-def' });
    expect(getUserIdFromToken(token)).toBe('abc-123-def');
  });

  it('retorna null si no hay campo sub', () => {
    const token = createFakeJWT({ email: 'test@test.com' });
    expect(getUserIdFromToken(token)).toBeNull();
  });

  it('retorna null para un token inválido', () => {
    expect(getUserIdFromToken('basura')).toBeNull();
  });
});
