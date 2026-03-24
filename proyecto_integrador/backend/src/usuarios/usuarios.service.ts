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
  nombres: string;
  apellido_paterno: string;
  apellido_materno?: string | null;
  email: string;
  password?: string;
  rol_id?: number;
  activo?: boolean;
  foto_perfil_url?: string | null;
  telefono?: string | null;
  departamento_id?: number | null;
};

type UpdateUsuarioInput = {
  nombres?: string;
  apellido_paterno?: string;
  apellido_materno?: string | null;
  rol_id?: number;
  activo?: boolean;
  foto_perfil_url?: string | null;
  telefono?: string | null;
  departamento_id?: number | null;
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
  telefono: string | null;
  created_at: Date | null;
  roles_usuario: {
    nombre: string;
  };
  departamentos: {
    nombre: string;
  } | null;
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
  telefono: true,
  created_at: true,
  roles_usuario: {
    select: {
      nombre: true,
    },
  },
  departamentos: {
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

  private formatUsuario({
    roles_usuario,
    departamentos,
    ...usuario
  }: UsuarioConRol) {
    return {
      ...usuario,
      rol: roles_usuario.nombre,
      departamento: departamentos?.nombre || 'General',
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
    if (!body?.nombres?.trim()) {
      throw new BadRequestException('Debes enviar nombres');
    }

    if (!body?.apellido_paterno?.trim()) {
      throw new BadRequestException('Debes enviar apellido_paterno');
    }

    if (!body?.email?.trim()) {
      throw new BadRequestException('Debes enviar email');
    }

    const password = body.password || 'Romdeau2026!';

    const { data: authData, error: authError } =
      await this.supabase.auth.admin.createUser({
        email: body.email.trim().toLowerCase(),
        password,
        email_confirm: true,
        user_metadata: {
          nombres: body.nombres.trim(),
          apellido_paterno: body.apellido_paterno.trim(),
          apellido_materno: body.apellido_materno?.trim() ?? null,
          rol_id: body.rol_id,
        },
      });

    if (authError) {
      // Intenta mapear errores comunes de Supabase
      if (authError.message.includes('already registered')) {
        throw new ConflictException(
          'Ese correo ya está registrado en el sistema.',
        );
      }
      throw new BadRequestException(
        `No se pudo crear el usuario en Auth: ${authError.message}`,
      );
    }

    const { user } = authData;

    // El trigger postgres (handle_new_user) creará la entrada en `public.usuarios` automáticamente.
    // Damos un pequeño retraso de red para asegurar que el trigger termine de commitear
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      // Revisar si necesitamos añadir cosas no contempladas en el trigger (activo, foto_perfil)
      const updateData: Prisma.usuariosUpdateInput = {};
      if (body.activo !== undefined) updateData.activo = body.activo;
      if (body.foto_perfil_url)
        updateData.foto_perfil_url = body.foto_perfil_url.trim();
      if (body.telefono !== undefined)
        updateData.telefono = body.telefono?.trim() ?? null;
      if (body.departamento_id !== undefined) {
        if (body.departamento_id === null) {
          updateData.departamentos = { disconnect: true };
        } else {
          updateData.departamentos = { connect: { id: body.departamento_id } };
        }
      }

      if (Object.keys(updateData).length > 0) {
        const usuarioUpdated = await this.prisma.usuarios.update({
          where: { id: user.id },
          data: updateData,
          select: usuarioSelect,
        });
        return this.formatUsuario(usuarioUpdated);
      }

      // Si no hubieron más updates de info, solamente lo regresamos
      const usuario = await this.prisma.usuarios.findUnique({
        where: { id: user.id },
        select: usuarioSelect,
      });

      if (!usuario) {
        throw new InternalServerErrorException(
          'El usuario fue creado en Supabase pero no se encontró en la tabla (¿falló el trigger Postgres?)',
        );
      }

      return this.formatUsuario(usuario);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findAll(order: 'asc' | 'desc' = 'desc') {
    const usuarios = await this.prisma.usuarios.findMany({
      orderBy: {
        created_at: order,
      },
      select: usuarioSelect,
    });

    return usuarios.map((usuario) => this.formatUsuario(usuario));
  }

  async findOne(id: string) {
    const usuario = await this.prisma.usuarios.findUnique({
      where: { id },
      select: {
        ...usuarioSelect,
        _count: {
          select: {
            activos: true,
            logs_auditoria: true,
          },
        },
        activos: {
          take: 10,
          orderBy: { created_at: 'desc' },
          select: {
            id: true,
            nombre: true,
            codigo_etiqueta: true,
            foto_principal_url: true,
            categorias: { select: { nombre: true } },
            estados_activo: { select: { nombre: true } },
          },
        },
        logs_auditoria: {
          take: 5,
          orderBy: { fecha_hora: 'desc' },
          select: {
            id: true,
            fecha_hora: true,
            activo_id: true,
            activos: { select: { codigo_etiqueta: true } },
            estados_auditoria: { select: { nombre: true } },
          },
        },
      },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const { _count, logs_auditoria, activos, ...rest } = usuario as any;

    let last_sign_in_at: string | null = null;
    const { data: authData, error: authError } =
      await this.supabase.auth.admin.getUserById(id);
    if (!authError && authData?.user) {
      last_sign_in_at = authData.user.last_sign_in_at || null;
    }

    return {
      ...this.formatUsuario(rest),
      last_sign_in_at,
      assets_assigned: _count?.activos || 0,
      audits_completed: _count?.logs_auditoria || 0,
      activos: activos || [],
      recent_activity:
        logs_auditoria?.map((log: any) => ({
          action: `Auditó activo ${log.activos?.codigo_etiqueta || log.activo_id?.substring(0, 8)}`,
          date: log.fecha_hora,
          type: 'complete',
        })) || [],
    };
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
        throw new BadRequestException(
          'Nombres debe tener al menos 2 caracteres',
        );
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
    if (body.telefono !== undefined)
      data.telefono = body.telefono?.trim() ?? null;
    if (body.departamento_id !== undefined) {
      if (body.departamento_id === null) {
        data.departamentos = { disconnect: true };
      } else {
        data.departamentos = { connect: { id: body.departamento_id } };
      }
    }
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

  async changePassword(id: string, newPassword: string) {
    if (!newPassword || newPassword.length < 8) {
      throw new BadRequestException(
        'La contraseña debe tener al menos 8 caracteres',
      );
    }
    const { error } = await this.supabase.auth.admin.updateUserById(id, {
      password: newPassword,
    });
    if (error) {
      throw new BadRequestException(
        `No se pudo cambiar la contraseña: ${error.message}`,
      );
    }
    return { message: 'Contraseña actualizada correctamente' };
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
