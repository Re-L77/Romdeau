import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

type FindActivosParams = {
  id?: string;
  page: number;
  limit: number;
  q?: string;
  nombre?: string;
  codigoEtiqueta?: string;
  categoriaId?: string;
  categoriaNombre?: string;
  estadoOperativoId?: number;
  oficinaId?: string;
  custodioId?: string;
  estanteId?: string;
  sinCustodio?: boolean;
  proveedorId?: string;
};

@Injectable()
export class ActivosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll({
    id,
    page,
    limit,
    q,
    nombre,
    codigoEtiqueta,
    categoriaId,
    categoriaNombre,
    estadoOperativoId,
    oficinaId,
    custodioId,
    estanteId,
    sinCustodio,
    proveedorId,
  }: FindActivosParams) {
    const take = Math.min(limit, 100);
    const skip = (page - 1) * take;
    const trimmedQuery = q?.trim();
    const trimmedId = id?.trim();
    const trimmedNombre = nombre?.trim();
    const trimmedCodigoEtiqueta = codigoEtiqueta?.trim();
    const trimmedCategoriaNombre = categoriaNombre?.trim();

    const where: Prisma.activosWhereInput = {
      ...(trimmedId ? { id: trimmedId } : {}),
      ...(trimmedQuery
        ? {
            OR: [
              { nombre: { contains: trimmedQuery, mode: 'insensitive' } },
              {
                codigo_etiqueta: {
                  contains: trimmedQuery,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}),
      ...(trimmedNombre
        ? { nombre: { contains: trimmedNombre, mode: 'insensitive' } }
        : {}),
      ...(trimmedCodigoEtiqueta
        ? {
            codigo_etiqueta: {
              contains: trimmedCodigoEtiqueta,
              mode: 'insensitive',
            },
          }
        : {}),
      ...(categoriaId ? { categoria_id: categoriaId } : {}),
      ...(trimmedCategoriaNombre
        ? {
            categorias: {
              nombre: { contains: trimmedCategoriaNombre, mode: 'insensitive' },
            },
          }
        : {}),
      ...(estadoOperativoId ? { estado_operativo_id: estadoOperativoId } : {}),
      ...(oficinaId ? { oficina_id: oficinaId } : {}),
      ...(custodioId ? { custodio_actual_id: custodioId } : {}),
      ...(estanteId ? { estante_id: estanteId } : {}),
      ...(sinCustodio === true ? { custodio_actual_id: null } : {}),
      ...(proveedorId ? { datos_financieros: { proveedor_id: proveedorId } } : {}),
    };

    const [activos, total] = await this.prisma.$transaction([
      this.prisma.activos.findMany({
        where,
        include: {
          categorias: true,
          usuarios: true,
          estados_activo: true,
          oficinas: true,
          estantes: true,
          datos_financieros: {
            include: {
              proveedores: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
        skip,
        take,
      }),
      this.prisma.activos.count({ where }),
    ]);

    return {
      data: activos,
      pagination: {
        page,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
        hasNextPage: skip + activos.length < total,
      },
      filters: {
        id: trimmedId ?? null,
        q: trimmedQuery ?? null,
        nombre: trimmedNombre ?? null,
        codigoEtiqueta: trimmedCodigoEtiqueta ?? null,
        categoriaId: categoriaId ?? null,
        categoriaNombre: trimmedCategoriaNombre ?? null,
        estadoOperativoId: estadoOperativoId ?? null,
        oficinaId: oficinaId ?? null,
        custodioId: custodioId ?? null,
        estanteId: estanteId ?? null,
        sinCustodio: sinCustodio ?? null,
        proveedorId: proveedorId ?? null,
      },
    };
  }
}
