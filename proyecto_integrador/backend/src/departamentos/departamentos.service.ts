import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DepartamentosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.departamentos.findMany({
      orderBy: { nombre: 'asc' },
    });
  }
}
