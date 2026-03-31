import { CreateAuditoriaProgramadaDto } from './create-auditoria-programada.dto';

export class UpdateAuditoriaProgramadaDto implements Partial<CreateAuditoriaProgramadaDto> {
  titulo?: string;
  descripcion?: string;
  fecha_programada?: Date;
  auditor_id?: string;
  oficina_id?: string;
  estante_id?: string;
  estado_id?: number;
  fecha_inicio?: Date;
  fecha_fin?: Date;
}
