import { apiClient } from "./client";

export interface Notificacion {
  id: string;
  usuario_id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  accion_url: string | null;
  creado_en: string;
}

export const notificacionesApi = {
  listar: async (noLeidas?: boolean): Promise<Notificacion[]> => {
    const params = noLeidas ? "?no_leidas=true" : "";
    const response = await apiClient.get<Notificacion[]>(
      `/api/notificaciones${params}`,
    );
    return response.data;
  },

  contarNoLeidas: async (): Promise<number> => {
    const response = await apiClient.get<{ count: number }>(
      "/api/notificaciones/no-leidas/count",
    );
    return response.data.count;
  },

  marcarLeida: async (id: string): Promise<Notificacion> => {
    const response = await apiClient.patch<Notificacion>(
      `/api/notificaciones/${id}/leer`,
    );
    return response.data;
  },

  marcarTodasLeidas: async (): Promise<void> => {
    await apiClient.patch("/api/notificaciones/leer-todas");
  },
};
