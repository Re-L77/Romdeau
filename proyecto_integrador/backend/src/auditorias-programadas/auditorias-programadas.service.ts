import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuditoriaProgramadaDto } from './dto/create-auditoria-programada.dto';
import { UpdateAuditoriaProgramadaDto } from './dto/update-auditoria-programada.dto';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

@Injectable()
export class AuditoriasprogramadasService {
  constructor(
    private prisma: PrismaService,
    private notificacionesService: NotificacionesService,
  ) {}

  async create(createAuditoriaProgramadaDto: CreateAuditoriaProgramadaDto) {
    const { auditor_id, ...data } = createAuditoriaProgramadaDto;

    // Verificar que el auditor existe
    const auditorExists = await this.prisma.usuarios.findUnique({
      where: { id: auditor_id },
    });

    if (!auditorExists) {
      throw new NotFoundException('Auditor no encontrado');
    }

    // Crear auditoría con estado inicial "Recién programada" (id: 1)
    const auditoria = await this.prisma.auditorias_programadas.create({
      data: {
        ...data,
        auditor_id,
        estado_id: 1, // Estado inicial: recién programada
      },
      include: {
        usuarios: true,
        estados_auditoria_programada: true,
        oficinas: {
          include: {
            pisos: {
              include: {
                edificios: {
                  include: {
                    sedes: true,
                  },
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
                  include: {
                    sedes: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Notificar al auditor asignado
    await this.notificacionesService.crear({
      usuario_id: auditor_id,
      tipo: 'AUDITORIA_ASIGNADA',
      titulo: 'Nueva auditoría asignada',
      mensaje: `Se te asignó la auditoría "${auditoria.titulo}"`,
      accion_url: `/auditorias/${auditoria.id}`,
    });

    return auditoria;
  }

  async findAll() {
    return await this.prisma.auditorias_programadas.findMany({
      include: {
        usuarios: true,
        estados_auditoria_programada: true,
        oficinas: {
          include: {
            pisos: {
              include: {
                edificios: {
                  include: {
                    sedes: true,
                  },
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
                  include: {
                    sedes: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { fecha_programada: 'asc' },
    });
  }

  async findByAuditor(auditorId: string) {
    return await this.prisma.auditorias_programadas.findMany({
      where: { auditor_id: auditorId },
      include: {
        usuarios: true,
        estados_auditoria_programada: true,
        oficinas: {
          include: {
            pisos: {
              include: {
                edificios: {
                  include: {
                    sedes: true,
                  },
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
                  include: {
                    sedes: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { fecha_programada: 'asc' },
    });
  }

  async findOne(id: string) {
    const auditoria = await this.prisma.auditorias_programadas.findUnique({
      where: { id },
      include: {
        usuarios: true,
        estados_auditoria_programada: true,
        oficinas: {
          include: {
            pisos: {
              include: {
                edificios: {
                  include: {
                    sedes: true,
                  },
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
                  include: {
                    sedes: true,
                  },
                },
              },
            },
          },
        },
        logs_auditoria: {
          include: {
            activos: {
              select: {
                id: true,
                nombre: true,
                codigo_etiqueta: true,
                categorias: { select: { nombre: true } },
              },
            },
            estados_auditoria: true,
            usuarios: {
              select: { id: true, nombre_completo: true },
            },
          },
          orderBy: { fecha_hora: 'asc' },
        },
      },
    });

    if (!auditoria) {
      throw new NotFoundException('Auditoría programada no encontrada');
    }

    return auditoria;
  }

  async findByStatus(estado_id: number) {
    return await this.prisma.auditorias_programadas.findMany({
      where: { estado_id },
      include: {
        usuarios: true,
        estados_auditoria_programada: true,
        oficinas: {
          include: {
            pisos: {
              include: {
                edificios: {
                  include: {
                    sedes: true,
                  },
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
                  include: {
                    sedes: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { fecha_programada: 'asc' },
    });
  }

  async update(
    id: string,
    updateAuditoriaProgramadaDto: UpdateAuditoriaProgramadaDto,
  ) {
    // Verificar que existe la auditoría
    const auditoria = await this.prisma.auditorias_programadas.findUnique({
      where: { id },
    });

    if (!auditoria) {
      throw new NotFoundException('Auditoría programada no encontrada');
    }

    return this.prisma.auditorias_programadas.update({
      where: { id },
      data: updateAuditoriaProgramadaDto,
      include: {
        usuarios: true,
        estados_auditoria_programada: true,
        oficinas: true,
        estantes: true,
      },
    });
  }

  async updateStatus(id: string, estado_id: number) {
    const auditoria = await this.prisma.auditorias_programadas.findUnique({
      where: { id },
    });

    if (!auditoria) {
      throw new NotFoundException('Auditoría programada no encontrada');
    }

    // Bloquear transición manual a "Vencida" (solo se asigna programáticamente)
    if (estado_id === 5) {
      throw new BadRequestException(
        'El estado "Vencida" no puede asignarse manualmente',
      );
    }

    // Bloquear transiciones desde estados terminales (Cancelada, Completada, Vencida)
    if ([3, 4, 5].includes(auditoria.estado_id)) {
      throw new BadRequestException(
        'No se pueden realizar cambios de estado en auditorías finalizadas, canceladas o vencidas',
      );
    }

    // Validar que el estado destino exista
    const estadoDestino =
      await this.prisma.estados_auditoria_programada.findUnique({
        where: { id: estado_id },
      });

    if (!estadoDestino) {
      throw new BadRequestException('Estado de auditoría no válido');
    }

    const updateData: Record<string, unknown> = { estado_id };

    if (estado_id === 2) {
      // En progreso → registrar fecha_inicio
      updateData.fecha_inicio = new Date();
    } else if (estado_id === 3 || estado_id === 4) {
      // Cancelada o Completada → registrar fecha_fin
      updateData.fecha_fin = new Date();
    }

    return this.prisma.auditorias_programadas.update({
      where: { id },
      data: updateData,
      include: {
        usuarios: true,
        estados_auditoria_programada: true,
        oficinas: true,
        estantes: true,
      },
    });
  }

  async remove(id: string) {
    const auditoria = await this.prisma.auditorias_programadas.findUnique({
      where: { id },
    });

    if (!auditoria) {
      throw new NotFoundException('Auditoría programada no encontrada');
    }

    return this.prisma.auditorias_programadas.delete({
      where: { id },
    });
  }

  async getAllStates(): Promise<any[]> {
    return await this.prisma.estados_auditoria_programada.findMany();
  }

  async getAllAuditores(): Promise<any[]> {
    return await this.prisma.usuarios.findMany({
      where: {
        rol_id: 2, // AUDITOR
        activo: true,
      },
      select: {
        id: true,
        nombre_completo: true,
        email: true,
      },
      orderBy: { nombre_completo: 'asc' },
    });
  }

  async getAllEdificios(): Promise<any[]> {
    return await this.prisma.edificios.findMany({
      select: {
        id: true,
        nombre: true,
        sede_id: true,
        sedes: {
          select: {
            nombre: true,
          },
        },
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async getAllSedes(): Promise<any[]> {
    return await this.prisma.sedes.findMany({
      select: {
        id: true,
        nombre: true,
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async getFormCatalogs() {
    const [auditores, sedes] = await Promise.all([
      this.prisma.usuarios.findMany({
        where: {
          rol_id: 2,
          activo: true,
        },
        select: {
          id: true,
          nombre_completo: true,
          email: true,
        },
        orderBy: { nombre_completo: 'asc' },
      }),
      this.prisma.sedes.findMany({
        select: {
          id: true,
          nombre: true,
          edificios: {
            select: {
              id: true,
              nombre: true,
              pisos: {
                select: {
                  id: true,
                  nombre: true,
                  oficinas: {
                    select: {
                      id: true,
                      nombre: true,
                    },
                  },
                },
              },
            },
          },
          almacenes: {
            select: {
              id: true,
              nombre: true,
              pasillos: {
                select: {
                  id: true,
                  nombre: true,
                  estantes: {
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
        orderBy: { nombre: 'asc' },
      }),
    ]);

    return {
      auditores,
      sedes,
    };
  }
}
