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
      },
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuario no autorizado en el sistema.');
    }

    if (!usuario.activo) {
      throw new UnauthorizedException('Usuario inactivo. Acceso denegado.');
    }
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

    await this.ensureUserIsActive(data.user.id);

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: data.user,
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

  async forgotPassword(email: string) {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email);

    if (error) throw new BadRequestException(error.message);
    return {
      message: 'Si el correo existe, se enviará un enlace de recuperación.',
    };
  }

  async resetPassword(password: string, refreshToken: string) {
    const { error: sessionError } = await this.supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });
    if (sessionError) {
      throw new UnauthorizedException(
        'El token de recuperación es inválido o expiró.',
      );
    }

    const { error } = await this.supabase.auth.updateUser({ password });
    if (error) throw new BadRequestException(error.message);

    return { message: 'Contraseña actualizada exitosamente.' };
  }

  async verifyToken(token: string) {
    if (!token) throw new UnauthorizedException('Token no proporcionado');

    const { data, error } = await this.supabase.auth.getUser(token);
    if (error) throw new UnauthorizedException('Token inválido o expirado');

    await this.ensureUserIsActive(data.user.id);

    return { isValid: true, user: data.user };
  }

  async changePassword(currentPassword: string, newPassword: string, token: string) {
    if (!token) throw new UnauthorizedException('Token no proporcionado');
    const { user: tokenUser } = await this.verifyToken(token);

    // Verify current password by re-authenticating with Supabase
    const email = tokenUser.email;
    if (!email) throw new UnauthorizedException('No se pudo obtener el email del usuario');

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
