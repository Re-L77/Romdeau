import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UbicacionesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllOficinas() {
    return this.prisma.oficinas.findMany({
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
      orderBy: {
        nombre: 'asc',
      },
    });
  }

  async findAllEstantes(sedeId?: string) {
    return this.prisma.estantes.findMany({
      where: sedeId
        ? {
            pasillos: {
              almacenes: {
                sede_id: sedeId,
              },
            },
          }
        : {},
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
      orderBy: {
        nombre: 'asc',
      },
    });
  }
}
