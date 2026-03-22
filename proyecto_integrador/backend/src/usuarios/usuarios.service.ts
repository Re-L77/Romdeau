import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import { PrismaService } from '../prisma/prisma.service';

type UploadFile = {
  mimetype: string;
  originalname: string;
  buffer: Buffer;
};

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
  private readonly supabase: ReturnType<typeof createClient>;
  private readonly supabaseUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.supabaseUrl = this.config.get<string>('SUPABASE_URL')!;
    const serviceKey =
      this.config.get<string>('SUPABASE_SERVICE_KEY') ??
      this.config.get<string>('SUPABASE_ANON_KEY')!;
    this.supabase = createClient(this.supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });
  }

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

  async uploadFotoPerfilToStorage(id: string, file: UploadFile) {
    if (!file) {
      throw new BadRequestException('Debes enviar un archivo');
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.mimetype)) {
      throw new BadRequestException(
        'Solo se permiten imágenes JPG, PNG, WEBP o GIF',
      );
    }

    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `usuarios/${id}/${Date.now()}-${safeName}`;

    const { error } = await this.supabase.storage
      .from('pfp')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      throw new InternalServerErrorException(
        `No se pudo subir la imagen: ${error.message}`,
      );
    }

    const { data: publicUrlData } = this.supabase.storage
      .from('pfp')
      .getPublicUrl(filePath);

    return this.updateFotoPerfil(id, publicUrlData.publicUrl);
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

    if (body.nombres !== undefined) {
      const val = body.nombres.trim();
      if (!val)
        throw new BadRequestException('El campo nombres no puede estar vacío');
      if (val.length < 2)
        throw new BadRequestException('Nombres debe tener al menos 2 caracteres');
      if (val.length > 100)
        throw new BadRequestException(
          'Nombres no puede superar 100 caracteres',
        );
      data.nombres = val;
    }
    if (body.apellido_paterno !== undefined) {
      const val = body.apellido_paterno.trim();
      if (!val)
        throw new BadRequestException(
          'El apellido paterno no puede estar vacío',
        );
      if (val.length < 2)
        throw new BadRequestException(
          'Apellido paterno debe tener al menos 2 caracteres',
        );
      if (val.length > 100)
        throw new BadRequestException(
          'Apellido paterno no puede superar 100 caracteres',
        );
      data.apellido_paterno = val;
    }
    if (body.apellido_materno !== undefined) {
      const val = body.apellido_materno?.trim() ?? null;
      if (val && val.length > 100)
        throw new BadRequestException(
          'Apellido materno no puede superar 100 caracteres',
        );
      data.apellido_materno = val;
    }
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
