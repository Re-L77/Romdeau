/**
 * PRUEBA DE INTEGRACIÓN 1 — Auth: validación de login vía HTTP
 *
 * Diferencia con prueba unitaria (auth.service.spec.ts / auth.controller.spec.ts):
 *   - Las pruebas unitarias llaman al servicio/controlador directamente en TypeScript.
 *   - Esta prueba levanta un servidor HTTP real (NestJS + Express) y hace peticiones
 *     via Supertest, verificando status codes, headers y cuerpos de respuesta.
 *
 * ¿Por qué no se necesita Supabase real?
 *   AuthService se sustituye por un mock que devuelve datos controlados.
 *   El endpoint /api/auth/login está marcado @Public(), por lo que ningún guard interviene.
 */

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

// ─── Mock de AuthService ─────────────────────────────────────────────────────
const mockAuthService = {
  login: jest.fn(),
  logout: jest.fn(),
  refreshToken: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
  verifyToken: jest.fn(),
  changePassword: jest.fn(),
  getMe: jest.fn(),
};

// ─── Respuesta de login exitoso ──────────────────────────────────────────────
const loginResponse = {
  access_token: 'eyJhbGci.payload.signature',
  refresh_token: 'rt.token',
  user: {
    id: 'uuid-admin',
    email: 'admin@romdeau.com',
    rol_nombre: 'ADMIN',
    nombres: 'Admin',
    apellido_paterno: 'Test',
  },
};

// ─── Setup ───────────────────────────────────────────────────────────────────
describe('POST /api/auth/login (integración)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(() => app.close());
  beforeEach(() => jest.clearAllMocks());

  // ── Validación de campos obligatorios ────────────────────────────────────
  describe('validación de cuerpo de petición', () => {
    it('retorna HTTP 400 cuando no se envía email ni password', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        statusCode: 400,
        message: expect.stringContaining('email'),
      });
    });

    it('retorna HTTP 400 cuando solo se envía email (falta password)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'admin@romdeau.com' });

      expect(res.status).toBe(400);
    });

    it('retorna HTTP 400 cuando solo se envía password (falta email)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ password: 'secreto123' });

      expect(res.status).toBe(400);
    });
  });

  // ── Login exitoso ────────────────────────────────────────────────────────
  describe('login con credenciales válidas', () => {
    it('retorna HTTP 200 con access_token y datos del usuario', async () => {
      mockAuthService.login.mockResolvedValue(loginResponse);

      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'admin@romdeau.com', password: 'secreto123' });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        access_token: expect.any(String),
        refresh_token: expect.any(String),
        user: expect.objectContaining({
          id: expect.any(String),
          email: 'admin@romdeau.com',
        }),
      });
    });

    it('llama a AuthService.login con los parámetros correctos', async () => {
      mockAuthService.login.mockResolvedValue(loginResponse);

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'admin@romdeau.com', password: 'secreto123' });

      expect(mockAuthService.login).toHaveBeenCalledTimes(1);
      expect(mockAuthService.login).toHaveBeenCalledWith(
        'admin@romdeau.com',
        'secreto123',
      );
    });
  });
});
