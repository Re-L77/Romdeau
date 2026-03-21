import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type UsuarioConRol = {
  id: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  nombre_completo: string | null;
  email: string;
  activo: boolean | null;
  created_at: Date | null;
  roles_usuario: {
    nombre: string;
  };
};

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  private formatUsuario({ roles_usuario, ...usuario }: UsuarioConRol) {
    return {
      ...usuario,
      rol: roles_usuario.nombre,
    };
  }

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

    return usuarios.map((usuario) => this.formatUsuario(usuario));
  }

  async findOne(id: string) {
    const usuario = await this.prisma.usuarios.findUnique({
      where: { id },
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

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return this.formatUsuario(usuario);
  }
}
