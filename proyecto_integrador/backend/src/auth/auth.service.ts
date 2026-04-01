import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  private supabase: ReturnType<typeof createClient>;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'Faltan SUPABASE_URL o SUPABASE_ANON_KEY en las variables de entorno.',
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    });
  }

  private async ensureUserIsActive(authUserId: string) {
    const usuario = await this.prisma.usuarios.findUnique({
      where: { id: authUserId },
      select: {
        id: true,
        activo: true,
        rol_id: true,
      },
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuario no autorizado en el sistema.');
    }

    if (!usuario.activo) {
      throw new UnauthorizedException('Usuario inactivo. Acceso denegado.');
    }

    return usuario;
  }

  private async getFullUserProfile(userId: string) {
    return this.prisma.usuarios.findUnique({
      where: { id: userId },
      select: {
        nombres: true,
        apellido_paterno: true,
        apellido_materno: true,
        nombre_completo: true,
        foto_perfil_url: true,
        telefono: true,
        created_at: true,
        departamento_id: true,
        activo: true,
        roles_usuario: { select: { nombre: true } },
        departamentos: { select: { nombre: true } },
      },
    });
  }

  private buildUserPayload(
    id: string,
    email: string | undefined,
    rolId: number,
    profile: Awaited<ReturnType<AuthService['getFullUserProfile']>>,
  ) {
    return {
      id,
      email: email ?? '',
      rol_id: rolId,
      activo: profile?.activo ?? true,
      nombres: profile?.nombres ?? '',
      apellido_paterno: profile?.apellido_paterno ?? '',
      apellido_materno: profile?.apellido_materno ?? null,
      nombre_completo: profile?.nombre_completo ?? null,
      foto_perfil_url: profile?.foto_perfil_url ?? null,
      telefono: profile?.telefono ?? null,
      created_at: profile?.created_at?.toISOString() ?? null,
      departamento_id: profile?.departamento_id ?? null,
      rol_nombre: profile?.roles_usuario?.nombre ?? '',
      departamento_nombre: profile?.departamentos?.nombre ?? null,
    };
  }

  async login(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new UnauthorizedException(
        `Credenciales inválidas: ${error.message}`,
      );
    }

    const usuario = await this.ensureUserIsActive(data.user.id);
    const profile = await this.getFullUserProfile(data.user.id);

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: this.buildUserPayload(
        data.user.id,
        data.user.email,
        usuario.rol_id,
        profile,
      ),
    };
  }

  async logout(token: string) {
    if (!token) throw new UnauthorizedException('Token no proporcionado');

    const { error } = await this.supabase.auth.getUser(token);
    if (error) throw new UnauthorizedException('Token inválido o expirado');

    return {
      message:
        'Sesión invalidada. El cliente (React Native/Web) debe eliminar el token de su almacenamiento local.',
    };
  }

  async refreshToken(refreshToken: string) {
    const { data, error } = await this.supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) {
      throw new UnauthorizedException(
        `Error al refrescar token: ${error.message}`,
      );
    }
    return {
      access_token: data.session?.access_token,
      refresh_token: data.session?.refresh_token,
    };
  }

  async forgotPassword(email: string, redirectTo?: string) {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ||
      this.configService.get<string>('CORS_ORIGIN') ||
      'http://localhost:5173';

    const baseRedirect = (redirectTo || `${frontendUrl}/reset-password`).trim();

    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: baseRedirect,
    });

    if (error) throw new BadRequestException(error.message);
    return {
      message: 'Si el correo existe, se enviará un enlace de recuperación.',
    };
  }

  async resetPassword(password: string, refreshToken: string) {
    // Per-request client to avoid race conditions with shared instance
    const client = createClient(
      this.configService.get<string>('SUPABASE_URL')!,
      this.configService.get<string>('SUPABASE_ANON_KEY')!,
      { auth: { persistSession: false } },
    );

    const { error: sessionError } = await client.auth.refreshSession({
      refresh_token: refreshToken,
    });
    if (sessionError) {
      throw new UnauthorizedException(
        'El token de recuperación es inválido o expiró.',
      );
    }

    const { error } = await client.auth.updateUser({ password });
    if (error) throw new BadRequestException(error.message);

    return { message: 'Contraseña actualizada exitosamente.' };
  }

  async verifyToken(token: string) {
    if (!token) throw new UnauthorizedException('Token no proporcionado');

    const { data, error } = await this.supabase.auth.getUser(token);
    if (error) throw new UnauthorizedException('Token inválido o expirado');

    const usuario = await this.ensureUserIsActive(data.user.id);
    const profile = await this.getFullUserProfile(data.user.id);

    return {
      isValid: true,
      user: this.buildUserPayload(
        data.user.id,
        data.user.email,
        usuario.rol_id,
        profile,
      ),
    };
  }

  /**
   * Regex para contraseña segura:
   * - Mínimo 8 caracteres
   * - Al menos 1 mayúscula
   * - Al menos 1 minúscula
   * - Al menos 1 número
   * - Al menos 1 carácter especial (!@#$%^&*...)
   */
  private readonly PASSWORD_REGEX =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]).{8,}$/;

  private validateNewPassword(password: string): void {
    if (!password || !password.trim()) {
      throw new BadRequestException('La nueva contraseña no puede estar vacía');
    }
    if (!this.PASSWORD_REGEX.test(password)) {
      throw new BadRequestException(
        'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial',
      );
    }
  }

  async changePassword(
    currentPassword: string,
    newPassword: string,
    token: string,
  ) {
    if (!token) throw new UnauthorizedException('Token no proporcionado');

    // Validar campos no vacíos
    if (!currentPassword || !currentPassword.trim()) {
      throw new BadRequestException(
        'La contraseña actual no puede estar vacía',
      );
    }
    this.validateNewPassword(newPassword);

    const { user: tokenUser } = await this.verifyToken(token);

    // Verify current password by re-authenticating with Supabase
    const email = tokenUser.email;
    if (!email)
      throw new UnauthorizedException(
        'No se pudo obtener el email del usuario',
      );

    const { error: signInError } = await this.supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });

    if (signInError) {
      throw new BadRequestException('La contraseña actual es incorrecta');
    }

    const { error } = await this.supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new BadRequestException(
        `No se pudo cambiar la contraseña: ${error.message}`,
      );
    }
    return { message: 'Contraseña cambiada exitosamente' };
  }

  async validateSession(token: string) {
    return this.verifyToken(token);
  }
}
