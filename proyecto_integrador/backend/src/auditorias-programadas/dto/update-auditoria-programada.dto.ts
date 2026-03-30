import { PartialType } from '@nestjs/mapped-types';
import { CreateAuditoriaProgramadaDto } from './create-auditoria-programada.dto';

export class UpdateAuditoriaProgramadaDto extends PartialType(
  CreateAuditoriaProgramadaDto,
) {
  estado_id?: number;
  fecha_inicio?: Date;
  fecha_fin?: Date;
}
