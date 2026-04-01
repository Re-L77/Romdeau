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
  created_at?: string;
  updated_at?: string;
  usuarios: {
    id: string;
    nombre_completo: string;
    email?: string;
    telefono?: string;
    foto_perfil_url?: string;
  };
  estados_auditoria_programada: {
    id: number;
    nombre: string;
  };
  oficinas?: {
    id: string;
    nombre: string;
    pisos: {
      id: string;
      nombre: string;
      edificios: {
        id: string;
        nombre: string;
        sedes: {
          id: string;
          nombre: string;
        };
      };
    };
  };
  estantes?: {
    id: string;
    nombre: string;
    pasillos: {
      id: string;
      nombre: string;
      almacenes: {
        id: string;
        nombre: string;
        sedes: {
          id: string;
          nombre: string;
        };
      };
    };
  };
}

export interface AuditoriaLog {
  id: string;
  activo_id: string;
  auditoria?: string | null;
  fecha_hora?: string | null;
  auditorias_programadas?: {
    id: string;
  } | null;
}

export interface RegistrarAuditoriaPayload {
  activo_id: string;
  auditoria?: string;
  estado_reportado_id: number;
  comentarios?: string;
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

  listarLogsPorAuditor: async (auditorId: string): Promise<AuditoriaLog[]> => {
    const response = await apiClient.get<AuditoriaLog[]>(
      `/api/auditorias/auditor/${auditorId}`,
    );
    return response.data;
  },

  registrarLog: async (payload: RegistrarAuditoriaPayload) => {
    const response = await apiClient.post("/api/auditorias", payload);
    return response.data;
  },
};
