import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const usuarios = await this.prisma.usuarios.findMany({
      orderBy: {
        created_at: 'desc',
      },
      select: {
        id: true,
        nombres: true,
        apellido_paterno: true,
        apellido_materno: true,
        nombre_completo: true,
        email: true,
        activo: true,
        created_at: true,
        roles_usuario: {
          select: {
            nombre: true,
          },
        },
      },
    });

    return usuarios.map(({ roles_usuario, ...usuario }) => ({
      ...usuario,
      rol: roles_usuario.nombre,
    }));
  }
}
