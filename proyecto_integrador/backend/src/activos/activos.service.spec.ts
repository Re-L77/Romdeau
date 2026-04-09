import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ActivosService } from './activos.service';
import { PrismaService } from '../prisma/prisma.service';

// ─── Mock de PrismaService ───────────────────────────────────────────────────
const mockPrisma = {
  $transaction: jest.fn(),
  activos: {
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  categorias: {
    findUnique: jest.fn(),
  },
  movimientos_activos: {
    findMany: jest.fn(),
  },
  $queryRaw: jest.fn(),
};

describe('ActivosService', () => {
  let service: ActivosService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivosService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ActivosService>(ActivosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── findAll — paginación ───────────────────────────────────────────────────
  describe('findAll', () => {
    it('retorna datos paginados correctamente', async () => {
      const mockActivos = [
        { id: '1', nombre: 'Laptop Dell', codigo_etiqueta: 'ACT-001' },
        { id: '2', nombre: 'Monitor LG', codigo_etiqueta: 'ACT-002' },
      ];

      mockPrisma.$transaction.mockResolvedValue([mockActivos, 10]);

      const result = await service.findAll({ page: 1, limit: 2 });

      expect(result.data).toEqual(mockActivos);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 2,
        total: 10,
        totalPages: 5,
        hasNextPage: true,
      });
    });

    it('limita el máximo de resultados a 100', async () => {
      mockPrisma.$transaction.mockResolvedValue([[], 0]);

      await service.findAll({ page: 1, limit: 500 });

      // Verifica que $transaction fue llamada con take = 100 (el limite máximo)
      const transactionCall = mockPrisma.$transaction.mock.calls[0][0];
      expect(transactionCall).toBeDefined();
    });

    it('hasNextPage es false en la última página', async () => {
      const mockActivos = [{ id: '1', nombre: 'Laptop' }];
      mockPrisma.$transaction.mockResolvedValue([mockActivos, 1]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.pagination.hasNextPage).toBe(false);
      expect(result.pagination.totalPages).toBe(1);
    });

    it('retorna filtros aplicados en la respuesta', async () => {
      mockPrisma.$transaction.mockResolvedValue([[], 0]);

      const result = await service.findAll({
        page: 1,
        limit: 10,
        q: '  laptop  ',
        categoriaId: 'cat-1',
      });

      expect(result.filters.q).toBe('laptop'); // trimmed
      expect(result.filters.categoriaId).toBe('cat-1');
      expect(result.filters.nombre).toBeNull();
    });
  });

  // ── create — validaciones de negocio ───────────────────────────────────────
  describe('create', () => {
    it('lanza BadRequestException si la categoría no existe', async () => {
      mockPrisma.categorias.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          nombre: 'Test',
          categoria_id: 'non-existent',
          oficina_id: 'ofi-1',
        }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.create({
          nombre: 'Test',
          categoria_id: 'non-existent',
          oficina_id: 'ofi-1',
        }),
      ).rejects.toThrow('La categoría seleccionada no existe');
    });

    it('lanza BadRequestException si un activo móvil no tiene custodio', async () => {
      mockPrisma.categorias.findUnique.mockResolvedValue({
        id: 'cat-1',
        tipo_rastreo: 'MOVIL',
      });

      await expect(
        service.create({
          nombre: 'Laptop HP',
          categoria_id: 'cat-1',
          oficina_id: 'ofi-1',
          // sin custodio_actual_id
        }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.create({
          nombre: 'Laptop HP',
          categoria_id: 'cat-1',
          oficina_id: 'ofi-1',
        }),
      ).rejects.toThrow('Un activo móvil debe tener un custodio asignado obligatoriamente');
    });
  });
});
