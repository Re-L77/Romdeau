import { classifyError, ExtendedApiError } from "../utils/errors";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    [key: string]: any;
  };
}

export interface ApiError extends ExtendedApiError { }

/**
 * Almacena funciones de callback para interceptar y refrescar tokens
 */
let refreshTokenCallback: (() => Promise<string | null>) | null = null;

export function setRefreshTokenCallback(
  callback: () => Promise<string | null>,
) {
  refreshTokenCallback = callback;
}

/**
 * Cliente HTTP mejorado con interceptor automático de tokens
 */
async function fetchWithInterceptor(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(options.headers || {});

  // Obtener token actual del localStorage
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(url, { ...options, headers });

  // Si recibimos 401, intentar refrescar el token
  if (response.status === 401 && refreshTokenCallback) {
    const newToken = await refreshTokenCallback();
    if (newToken) {
      headers.set("Authorization", `Bearer ${newToken}`);
      return fetch(url, { ...options, headers });
    }
  }

  return response;
}

const handleResponse = async (response: Response): Promise<any> => {
  let data: any;

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const errorMessage = data.message || `Error: ${response.status}`;
    const errorType = classifyError(errorMessage, response.status);

    throw {
      message: errorMessage,
      statusCode: response.status,
      type: errorType,
    } as ApiError;
  }

  return data;
};

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  logout: async (accessToken: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return handleResponse(response);
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
    return handleResponse(response);
  },

  refreshToken: async (
    refreshToken: string,
  ): Promise<{ access_token: string; refresh_token: string }> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    return handleResponse(response);
  },

  verifyToken: async (accessToken: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify-token`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return handleResponse(response);
  },
};

export const activosApi = {
  getList: async (params?: {
    id?: string;
    page?: number;
    limit?: number;
    q?: string;
    nombre?: string;
    codigoEtiqueta?: string;
    categoriaId?: string;
    categoriaNombre?: string;
    estadoOperativoId?: number;
    oficinaId?: string;
    custodioId?: string;
    estanteId?: string;
    sinCustodio?: boolean;
    tipoRastreo?: string;
  }): Promise<{
    data: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
    };
    filters?: Record<string, any>;
  }> => {
    const searchParams = new URLSearchParams();

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.set(key, String(value));
        }
      }
    }

    const queryString = searchParams.toString();
    const path = queryString ? `/api/activos?${queryString}` : "/api/activos";
    const response = await apiClient.get<any>(path);

    if (Array.isArray(response)) {
      return {
        data: response,
        pagination: {
          page: params?.page ?? 1,
          limit: response.length,
          total: response.length,
          totalPages: 1,
          hasNextPage: false,
        },
      };
    }

    return {
      data: Array.isArray(response?.data) ? response.data : [],
      pagination: response?.pagination ?? {
        page: params?.page ?? 1,
        limit: params?.limit ?? 20,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
      },
      filters: response?.filters,
    };
  },

  getAll: async (): Promise<any[]> => {
    const result = await activosApi.getList();
    return result.data;
  },

  getById: async (id: string): Promise<any | null> => {
    const result = await activosApi.getList({ id, page: 1, limit: 1 });
    return result.data[0] ?? null;
  },

  create: async (data: any): Promise<any> => {
    return apiClient.post<any>('/api/activos', data);
  },

  update: async (id: string, data: any): Promise<any> => {
    return apiClient.patch<any>(`/api/activos/${id}`, data);
  },
};

export interface LogAuditoria {
  id: string;
  fecha_hora: string | null;
  comentarios: string | null;
  activo: {
    id: string | null;
    nombre: string | null;
    codigo_etiqueta: string | null;
  };
  ubicacion: string | null;
  auditor: string | null;
  plan_auditoria: string | null;
  metodo_auditoria: string | null;
  estado_reportado: string | null;
  estado_reportado_id: number;
}

export const logsAuditoriaApi = {
  getList: async (params?: {
    page?: number;
    limit?: number;
    auditorId?: string;
    activoId?: string;
    estadoId?: number;
  }): Promise<{
    data: LogAuditoria[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
    };
  }> => {
    const searchParams = new URLSearchParams();
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.set(key, String(value));
        }
      }
    }
    const queryString = searchParams.toString();
    const path = queryString
      ? `/api/logs-auditoria?${queryString}`
      : '/api/logs-auditoria';
    return apiClient.get<{ data: LogAuditoria[]; pagination: any }>(path);
  },
};

export const ubicacionesApi = {
  getOficinas: async (): Promise<any[]> => {
    return apiClient.get<any[]>('/api/ubicaciones/oficinas');
  },

  getEstantes: async (sedeId?: string): Promise<any[]> => {
    const path = sedeId
      ? `/api/ubicaciones/estantes?sedeId=${sedeId}`
      : '/api/ubicaciones/estantes';
    return apiClient.get<any[]>(path);
  },
};

export interface Categoria {
  id: string;
  nombre: string;
  tipo_rastreo: 'MOVIL' | 'FIJO';
}

export const categoriasApi = {
  getAll: async (): Promise<Categoria[]> => {
    return apiClient.get<Categoria[]>('/api/activos/categorias/list');
  },
};

export const usuariosApi = {
  getAll: async (): Promise<any[]> => {
    return apiClient.get<any[]>('/api/usuarios');
  },
};

export const estadosApi = {
  getAll: async (): Promise<any[]> => {
    return apiClient.get<any[]>('/api/activos/estados/list');
  },
};

export const departamentosApi = {
  getAll: async (): Promise<any[]> => {
    return apiClient.get<any[]>('/api/departamentos');
  },
};

/**
 * Cliente genérico para hacer peticiones con token automático
 */
export const apiClient = {
  get: async <T = any>(path: string): Promise<T> => {
    const response = await fetchWithInterceptor(`${API_BASE_URL}${path}`, {
      method: "GET",
    });
    return handleResponse(response);
  },

  post: async <T = any>(path: string, data?: any): Promise<T> => {
    const response = await fetchWithInterceptor(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    return handleResponse(response);
  },

  put: async <T = any>(path: string, data?: any): Promise<T> => {
    const response = await fetchWithInterceptor(`${API_BASE_URL}${path}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    return handleResponse(response);
  },

  patch: async <T = any>(path: string, data?: any): Promise<T> => {
    const response = await fetchWithInterceptor(`${API_BASE_URL}${path}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    return handleResponse(response);
  },

  delete: async <T = any>(path: string): Promise<T> => {
    const response = await fetchWithInterceptor(`${API_BASE_URL}${path}`, {
      method: "DELETE",
    });
    return handleResponse(response);
  },
};

export const auditoriasProgramadasApi = {
  getAll: async (): Promise<any[]> => {
    const data = await apiClient.get<any[]>("/api/auditorias-programadas");
    return Array.isArray(data) ? data : [];
  },
  getById: async (id: string): Promise<any | null> => {
    if (!id) return null;
    try {
      const data = await apiClient.get<any>(
        `/api/auditorias-programadas/${id}`,
      );
      return data ?? null;
    } catch {
      return null;
    }
  },
  getAllStates: async (): Promise<any[]> => {
    const data = await apiClient.get<any[]>(
      "/api/auditorias-programadas/estados",
    );
    return Array.isArray(data) ? data : [];
  },
  getAllAuditores: async (): Promise<any[]> => {
    const data = await apiClient.get<any[]>(
      "/api/auditorias-programadas/filtros/auditores",
    );
    return Array.isArray(data) ? data : [];
  },
  getAllEdificios: async (): Promise<any[]> => {
    const data = await apiClient.get<any[]>(
      "/api/auditorias-programadas/filtros/edificios",
    );
    return Array.isArray(data) ? data : [];
  },
  getAllSedes: async (): Promise<any[]> => {
    const data = await apiClient.get<any[]>(
      "/api/auditorias-programadas/filtros/sedes",
    );
    return Array.isArray(data) ? data : [];
  },
};
