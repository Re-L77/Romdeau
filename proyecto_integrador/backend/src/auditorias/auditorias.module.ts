import { Module } from '@nestjs/common';
import { AuditoriasService } from './auditorias.service';
import { AuditoriasController } from './auditorias.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AuditoriasController],
  providers: [AuditoriasService],
})
export class AuditoriasModule {}
