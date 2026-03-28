import {
  BadRequestException,
  Controller,
  Post,
  Body,
  Put,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './public/public.decorator';

interface LoginBody {
  email: string;
  password: string;
}

interface ResetPasswordBody {
  password: string;
  refresh_token: string;
}

interface ForgotPasswordBody {
  email: string;
  redirect_to?: string;
}

interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
}

@Controller('api/auth')
@Public()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private extractBearerToken(authHeader?: string): string {
    return authHeader?.split(' ')[1] ?? '';
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body?: Partial<LoginBody>,
    @Query('email') queryEmail?: string,
    @Query('password') queryPassword?: string,
  ) {
    const email = body?.email ?? queryEmail;
    const password = body?.password ?? queryPassword;

    if (!email || !password) {
      throw new BadRequestException(
        'Debes enviar email y password en JSON body o query params.',
      );
    }

    return this.authService.login(email, password);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Headers('authorization') authHeader: string) {
    const token = this.extractBearerToken(authHeader);
    return this.authService.logout(token);
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body('refresh_token') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() body?: ForgotPasswordBody) {
    const email = body?.email;
    const redirectTo = body?.redirect_to;

    if (!email) {
      throw new BadRequestException('Debes enviar email');
    }

    return this.authService.forgotPassword(email, redirectTo);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() body: ResetPasswordBody) {
    const { password, refresh_token } = body;
    return this.authService.resetPassword(password, refresh_token);
  }

  @Post('verify-token')
  @HttpCode(HttpStatus.OK)
  async verifyToken(@Headers('authorization') authHeader: string) {
    const token = this.extractBearerToken(authHeader);
    return this.authService.verifyToken(token);
  }

  @Put('change-password')
  async changePassword(
    @Body() body: Partial<ChangePasswordBody>,
    @Headers('authorization') authHeader: string,
  ) {
    const { currentPassword, newPassword } = body ?? {};
    if (!currentPassword || !newPassword) {
      throw new BadRequestException(
        'Debes enviar currentPassword y newPassword',
      );
    }
    const token = this.extractBearerToken(authHeader);
    return this.authService.changePassword(currentPassword, newPassword, token);
  }

  @Get('validate-session')
  async validateSession(@Headers('authorization') authHeader: string) {
    const token = this.extractBearerToken(authHeader);
    return this.authService.validateSession(token);
  }
}
