import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../prisma/prisma.service';

// ─── Mock de PrismaService ───────────────────────────────────────────────────
const mockPrisma = {
  activos: {
    count: jest.fn(),
  },
};

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── getHealthScore ─────────────────────────────────────────────────────────
  describe('getHealthScore', () => {
    it('retorna score 0 y nivel CRITICO cuando no hay activos', async () => {
      mockPrisma.activos.count.mockResolvedValue(0);

      const result = await service.getHealthScore();

      expect(result).toEqual({
        score: 0,
        nivel: 'CRITICO',
        breakdown: {
          auditados_pct: 0,
          buen_estado_pct: 0,
          con_ubicacion_pct: 0,
          con_custodio_pct: 0,
        },
      });
    });

    it('retorna nivel EXCELENTE cuando todos los indicadores son 100%', async () => {
      // total = 10, todos los counts = 10 → cada porcentaje = 100%
      mockPrisma.activos.count
        .mockResolvedValueOnce(10)  // total
        .mockResolvedValueOnce(10)  // auditados recientes
        .mockResolvedValueOnce(10)  // buen estado
        .mockResolvedValueOnce(10)  // con ubicación
        .mockResolvedValueOnce(10); // con custodio

      const result = await service.getHealthScore();

      expect(result.score).toBe(100);
      expect(result.nivel).toBe('EXCELENTE');
      expect(result.breakdown).toEqual({
        auditados_pct: 100,
        buen_estado_pct: 100,
        con_ubicacion_pct: 100,
        con_custodio_pct: 100,
      });
    });

    it('clasifica correctamente niveles intermedios (MODERADO)', async () => {
      // total = 100, mitad en cada indicador → ~50%
      mockPrisma.activos.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(50)  // auditados 50%
        .mockResolvedValueOnce(50)  // buen estado 50%
        .mockResolvedValueOnce(50)  // con ubicación 50%
        .mockResolvedValueOnce(50); // con custodio 50%

      const result = await service.getHealthScore();

      expect(result.score).toBe(50);
      expect(result.nivel).toBe('MODERADO');
    });

    it('clasifica nivel BAJO cuando los indicadores son bajos', async () => {
      // total = 100, ~25% en cada indicador
      mockPrisma.activos.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(25)  // auditados 25%
        .mockResolvedValueOnce(25)  // buen estado 25%
        .mockResolvedValueOnce(25)  // con ubicación 25%
        .mockResolvedValueOnce(25); // con custodio 25%

      const result = await service.getHealthScore();

      expect(result.score).toBe(25);
      expect(result.nivel).toBe('BAJO');
    });

    it('clasifica nivel BUENO con ~80% promedio', async () => {
      mockPrisma.activos.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(80)  // auditados 80%
        .mockResolvedValueOnce(80)  // buen estado 80%
        .mockResolvedValueOnce(80)  // con ubicación 80%
        .mockResolvedValueOnce(80); // con custodio 80%

      const result = await service.getHealthScore();

      expect(result.score).toBe(80);
      expect(result.nivel).toBe('BUENO');
    });
  });
});
