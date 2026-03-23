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

export interface ApiError extends ExtendedApiError {}

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
