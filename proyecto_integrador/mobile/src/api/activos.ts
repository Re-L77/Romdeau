import { apiClient } from "./client";

export interface ActivoDetalle {
  id: string;
  codigo_etiqueta?: string | null;
  nombre?: string | null;
  categoria_id?: string | null;
  custodio_actual_id?: string | null;
  oficina_id?: string | null;
  estante_id?: string | null;
  especificaciones?: Record<string, unknown> | null;
  created_at?: string | null;
  categorias?: {
    id: string;
    nombre?: string | null;
  } | null;
  estados_activo?: {
    id: number;
    nombre?: string | null;
  } | null;
  usuarios?: {
    id: string;
    nombre_completo?: string | null;
    email?: string | null;
  } | null;
  oficinas?: {
    id: string;
    nombre?: string | null;
  } | null;
  estantes?: {
    id: string;
    nombre?: string | null;
  } | null;
  datos_financieros?: {
    costo_adquisicion?: number | null;
    valor_libro_actual?: number | null;
    fecha_compra?: string | null;
    proveedores?: {
      id: string;
      nombre?: string | null;
    } | null;
  } | null;
}

interface FindActivosResponse {
  data: ActivoDetalle[];
  pagination?: {
    total?: number;
  };
}

interface CountActivosParams {
  oficinaId?: string;
  estanteId?: string;
}

function normalize(value: string) {
  return value.trim().toUpperCase();
}

export const activosApi = {
  contarPorUbicacion: async ({
    oficinaId,
    estanteId,
  }: CountActivosParams): Promise<number> => {
    const response = await apiClient.get<FindActivosResponse>("/api/activos", {
      params: {
        page: 1,
        limit: 1,
        ...(oficinaId ? { oficinaId } : {}),
        ...(estanteId ? { estanteId } : {}),
      },
    });

    return response.data.pagination?.total ?? 0;
  },

  obtenerPorIdentificador: async (
    identifier: string,
  ): Promise<ActivoDetalle | null> => {
    const trimmed = identifier.trim();
    if (!trimmed) return null;

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (uuidRegex.test(trimmed)) {
      const byId = await apiClient.get<FindActivosResponse>("/api/activos", {
        params: { id: trimmed, limit: 1 },
      });

      return byId.data.data?.[0] ?? null;
    }

    const byCode = await apiClient.get<FindActivosResponse>("/api/activos", {
      params: { codigoEtiqueta: trimmed, limit: 30 },
    });

    const exact = byCode.data.data?.find(
      (asset) => normalize(asset.codigo_etiqueta || "") === normalize(trimmed),
    );

    if (exact) return exact;

    const bySearch = await apiClient.get<FindActivosResponse>("/api/activos", {
      params: { q: trimmed, limit: 1 },
    });

    return bySearch.data.data?.[0] ?? null;
  },
};
