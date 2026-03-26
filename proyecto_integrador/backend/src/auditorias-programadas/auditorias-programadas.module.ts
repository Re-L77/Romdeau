import { Module } from '@nestjs/common';
import { AuditoriasprogramadasService } from './auditorias-programadas.service';
import { AuditoriasprogramadasController } from './auditorias-programadas.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AuditoriasprogramadasController],
  providers: [AuditoriasprogramadasService],
})
export class AuditoriasprogramadasModule {}
