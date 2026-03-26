import { Module } from '@nestjs/common';
import { AuditoriasService } from './auditorias.service';
import { AuditoriasController } from './auditorias.controller';

@Module({
  controllers: [AuditoriasController],
  providers: [AuditoriasService],
})
export class AuditoriasModule {}
