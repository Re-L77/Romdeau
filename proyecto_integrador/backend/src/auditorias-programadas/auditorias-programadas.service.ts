import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuditoriaProgramadaDto } from './dto/create-auditoria-programada.dto';
import { UpdateAuditoriaProgramadaDto } from './dto/update-auditoria-programada.dto';

@Injectable()
export class AuditoriasprogramadasService {
  constructor(private prisma: PrismaService) {}

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
    return this.prisma.auditorias_programadas.create({
      data: {
        ...data,
        auditor_id,
        estado_id: 1, // Estado inicial: recién programada
      },
      include: {
        usuarios: true,
        estados_auditoria_programada: true,
        oficinas: true,
        estantes: true,
      },
    });
  }

  async findAll() {
    return await this.prisma.auditorias_programadas.findMany({
      include: {
        usuarios: true,
        estados_auditoria_programada: true,
        oficinas: true,
        estantes: true,
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
        oficinas: true,
        estantes: true,
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
        oficinas: true,
        estantes: true,
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

    // Validar transiciones de estado
    const estadosValidos =
      await this.prisma.estados_auditoria_programada.findUnique({
        where: { id: estado_id },
      });

    if (!estadosValidos) {
      throw new BadRequestException('Estado de auditoría no válido');
    }

    // Aquí puedes agregar lógica adicional según el estado:
    // - Si pasa a "En progreso": registrar fecha_inicio
    // - Si pasa a "Terminada" o "Cancelada": registrar fecha_fin
    const updateData: Record<string, unknown> = { estado_id };

    if (estado_id === 2) {
      // En progreso
      updateData.fecha_inicio = new Date();
    } else if (estado_id === 4 || estado_id === 5) {
      // Terminada o Cancelada
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
