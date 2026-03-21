import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
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
