import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActivosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.activos.findMany({
      orderBy: {
        created_at: 'desc',
      },
    });
  }
}
