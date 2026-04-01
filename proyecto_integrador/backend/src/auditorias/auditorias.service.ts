import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuditoriaDto } from './dto/create-auditoria.dto';
import { UpdateAuditoriaDto } from './dto/update-auditoria.dto';

@Injectable()
export class AuditoriasService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Valida que los IDs requeridos existan antes de crear la auditoría
   */
  private async validateReferences(
    activoId: string,
    auditorId: string,
    estadoId: number,
    auditoriaId?: string,
  ): Promise<void> {
    // Validar activo
    const activo = await this.prisma.activos.findUnique({
      where: { id: activoId },
    });
    if (!activo) {
      throw new BadRequestException(`Activo con ID ${activoId} no encontrado`);
    }

    // Validar auditor
    const auditor = await this.prisma.usuarios.findUnique({
      where: { id: auditorId },
    });
    if (!auditor) {
      throw new BadRequestException(
        `Auditor con ID ${auditorId} no encontrado`,
      );
    }
    // Validar estado de auditoría
    const estado = await this.prisma.estados_auditoria.findUnique({
      where: { id: estadoId },
    });
    if (!estado) {
      throw new BadRequestException(
        `Estado de auditoría con ID ${estadoId} no encontrado`,
      );
    }
    // Validar auditoría programada si se proporciona
    if (auditoriaId) {
      const auditoriaProgramada =
        await this.prisma.auditorias_programadas.findUnique({
          where: { id: auditoriaId },
        });
      if (!auditoriaProgramada) {
        throw new BadRequestException(
          `Auditoría programada con ID ${auditoriaId} no encontrada`,
        );
      }

      if (auditoriaProgramada.auditor_id !== auditorId) {
        throw new BadRequestException(
          'La auditoría programada no está asignada al auditor autenticado',
        );
      }

      const isAuditActive = [1, 2].includes(auditoriaProgramada.estado_id);
      if (!isAuditActive) {
        throw new BadRequestException(
          'Solo se pueden registrar activos en auditorías programadas o en progreso',
        );
      }

      if (auditoriaProgramada.estante_id) {
        if (activo.estante_id !== auditoriaProgramada.estante_id) {
          throw new BadRequestException(
            'El activo no pertenece al estante de la auditoría seleccionada',
          );
        }
      } else if (auditoriaProgramada.oficina_id) {
        if (activo.oficina_id !== auditoriaProgramada.oficina_id) {
          throw new BadRequestException(
            'El activo no pertenece a la oficina de la auditoría seleccionada',
          );
        }
      }
    }
  }
  async create(createAuditoriaDto: CreateAuditoriaDto) {
    // Validar que todas las referencias existan
    await this.validateReferences(
      createAuditoriaDto.activo_id,
      createAuditoriaDto.auditor_id,
      createAuditoriaDto.estado_reportado_id,
      createAuditoriaDto.auditoria,
    );

    if (createAuditoriaDto.auditoria) {
      const duplicate = await this.prisma.logs_auditoria.findFirst({
        where: {
          activo_id: createAuditoriaDto.activo_id,
          auditoria: createAuditoriaDto.auditoria,
        },
        select: { id: true },
      });

      if (duplicate) {
        throw new BadRequestException(
          'Este activo ya fue registrado en la auditoría seleccionada',
        );
      }
    }

    return this.prisma.logs_auditoria.create({
      data: createAuditoriaDto,
      include: {
        activos: {
          select: {
            id: true,
            nombre: true,
            codigo_etiqueta: true,
            categoria_id: true,
          },
        },
        usuarios: {
          select: {
            id: true,
            nombre_completo: true,
            email: true,
            telefono: true,
          },
        },
        estados_auditoria: true,
        auditorias_programadas: true,
      },
    });
  }

  async findAll() {
    return this.prisma.logs_auditoria.findMany({
      include: {
        activos: {
          select: {
            id: true,
            nombre: true,
            codigo_etiqueta: true,
            categoria_id: true,
            oficina_id: true,
            estante_id: true,
            oficinas: {
              select: {
                id: true,
                nombre: true,
                piso_id: true,
                pisos: {
                  select: {
                    id: true,
                    nombre: true,
                    edificio_id: true,
                    edificios: {
                      select: {
                        id: true,
                        nombre: true,
                        sede_id: true,
                        sedes: {
                          select: {
                            id: true,
                            nombre: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            estantes: {
              select: {
                id: true,
                nombre: true,
                pasillo_id: true,
                pasillos: {
                  select: {
                    id: true,
                    nombre: true,
                    almacen_id: true,
                    almacenes: {
                      select: {
                        id: true,
                        nombre: true,
                        sede_id: true,
                        sedes: {
                          select: {
                            id: true,
                            nombre: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        usuarios: {
          select: {
            id: true,
            nombre_completo: true,
            email: true,
            telefono: true,
          },
        },
        estados_auditoria: true,
        auditorias_programadas: {
          select: {
            id: true,
            titulo: true,
            fecha_programada: true,
            oficina_id: true,
            estante_id: true,
            oficinas: {
              select: {
                id: true,
                nombre: true,
                piso_id: true,
                pisos: {
                  select: {
                    id: true,
                    nombre: true,
                    edificio_id: true,
                    edificios: {
                      select: {
                        id: true,
                        nombre: true,
                        sede_id: true,
                        sedes: {
                          select: {
                            id: true,
                            nombre: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            estantes: {
              select: {
                id: true,
                nombre: true,
                pasillo_id: true,
                pasillos: {
                  select: {
                    id: true,
                    nombre: true,
                    almacen_id: true,
                    almacenes: {
                      select: {
                        id: true,
                        nombre: true,
                        sede_id: true,
                        sedes: {
                          select: {
                            id: true,
                            nombre: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { fecha_hora: 'asc' },
    });
  }

  async findOne(id: string) {
    const record = await this.prisma.logs_auditoria.findUnique({
      where: { id },
      include: {
        activos: {
          include: {
            oficinas: {
              include: {
                pisos: {
                  include: {
                    edificios: {
                      include: { sedes: true },
                    },
                  },
                },
              },
            },
            estantes: {
              include: {
                pasillos: {
                  include: {
                    almacenes: {
                      include: { sedes: true },
                    },
                  },
                },
              },
            },
          },
        },
        usuarios: {
          select: {
            id: true,
            nombre_completo: true,
            email: true,
            telefono: true,
          },
        },
        estados_auditoria: true,
        auditorias_programadas: true,
      },
    });
    if (!record) {
      throw new NotFoundException(`Auditoría ${id} no encontrada`);
    }
    return record;
  }

  async update(id: string, updateAuditoriaDto: UpdateAuditoriaDto) {
    await this.findOne(id);

    // Validar referencias si se están actualizando
    if (
      updateAuditoriaDto.activo_id ||
      updateAuditoriaDto.auditor_id ||
      updateAuditoriaDto.estado_reportado_id
    ) {
      const current = await this.prisma.logs_auditoria.findUnique({
        where: { id },
      });
      if (!current) {
        throw new NotFoundException(`Auditoría ${id} no encontrada`);
      }

      await this.validateReferences(
        updateAuditoriaDto.activo_id || current.activo_id,
        updateAuditoriaDto.auditor_id || current.auditor_id,
        updateAuditoriaDto.estado_reportado_id || current.estado_reportado_id,
        updateAuditoriaDto.auditoria || current.auditoria || undefined,
      );
    }

    return this.prisma.logs_auditoria.update({
      where: { id },
      data: updateAuditoriaDto,
      include: {
        activos: true,
        usuarios: {
          select: {
            id: true,
            nombre_completo: true,
            email: true,
            telefono: true,
          },
        },
        estados_auditoria: true,
        auditorias_programadas: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.logs_auditoria.delete({ where: { id } });
  }

  /**
   * Obtiene todas las auditorías de un activo específico
   */
  async findByActivo(activoId: string) {
    const activo = await this.prisma.activos.findUnique({
      where: { id: activoId },
    });
    if (!activo) {
      throw new NotFoundException(`Activo ${activoId} no encontrado`);
    }

    return this.prisma.logs_auditoria.findMany({
      where: { activo_id: activoId },
      include: {
        usuarios: {
          select: {
            id: true,
            nombre_completo: true,
            email: true,
          },
        },
        estados_auditoria: true,
      },
      orderBy: { fecha_hora: 'desc' },
    });
  }

  /**
   * Obtiene todas las auditorías realizadas por un auditor específico
   */
  async findByAuditor(auditorId: string) {
    const auditor = await this.prisma.usuarios.findUnique({
      where: { id: auditorId },
    });
    if (!auditor) {
      throw new NotFoundException(`Auditor ${auditorId} no encontrado`);
    }

    return this.prisma.logs_auditoria.findMany({
      where: { auditor_id: auditorId },
      include: {
        activos: {
          select: {
            id: true,
            nombre: true,
            codigo_etiqueta: true,
          },
        },
        estados_auditoria: true,
      },
      orderBy: { fecha_hora: 'desc' },
    });
  }
}
