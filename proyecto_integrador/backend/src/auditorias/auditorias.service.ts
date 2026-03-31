import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuditoriaDto } from './dto/create-auditoria.dto';
import { UpdateAuditoriaDto } from './dto/update-auditoria.dto';

@Injectable()
export class AuditoriasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAuditoriaDto: CreateAuditoriaDto) {
    return this.prisma.logs_auditoria.create({
      data: createAuditoriaDto,
      include: {
        activos: true,
        usuarios: true,
        estados_auditoria: true,
      },
    });
  }

  async findAll() {
    return this.prisma.logs_auditoria.findMany({
      include: {
        activos: { select: { id: true, nombre: true, codigo_etiqueta: true } },
        usuarios: { select: { id: true, nombre_completo: true, email: true } },
        estados_auditoria: true,
      },
      orderBy: { fecha_hora: 'desc' },
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
        usuarios: true,
        estados_auditoria: true,
        auditorias_programadas: true,
      },
    });
    if (!record) throw new NotFoundException(`Auditoría ${id} no encontrada`);
    return record;
  }

  async update(id: string, updateAuditoriaDto: UpdateAuditoriaDto) {
    await this.findOne(id);
    return this.prisma.logs_auditoria.update({
      where: { id },
      data: updateAuditoriaDto,
      include: {
        activos: true,
        usuarios: true,
        estados_auditoria: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.logs_auditoria.delete({ where: { id } });
  }
}
