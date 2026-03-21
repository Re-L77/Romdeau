import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../auth.service';
import { IS_PUBLIC_KEY } from '../public/public.decorator';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ headers?: { authorization?: string }; user?: unknown }>();
    const authHeader = request.headers?.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : '';

    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    const { user } = await this.authService.verifyToken(token);
    request.user = user;

    return true;
  }
}
