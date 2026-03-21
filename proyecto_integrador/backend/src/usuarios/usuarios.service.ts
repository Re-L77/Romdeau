import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type CreateUsuarioInput = {
  id: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno?: string | null;
  email: string;
  rol_id?: number;
  activo?: boolean;
  foto_perfil_url?: string | null;
};

type UpdateUsuarioInput = {
  nombres?: string;
  apellido_paterno?: string;
  apellido_materno?: string | null;
  email?: string;
  rol_id?: number;
  activo?: boolean;
  foto_perfil_url?: string | null;
};

type UsuarioConRol = {
  id: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  nombre_completo: string | null;
  email: string;
  activo: boolean | null;
  foto_perfil_url: string | null;
  created_at: Date | null;
  roles_usuario: {
    nombre: string;
  };
};

const usuarioSelect = {
  id: true,
  nombres: true,
  apellido_paterno: true,
  apellido_materno: true,
  nombre_completo: true,
  email: true,
  activo: true,
  foto_perfil_url: true,
  created_at: true,
  roles_usuario: {
    select: {
      nombre: true,
    },
  },
} satisfies Prisma.usuariosSelect;

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  private formatUsuario({ roles_usuario, ...usuario }: UsuarioConRol) {
    return {
      ...usuario,
      rol: roles_usuario.nombre,
    };
  }

  private handlePrismaError(error: unknown): never {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof error.code === 'string'
    ) {
      const code = error.code;

      if (code === 'P2025') {
        throw new NotFoundException('Usuario no encontrado');
      }

      if (code === 'P2002') {
        throw new ConflictException('Ya existe un usuario con ese id o email.');
      }

      if (code === 'P2003') {
        throw new BadRequestException('El rol especificado no existe.');
      }
    }

    throw error;
  }

  async create(body: CreateUsuarioInput) {
    if (!body?.id?.trim()) {
      throw new BadRequestException('Debes enviar id');
    }

    if (!body?.nombres?.trim()) {
      throw new BadRequestException('Debes enviar nombres');
    }

    if (!body?.apellido_paterno?.trim()) {
      throw new BadRequestException('Debes enviar apellido_paterno');
    }

    if (!body?.email?.trim()) {
      throw new BadRequestException('Debes enviar email');
    }

    try {
      const usuario = await this.prisma.usuarios.create({
        data: {
          id: body.id.trim(),
          nombres: body.nombres.trim(),
          apellido_paterno: body.apellido_paterno.trim(),
          apellido_materno: body.apellido_materno?.trim() ?? null,
          email: body.email.trim().toLowerCase(),
          rol_id: body.rol_id,
          activo: body.activo,
          foto_perfil_url: body.foto_perfil_url?.trim() ?? null,
        },
        select: usuarioSelect,
      });

      return this.formatUsuario(usuario);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findAll() {
    const usuarios = await this.prisma.usuarios.findMany({
      orderBy: {
        created_at: 'desc',
      },
      select: usuarioSelect,
    });

    return usuarios.map((usuario) => this.formatUsuario(usuario));
  }

  async findOne(id: string) {
    const usuario = await this.prisma.usuarios.findUnique({
      where: { id },
      select: usuarioSelect,
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return this.formatUsuario(usuario);
  }

  async updateFotoPerfil(id: string, fotoPerfilUrl: string) {
    if (!fotoPerfilUrl?.trim()) {
      throw new BadRequestException('Debes enviar foto_perfil_url');
    }

    let usuario: UsuarioConRol;

    try {
      usuario = await this.prisma.usuarios.update({
        where: { id },
        data: {
          foto_perfil_url: fotoPerfilUrl.trim(),
        },
        select: usuarioSelect,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }

    return this.formatUsuario(usuario);
  }

  async update(id: string, body: UpdateUsuarioInput) {
    const data: Prisma.usuariosUpdateInput = {};

    if (body.nombres !== undefined) data.nombres = body.nombres.trim();
    if (body.apellido_paterno !== undefined)
      data.apellido_paterno = body.apellido_paterno.trim();
    if (body.apellido_materno !== undefined)
      data.apellido_materno = body.apellido_materno?.trim() ?? null;
    if (body.email !== undefined) data.email = body.email.trim().toLowerCase();
    if (body.activo !== undefined) data.activo = body.activo;
    if (body.foto_perfil_url !== undefined)
      data.foto_perfil_url = body.foto_perfil_url?.trim() ?? null;
    if (body.rol_id !== undefined) {
      data.roles_usuario = {
        connect: {
          id: body.rol_id,
        },
      };
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException(
        'Debes enviar al menos un campo para actualizar',
      );
    }

    let usuario: UsuarioConRol;

    try {
      usuario = await this.prisma.usuarios.update({
        where: { id },
        data,
        select: usuarioSelect,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }

    return this.formatUsuario(usuario);
  }

  async remove(id: string) {
    let usuario: UsuarioConRol;

    try {
      usuario = await this.prisma.usuarios.update({
        where: { id },
        data: {
          activo: false,
        },
        select: usuarioSelect,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }

    return this.formatUsuario(usuario);
  }
}
