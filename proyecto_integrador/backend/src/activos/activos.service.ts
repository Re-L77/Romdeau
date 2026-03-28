import { BadRequestException, Injectable } from '@nestjs/common';
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
  tipoRastreo?: string;
};

@Injectable()
export class ActivosService {
  constructor(private readonly prisma: PrismaService) { }

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
    tipoRastreo,
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
      ...(tipoRastreo
        ? {
          categorias: {
            tipo_rastreo: { equals: tipoRastreo.toUpperCase() },
          },
        }
        : {}),
      ...(estadoOperativoId ? { estado_operativo_id: estadoOperativoId } : {}),
      ...(oficinaId ? { oficina_id: oficinaId } : {}),
      ...(custodioId ? { custodio_actual_id: custodioId } : {}),
      ...(estanteId ? { estante_id: estanteId } : {}),
      ...(sinCustodio === true ? { custodio_actual_id: null } : {}),
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
        tipoRastreo: tipoRastreo ?? null,
      },
    };
  }

  async getTrazabilidad(id: string) {
    // 1. Obtener movimientos (traslados, cambios de custodio, cambios de estado)
    const movimientos = await this.prisma.movimientos_activos.findMany({
      where: { activo_id: id },
      include: {
        usuarios_movimientos_activos_custodio_anterior_idTousuarios: true,
        usuarios_movimientos_activos_custodio_nuevo_idTousuarios: true,
        oficinas_movimientos_activos_oficina_anterior_idTooficinas: true,
        oficinas_movimientos_activos_oficina_nueva_idTooficinas: true,
        estantes_movimientos_activos_estante_anterior_idToestantes: true,
        estantes_movimientos_activos_estante_nuevo_idToestantes: true,
        estados_activo_movimientos_activos_estado_anterior_idToestados_activo:
          true,
        estados_activo_movimientos_activos_estado_nuevo_idToestados_activo: true,
      },
      orderBy: { fecha_movimiento: 'desc' },
    });

    // 2. Obtener logs de auditoría (incluyendo coordenadas GPS legibles via PostGIS)
    // Nota: Usamos queryRaw para extraer latitud y longitud del campo geography
    const auditoriasRaw: any[] = await this.prisma.$queryRaw`
      SELECT 
        id, 
        auditor_id, 
        fecha_hora, 
        estado_reportado_id, 
        comentarios,
        ST_X(coordenadas_gps::geometry) as longitude,
        ST_Y(coordenadas_gps::geometry) as latitude
      FROM logs_auditoria
      WHERE activo_id = ${id}::uuid
      ORDER BY fecha_hora DESC
    `;

    // Enriquecer auditorias con relaciones (Prisma no soporta include en queryRaw)
    const auditorias = await Promise.all(
      auditoriasRaw.map(async (audit) => {
        const [usuario, estado] = await Promise.all([
          this.prisma.usuarios.findUnique({ where: { id: audit.auditor_id } }),
          this.prisma.estados_auditoria.findUnique({
            where: { id: audit.estado_reportado_id },
          }),
        ]);
        return {
          ...audit,
          usuarios: usuario,
          estados_auditoria: estado,
        };
      }),
    );

    // 3. Unificar y formatear para el frontend
    const history = [
      ...movimientos.map((m) => ({
        id: m.id,
        tipo: 'MOVIMIENTO',
        fecha: m.fecha_movimiento,
        detalles: {
          custodio_anterior:
            m.usuarios_movimientos_activos_custodio_anterior_idTousuarios,
          custodio_nuevo:
            m.usuarios_movimientos_activos_custodio_nuevo_idTousuarios,
          oficina_anterior:
            m.oficinas_movimientos_activos_oficina_anterior_idTooficinas,
          oficina_nueva:
            m.oficinas_movimientos_activos_oficina_nueva_idTooficinas,
          estante_anterior:
            m.estantes_movimientos_activos_estante_anterior_idToestantes,
          estante_nuevo:
            m.estantes_movimientos_activos_estante_nuevo_idToestantes,
          estado_anterior:
            m.estados_activo_movimientos_activos_estado_anterior_idToestados_activo,
          estado_nuevo:
            m.estados_activo_movimientos_activos_estado_nuevo_idToestados_activo,
        },
      })),
      ...auditorias.map((a) => ({
        id: a.id,
        tipo: 'AUDITORIA',
        fecha: a.fecha_hora,
        usuario: a.usuarios,
        estado: a.estados_auditoria,
        comentarios: a.comentarios,
        coordenadas:
          a.latitude && a.longitude
            ? { lat: a.latitude, lng: a.longitude }
            : null,
      })),
    ].sort(
      (a, b) =>
        new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
    );

    return history;
  }

  async seedTestData() {
    const activo = await this.prisma.activos.findFirst();
    const usuario = await this.prisma.usuarios.findFirst();
    const oficina = await this.prisma.oficinas.findFirst();
    const estante = await this.prisma.estantes.findFirst();

    if (!activo || !usuario || !oficina) {
      return {
        success: false,
        message:
          'No hay suficientes datos base (activos, usuarios, oficinas) para generar trazabilidad.',
      };
    }

    // 1. Crear un movimiento inicial (Asignación)
    await this.prisma.movimientos_activos.create({
      data: {
        activo_id: activo.id,
        custodio_nuevo_id: usuario.id,
        oficina_nueva_id: oficina.id,
        estante_nuevo_id: estante?.id,
        fecha_movimiento: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Hace 7 días
        estado_nuevo_id: 1, // Nuevo/Bueno
      },
    });

    // 2. Crear una auditoría con coordenadas PostGIS usando queryRaw
    await this.prisma.$executeRaw`
      INSERT INTO logs_auditoria (
        id, activo_id, auditor_id, fecha_hora, estado_reportado_id, 
        coordenadas_gps, comentarios
      ) VALUES (
        uuid_generate_v4(), 
        ${activo.id}::uuid, 
        ${usuario.id}::uuid, 
        NOW() - INTERVAL '2 days', 
        1, 
        ST_GeographyFromText('POINT(-99.1332 19.4326)'), 
        'Auditoría de rutina - Activo localizado correctamente'
      )
    `;
    return {
      success: true,
      message: `Trazabilidad generada para el activo: ${activo.nombre} (${activo.id})`,
    };
  }

  async update(id: string, data: any) {
    const current = await this.prisma.activos.findUnique({
      where: { id },
    });

    if (!current) throw new Error('Activo no encontrado');

    return this.prisma.$transaction(async (tx) => {
      // 1. Separar datos financieros del resto
      const {
        costo_adquisicion,
        fecha_compra,
        fin_garantia,
        ...assetData
      } = data;

      const updated = await tx.activos.update({
        where: { id },
        data: assetData,
        include: { categorias: true }
      });

      // 2. Gestionar Datos Financieros
      if (costo_adquisicion !== undefined || fecha_compra !== undefined || fin_garantia !== undefined) {
        // Obtener datos actuales o usar los nuevos
        const currentFin = await tx.datos_financieros.findUnique({ where: { activo_id: id } });
        const finalCosto = costo_adquisicion !== undefined ? Number(costo_adquisicion) : Number(currentFin?.costo_adquisicion || 0);
        const finalFecha = fecha_compra !== undefined ? new Date(fecha_compra) : (currentFin?.fecha_compra ? new Date(currentFin.fecha_compra) : new Date());
        const finalFinGarantia = fin_garantia !== undefined ? (fin_garantia ? new Date(fin_garantia) : null) : currentFin?.fin_garantia;

        await tx.datos_financieros.upsert({
          where: { activo_id: id },
          create: {
            activo_id: id,
            costo_adquisicion: finalCosto,
            valor_libro_actual: finalCosto, // Manual simple assignment
            fecha_compra: finalFecha,
            fin_garantia: finalFinGarantia
          },
          update: {
            costo_adquisicion: finalCosto,
            valor_libro_actual: finalCosto, // Manual simple assignment
            fecha_compra: finalFecha,
            fin_garantia: finalFinGarantia
          }
        });
      }

      // 3. Detect relevant changes for traceability
      const custodioCambio = assetData.custodio_actual_id !== undefined && assetData.custodio_actual_id !== current.custodio_actual_id;
      const oficinaCambio = assetData.oficina_id !== undefined && assetData.oficina_id !== current.oficina_id;
      const estanteCambio = assetData.estante_id !== undefined && assetData.estante_id !== current.estante_id;
      const estadoCambio = assetData.estado_operativo_id !== undefined && assetData.estado_operativo_id !== current.estado_operativo_id;

      if (custodioCambio || oficinaCambio || estanteCambio || estadoCambio) {
        await tx.movimientos_activos.create({
          data: {
            activo_id: id,
            custodio_anterior_id: current.custodio_actual_id,
            custodio_nuevo_id: assetData.custodio_actual_id !== undefined ? String(assetData.custodio_actual_id) : current.custodio_actual_id,
            oficina_anterior_id: current.oficina_id,
            oficina_nueva_id: assetData.oficina_id !== undefined ? String(assetData.oficina_id) : current.oficina_id,
            estante_anterior_id: current.estante_id,
            estante_nuevo_id: assetData.estante_id !== undefined ? String(assetData.estante_id) : current.estante_id,
            estado_anterior_id: current.estado_operativo_id,
            estado_nuevo_id: assetData.estado_operativo_id !== undefined ? Number(assetData.estado_operativo_id) : current.estado_operativo_id,
            fecha_movimiento: new Date(),
          },
        });
      }

      return updated;
    });
  }

  async create(data: any) {
    const {
      nombre,
      categoria_id,
      custodio_actual_id,
      oficina_id,
      estante_id,
      especificaciones,
      codigo_etiqueta,
      estado_operativo_id,
      // Datos Financieros
      costo_adquisicion,
      fecha_compra,
      fin_garantia,
    } = data;

    // 1. Validar categoría y su tipo de rastreo
    const categoria = await this.prisma.categorias.findUnique({
      where: { id: categoria_id },
    });

    if (!categoria) {
      throw new BadRequestException('La categoría seleccionada no existe');
    }

    const isMobile = categoria.tipo_rastreo === 'MOVIL';

    // 2. Aplicar reglas de negocio
    if (isMobile) {
      if (!custodio_actual_id) {
        throw new BadRequestException('Un activo móvil debe tener un custodio asignado obligatoriamente');
      }
      if (oficina_id || estante_id) {
        throw new BadRequestException('Un activo móvil no puede estar asignado físicamente a una oficina o estante');
      }
    } else {
      // Es FIJO
      if (!oficina_id && !estante_id) {
        throw new BadRequestException('Un activo fijo debe estar asignado a una oficina o estante obligatoriamente');
      }
    }

    // 3. Validar Costo y Fecha de Compra
    if (costo_adquisicion === undefined || costo_adquisicion <= 0) {
      throw new BadRequestException('El costo de compra inicial es obligatorio y debe ser mayor a 0');
    }
    if (!fecha_compra) {
      throw new BadRequestException('La fecha de compra es obligatoria');
    }
    if (fin_garantia && new Date(fin_garantia) < new Date(fecha_compra)) {
      throw new BadRequestException('La fecha de fin de garantía no puede ser menor a la fecha de compra');
    }

    // 4. Generar Código de Etiqueta (Backend auto-generated)
    const generatedCodigoEtiqueta = `ACT-${Date.now()}`;

    // 5. Crear el activo y registrar movimiento inicial en una transacción
    return this.prisma.$transaction(async (tx) => {
      const nuevoActivo = await tx.activos.create({
        data: {
          nombre,
          categoria_id,
          custodio_actual_id,
          oficina_id,
          estante_id,
          especificaciones: especificaciones || {},
          codigo_etiqueta: generatedCodigoEtiqueta,
          estado_operativo_id: estado_operativo_id || 1, // Por defecto 1 (Bueno/Nuevo)
        },
      });

      // Datos financieros (Manual, inicializado de costo_adquisicion)
      await tx.datos_financieros.create({
        data: {
          activo_id: nuevoActivo.id,
          costo_adquisicion: Number(costo_adquisicion),
          valor_libro_actual: Number(costo_adquisicion),
          fecha_compra: new Date(fecha_compra),
          fin_garantia: fin_garantia ? new Date(fin_garantia) : null,
        }
      });

      // Registro en trazabilidad
      await tx.movimientos_activos.create({
        data: {
          activo_id: nuevoActivo.id,
          custodio_nuevo_id: custodio_actual_id,
          oficina_nueva_id: oficina_id,
          estante_nuevo_id: estante_id,
          estado_nuevo_id: nuevoActivo.estado_operativo_id,
          fecha_movimiento: new Date(),
        },
      });

      return nuevoActivo;
    });
  }

  async getCategorias() {
    return this.prisma.categorias.findMany({
      orderBy: { nombre: 'asc' },
    });
  }

  async getEstados() {
    return this.prisma.estados_activo.findMany({
      orderBy: { nombre: 'asc' },
    });
  }
}
