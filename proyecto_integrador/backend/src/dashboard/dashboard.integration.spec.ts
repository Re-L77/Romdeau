/**
 * PRUEBA DE INTEGRACIÓN 3 — Dashboard: endpoints protegidos vía HTTP
 *
 * Diferencia con prueba unitaria (dashboard.controller.spec.ts):
 *   - La prueba unitaria llama a controller.getResumen() directamente.
 *   - Esta prueba levanta un servidor HTTP real, verifica que los guards
 *     bloquean el acceso sin token (HTTP 401) y que las respuestas JSON
 *     tienen la forma esperada cuando el usuario está autorizado.
 *
 * Se usan dos instancias de la app:
 *   - appProtegida   → SupabaseAuthGuard lanza 401 (simula token ausente)
 *   - appAutorizada  → guards deshabilitados para probar la lógica del servicio
 */

import { INestApplication, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth/supabase-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';

// ─── Mock de PrismaService ────────────────────────────────────────────────────
const mockPrisma = {
  activos: { count: jest.fn(), findMany: jest.fn() },
  movimientos_activos: { count: jest.fn() },
  datos_financieros: { findMany: jest.fn() },
  logs_depreciacion: { findMany: jest.fn() },
  logs_auditoria: { findMany: jest.fn(), count: jest.fn() },
  alertas: { findMany: jest.fn(), count: jest.fn() },
  auditorias_programadas: { findMany: jest.fn() },
};

// ─── Guard que rechaza (simula token ausente) ─────────────────────────────────
const guardQueRechaza = {
  canActivate: () => {
    throw new UnauthorizedException('Token no proporcionado');
  },
};

// ─── Guard que acepta (simula token válido) ───────────────────────────────────
const guardQueAcepta = { canActivate: () => true };

// ─── Datos de prueba ──────────────────────────────────────────────────────────
const mockResumen = {
  total_activos: 53,
  activos_auditados: 2,
  activos_con_inconsistencias: 29,
  activos_en_movimiento: 29,
  auditorias_pendientes: 51,
};

// ─── Helpers para crear las dos apps ─────────────────────────────────────────
async function crearAppProtegida(): Promise<INestApplication> {
  const module = await Test.createTestingModule({
    controllers: [DashboardController],
    providers: [
      DashboardService,
      { provide: PrismaService, useValue: mockPrisma },
    ],
  })
    .overrideGuard(SupabaseAuthGuard)
    .useValue(guardQueRechaza)
    .overrideGuard(RolesGuard)
    .useValue(guardQueAcepta)
    .compile();

  const app = module.createNestApplication();
  await app.init();
  return app;
}

async function crearAppAutorizada(): Promise<INestApplication> {
  const module = await Test.createTestingModule({
    controllers: [DashboardController],
    providers: [
      DashboardService,
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
describe('Dashboard endpoints (integración)', () => {
  let appProtegida: INestApplication;
  let appAutorizada: INestApplication;

  beforeAll(async () => {
    [appProtegida, appAutorizada] = await Promise.all([
      crearAppProtegida(),
      crearAppAutorizada(),
    ]);
  });

  afterAll(() =>
    Promise.all([appProtegida.close(), appAutorizada.close()]),
  );

  beforeEach(() => jest.clearAllMocks());

  // ── Autenticación obligatoria ─────────────────────────────────────────────
  describe('autenticación', () => {
    it('GET /api/dashboard/resumen retorna HTTP 401 sin token', async () => {
      const res = await request(appProtegida.getHttpServer()).get(
        '/api/dashboard/resumen',
      );

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({
        statusCode: 401,
        message: expect.any(String),
      });
    });

    it('GET /api/dashboard/alertas retorna HTTP 401 sin token', async () => {
      const res = await request(appProtegida.getHttpServer()).get(
        '/api/dashboard/alertas',
      );

      expect(res.status).toBe(401);
    });
  });

  // ── Resumen ───────────────────────────────────────────────────────────────
  describe('GET /api/dashboard/resumen', () => {
    it('retorna HTTP 200 con métricas de inventario', async () => {
      // getResumen llama a activos.count (x3) y movimientos_activos.count (x1)
      mockPrisma.activos.count
        .mockResolvedValueOnce(53) // total_activos
        .mockResolvedValueOnce(2)  // activos_auditados
        .mockResolvedValueOnce(29) // activos_con_inconsistencias
        .mockResolvedValueOnce(51); // auditorias_pendientes
      mockPrisma.movimientos_activos.count.mockResolvedValue(29);

      const res = await request(appAutorizada.getHttpServer()).get(
        '/api/dashboard/resumen',
      );

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject(mockResumen);
    });

    it('las métricas son núméros no negativos', async () => {
      mockPrisma.activos.count.mockResolvedValue(0);
      mockPrisma.movimientos_activos.count.mockResolvedValue(0);

      const res = await request(appAutorizada.getHttpServer()).get(
        '/api/dashboard/resumen',
      );

      expect(res.status).toBe(200);
      for (const val of Object.values(res.body as Record<string, number>)) {
        expect(val).toBeGreaterThanOrEqual(0);
      }
    });
  });

  // ── Alertas ───────────────────────────────────────────────────────────────
  // getAlertas() consulta activos.findMany (sin auditar + con inconsistencias)
  // y movimientos_activos.findMany (sin custodio), por lo que el mock debe
  // cubrir esas llamadas para que el servicio no lance un TypeError.
  describe('GET /api/dashboard/alertas', () => {
    it('retorna HTTP 200 con lista vacía cuando no hay activos con problemas', async () => {
      // getAlertas hace múltiples llamadas: activos.findMany (x2) + datos_financieros.findMany (x1)
      mockPrisma.activos.findMany.mockResolvedValue([]);
      mockPrisma.datos_financieros.findMany.mockResolvedValue([]);

      const res = await request(appAutorizada.getHttpServer()).get(
        '/api/dashboard/alertas',
      );

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('retorna HTTP 200 con alertas cuando hay activos sin auditar', async () => {
      // getAlertas hace 3 consultas: activos sin auditar, activos con inconsistencias,
      // y datos_financieros con garantías próximas a vencer.
      mockPrisma.activos.findMany
        .mockResolvedValueOnce([
          { id: 'a1', nombre: 'Laptop Dell', codigo_etiqueta: 'CORP-001' },
        ]) // sinAuditar
        .mockResolvedValueOnce([]) // inconsistencias
      mockPrisma.datos_financieros.findMany.mockResolvedValue([]); // garantias

      const res = await request(appAutorizada.getHttpServer()).get(
        '/api/dashboard/alertas',
      );

      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toMatchObject({ tipo: 'SIN_AUDITAR' });
    });
  });
});
