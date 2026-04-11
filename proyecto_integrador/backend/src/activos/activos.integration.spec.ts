/**
 * PRUEBA DE INTEGRACIÓN 2 — Activos: paginación y autenticación vía HTTP
 *
 * Diferencia con prueba unitaria (activos.service.spec.ts):
 *   - La prueba unitaria llama a service.findAll() directamente.
 *   - Esta prueba levanta un servidor HTTP real y hace peticiones vía Supertest,
 *     verificando que el controlador parsea query params, que los guards bloquean
 *     acceso no autorizado y que la respuesta JSON tiene la forma correcta.
 *
 * Se usan dos instancias de la app:
 *   - appConGuards  → guard real que lanza 401 si falta el token
 *   - appSinGuards  → guards deshabilitados para probar la lógica del controlador
 */

import { INestApplication, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { ActivosController } from './activos.controller';
import { ActivosService } from './activos.service';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth/supabase-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';

// ─── Mock de PrismaService ────────────────────────────────────────────────────
const mockPrisma = {
  $transaction: jest.fn(),
  activos: {
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  categorias: { findUnique: jest.fn() },
  movimientos_activos: { findMany: jest.fn() },
  $queryRaw: jest.fn(),
};

// ─── Guard que siempre acepta (simula token válido) ───────────────────────────
const guardQueAcepta = { canActivate: () => true };

// ─── Helpers para crear las dos apps ─────────────────────────────────────────
// En AppModule los guards son globales (APP_GUARD), no decoradores del controlador.
// overrideGuard() solo funciona para guards registrados en el módulo; para guards
// globales se usa app.useGlobalGuards() ANTES de app.init().
async function crearAppConGuards(): Promise<INestApplication> {
  const module = await Test.createTestingModule({
    controllers: [ActivosController],
    providers: [
      ActivosService,
      { provide: PrismaService, useValue: mockPrisma },
    ],
  }).compile();

  const app = module.createNestApplication();
  // Registrar el guard real que lanza 401 cuando falta el token
  app.useGlobalGuards({
    canActivate: () => {
      throw new UnauthorizedException('Token no proporcionado');
    },
  } as any);
  await app.init();
  return app;
}

async function crearAppSinGuards(): Promise<INestApplication> {
  const module = await Test.createTestingModule({
    controllers: [ActivosController],
    providers: [
      ActivosService,
      { provide: PrismaService, useValue: mockPrisma },
    ],
  })
    .overrideGuard(SupabaseAuthGuard)
    .useValue(guardQueAcepta)
    .overrideGuard(RolesGuard)
    .useValue(guardQueAcepta)
    .compile();

  const app = module.createNestApplication();
  await app.init();
  return app;
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('GET /api/activos (integración)', () => {
  let appConGuards: INestApplication;
  let appSinGuards: INestApplication;

  beforeAll(async () => {
    [appConGuards, appSinGuards] = await Promise.all([
      crearAppConGuards(),
      crearAppSinGuards(),
    ]);
  });

  afterAll(() =>
    Promise.all([appConGuards.close(), appSinGuards.close()]),
  );

  beforeEach(() => jest.clearAllMocks());

  // ── Autenticación obligatoria ─────────────────────────────────────────────
  describe('autenticación', () => {
    it('retorna HTTP 401 cuando no se envía Authorization header', async () => {
      const res = await request(appConGuards.getHttpServer()).get(
        '/api/activos',
      );

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({
        statusCode: 401,
        message: expect.any(String),
      });
    });
  });

  // ── Paginación ───────────────────────────────────────────────────────────
  describe('paginación y estructura de respuesta', () => {
    it('retorna HTTP 200 con estructura { data, pagination } correcta', async () => {
      const mockActivos = [
        { id: 'a1', nombre: 'Laptop Dell', codigo_etiqueta: 'CORP-001' },
        { id: 'a2', nombre: 'Monitor LG', codigo_etiqueta: 'CORP-002' },
      ];
      mockPrisma.$transaction.mockResolvedValue([mockActivos, 25]);

      const res = await request(appSinGuards.getHttpServer()).get(
        '/api/activos?page=1&limit=2',
      );

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        data: expect.any(Array),
        pagination: {
          page: 1,
          limit: 2,
          total: 25,
          totalPages: 13,
          hasNextPage: true,
        },
      });
      expect(res.body.data).toHaveLength(2);
    });

    it('retorna HTTP 200 con hasNextPage: false en la última página', async () => {
      const mockActivos = [{ id: 'a1', nombre: 'Laptop' }];
      mockPrisma.$transaction.mockResolvedValue([mockActivos, 1]);

      const res = await request(appSinGuards.getHttpServer()).get(
        '/api/activos?page=1&limit=10',
      );

      expect(res.status).toBe(200);
      expect(res.body.pagination.hasNextPage).toBe(false);
    });
  });

  // ── Validación de query params ────────────────────────────────────────────
  describe('validación de query params', () => {
    it('retorna HTTP 400 cuando page es un número negativo', async () => {
      const res = await request(appSinGuards.getHttpServer()).get(
        '/api/activos?page=-1',
      );

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('page');
    });

    it('retorna HTTP 400 cuando limit no es un número entero', async () => {
      const res = await request(appSinGuards.getHttpServer()).get(
        '/api/activos?limit=abc',
      );

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('limit');
    });
  });
});
