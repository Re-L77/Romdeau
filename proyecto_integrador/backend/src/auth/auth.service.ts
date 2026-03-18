import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class AuthService {
  private supabase: ReturnType<typeof createClient>;

  constructor(private readonly configService: ConfigService) {
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

    return { isValid: true, user: data.user };
  }

  async changePassword(newPassword: string, token: string) {
    if (!token) throw new UnauthorizedException('Token no proporcionado');
    await this.verifyToken(token);

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
