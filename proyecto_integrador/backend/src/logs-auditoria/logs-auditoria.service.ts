import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type FindLogsParams = {
  page: number;
  limit: number;
  auditorId?: string;
  activoId?: string;
  estadoId?: number;
};

@Injectable()
export class LogsAuditoriaService {
  constructor(private readonly prisma: PrismaService) { }

  async findAll({ page, limit, auditorId, activoId, estadoId }: FindLogsParams) {
    const take = Math.min(limit, 100);
    const skip = (page - 1) * take;

    const where = {
      ...(auditorId ? { auditor_id: auditorId } : {}),
      ...(activoId ? { activo_id: activoId } : {}),
      ...(estadoId ? { estado_reportado_id: estadoId } : {}),
    };

    const [logs, total] = await this.prisma.$transaction([
      this.prisma.logs_auditoria.findMany({
        where,
        include: {
          activos: {
            select: {
              id: true,
              nombre: true,
              codigo_etiqueta: true,
              oficinas: {
                select: { nombre: true },
              },
              estantes: {
                select: { nombre: true },
              },
            },
          },
          usuarios: {
            select: {
              id: true,
              nombre_completo: true,
              email: true,
            },
          },
          estados_auditoria: {
            select: {
              id: true,
              nombre: true,
            },
          },
          auditorias_programadas: {
            select: {
              titulo: true,
            },
          },
        },
        orderBy: { fecha_hora: 'desc' },
        skip,
        take,
      }),
      this.prisma.logs_auditoria.count({ where }),
    ]);

    const data = logs.map((log) => {
      const oficinaNombre = log.activos?.oficinas?.nombre ?? null;
      const estanteNombre = log.activos?.estantes?.nombre ?? null;
      const ubicacion = oficinaNombre
        ? estanteNombre
          ? `${oficinaNombre} – ${estanteNombre}`
          : oficinaNombre
        : null;

      return {
        id: log.id,
        fecha_hora: log.fecha_hora,
        comentarios: log.comentarios,
        activo: {
          id: log.activos?.id ?? null,
          nombre: log.activos?.nombre ?? null,
          codigo_etiqueta: log.activos?.codigo_etiqueta ?? null,
        },
        ubicacion,
        auditor: log.usuarios?.nombre_completo ?? null,
        plan_auditoria: log.auditorias_programadas?.titulo ?? null,
        estado_reportado: log.estados_auditoria?.nombre ?? null,
        estado_reportado_id: log.estado_reportado_id,
      };
    });

    return {
      data,
      pagination: {
        page,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
        hasNextPage: skip + logs.length < total,
      },
    };
  }
}
