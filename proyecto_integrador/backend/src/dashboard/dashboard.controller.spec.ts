import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth/supabase-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';

// ─── Mock del servicio ───────────────────────────────────────────────────────
const mockDashboardService = {
  getResumen: jest.fn(),
  getFinanciero: jest.fn(),
  getAuditoriasRecientes: jest.fn(),
  getAlertas: jest.fn(),
  getAuditoriasProgramadas: jest.fn(),
  getGraficas: jest.fn(),
};

// ─── Mock de Guards (los guards se prueban en pruebas de integración) ───────
const mockGuard = { canActivate: jest.fn(() => true) };

describe('DashboardController', () => {
  let controller: DashboardController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        { provide: DashboardService, useValue: mockDashboardService },
      ],
    })
      .overrideGuard(SupabaseAuthGuard).useValue(mockGuard)
      .overrideGuard(RolesGuard).useValue(mockGuard)
      .compile();

    controller = module.get<DashboardController>(DashboardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ── getResumen ─────────────────────────────────────────────────────────────
  describe('getResumen', () => {
    it('delega al servicio y retorna el resumen correctamente', async () => {
      const mockResumen = {
        total_activos: 150,
        activos_auditados: 120,
        activos_con_inconsistencias: 10,
        activos_en_movimiento: 5,
        auditorias_pendientes: 30,
      };
      mockDashboardService.getResumen.mockResolvedValue(mockResumen);

      const result = await controller.getResumen();

      expect(mockDashboardService.getResumen).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResumen);
    });
  });

  // ── getFinanciero ──────────────────────────────────────────────────────────
  describe('getFinanciero', () => {
    it('retorna métricas financieras desde el servicio', async () => {
      const mockFinanciero = {
        valor_total_inventario: 500000,
        depreciacion_acumulada: 50000,
        porcentaje_depreciacion: 10,
        variacion_mensual: 2.5,
        tendencia_inventario: [],
        tendencia_depreciacion: [],
      };
      mockDashboardService.getFinanciero.mockResolvedValue(mockFinanciero);

      const result = await controller.getFinanciero();

      expect(mockDashboardService.getFinanciero).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockFinanciero);
    });
  });

  // ── getAlertas ─────────────────────────────────────────────────────────────
  describe('getAlertas', () => {
    it('retorna lista de alertas vacía si no hay alertas', async () => {
      mockDashboardService.getAlertas.mockResolvedValue([]);

      const result = await controller.getAlertas();

      expect(mockDashboardService.getAlertas).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });

    it('retorna alertas cuando existen', async () => {
      const mockAlertas = [
        { tipo: 'GARANTIA', mensaje: 'Garantía por vencer', activo_id: '1' },
        { tipo: 'DEPRECIACION', mensaje: 'Depreciación alta', activo_id: '2' },
      ];
      mockDashboardService.getAlertas.mockResolvedValue(mockAlertas);

      const result = await controller.getAlertas();

      expect(result).toHaveLength(2);
      expect(result[0].tipo).toBe('GARANTIA');
    });
  });

  // ── getGraficas ────────────────────────────────────────────────────────────
  describe('getGraficas', () => {
    it('retorna datos de gráficas desde el servicio', async () => {
      const mockGraficas = {
        activos_por_categoria: [],
        activos_por_estado: [],
        activos_por_ubicacion: [],
      };
      mockDashboardService.getGraficas.mockResolvedValue(mockGraficas);

      const result = await controller.getGraficas();

      expect(mockDashboardService.getGraficas).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockGraficas);
    });
  });
});
