import { Module } from '@nestjs/common';
import { ActivosController } from './activos.controller';
import { ActivosService } from './activos.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { SupabaseAuthGuard } from '../auth/supabase-auth/supabase-auth.guard';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ActivosController],
  providers: [ActivosService, SupabaseAuthGuard],
})
export class ActivosModule {}
