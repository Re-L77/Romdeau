import { CreateAuditoriaDto } from './create-auditoria.dto';

export class UpdateAuditoriaDto implements Partial<CreateAuditoriaDto> {
  activo_id?: string;
  auditor_id?: string;
  estado_reportado_id?: number;
  comentarios?: string;
}
