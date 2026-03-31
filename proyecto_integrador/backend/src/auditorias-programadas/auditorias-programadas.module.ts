import { Module } from '@nestjs/common';
import { AuditoriasprogramadasService } from './auditorias-programadas.service';
import { AuditoriasprogramadasController } from './auditorias-programadas.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [PrismaModule, NotificacionesModule],
  controllers: [AuditoriasprogramadasController],
  providers: [AuditoriasprogramadasService],
})
export class AuditoriasprogramadasModule {}
