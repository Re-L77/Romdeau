export class CreateNotificacionDto {
  usuario_id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  accion_url?: string;
}
