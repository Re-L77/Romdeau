import { Module } from '@nestjs/common';
import { LogsAuditoriaController } from './logs-auditoria.controller';
import { LogsAuditoriaService } from './logs-auditoria.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [LogsAuditoriaController],
  providers: [LogsAuditoriaService],
})
export class LogsAuditoriaModule {}
