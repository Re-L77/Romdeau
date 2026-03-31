import { apiClient } from "./client";

export interface AuditoriaProgramada {
  id: string;
  titulo: string;
  descripcion?: string;
  fecha_programada: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  auditor_id: string;
  estado_id: number;
  oficina_id?: string;
  estante_id?: string;
  usuarios: {
    id: string;
    nombre_completo: string;
  };
  estados_auditoria_programada: {
    id: number;
    nombre: string;
  };
}

export const auditoriasApi = {
  listarMias: async (): Promise<AuditoriaProgramada[]> => {
    const response = await apiClient.get<AuditoriaProgramada[]>(
      "/api/auditorias-programadas/mias",
    );
    return response.data;
  },

  obtener: async (id: string): Promise<AuditoriaProgramada> => {
    const response = await apiClient.get<AuditoriaProgramada>(
      `/api/auditorias-programadas/${id}`,
    );
    return response.data;
  },

  cambiarEstado: async (id: string, estadoId: number) => {
    const response = await apiClient.patch(
      `/api/auditorias-programadas/${id}/estado/${estadoId}`,
    );
    return response.data;
  },
};
