export class CreateAuditoriaProgramadaDto {
  titulo: string;
  descripcion?: string;
  fecha_programada: Date;
  auditor_id: string;
  oficina_id?: string;
  estante_id?: string;
}
