/**
 * DTO para crear una nueva auditoría de activos
 * Valida que los campos requeridos sean proporcionados con los tipos correctos
 */
export class CreateAuditoriaDto {
  /**
   * ID del activo a auditar (UUID)
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  activo_id: string;

  /**
   * ID del usuario auditor (UUID)
   * @example "550e8400-e29b-41d4-a716-446655440001"
   */
  auditor_id: string;

  /**
   * ID del estado reportado de la auditoría (SmallInt)
   * @example 1
   */
  estado_reportado_id: number;

  /**
   * Comentarios adicionales sobre la auditoría (opcional)
   * @example "Activo verificado en depósito"
   */
  comentarios?: string;

  /**
   * Coordenadas GPS del activo (opcional, en formato WKT o JSON)
   * @example null
   */
  coordenadas_gps?: unknown;

  /**
   * ID de la auditoría programada asociada (UUID, opcional)
   * @example "550e8400-e29b-41d4-a716-446655440002"
   */
  auditoria?: string;

  /**
   * URL pública de la evidencia fotográfica (opcional)
   * @example "https://project.supabase.co/storage/v1/object/public/evidencias_auditoria/auditorias/...jpg"
   */
  url?: string;

  /**
   * Latitud GPS capturada en campo (opcional)
   * @example 20.5143
   */
  lat?: number;

  /**
   * Longitud GPS capturada en campo (opcional)
   * @example -100.0825
   */
  lng?: number;
}
