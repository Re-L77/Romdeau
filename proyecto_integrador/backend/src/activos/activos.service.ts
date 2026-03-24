import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
@Injectable()
export class ActivosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const activos = await this.prisma.activos.findMany({
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
