import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
@Injectable()
export class ActivosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const activos = await this.prisma.activos.findMany({
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
    });

    if (!activos.length) {
      throw new NotFoundException('No se encontraron activos');
    }

    return activos;
  }
}
