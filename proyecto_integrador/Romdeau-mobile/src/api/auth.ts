import { apiClient } from "./client";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno?: string | null;
  nombre_completo?: string | null;
  rol_id: number;
  rol_nombre: string;
  activo: boolean;
  departamento_id?: number | null;
  departamento_nombre?: string | null;
  foto_perfil_url?: string | null;
  telefono?: string | null;
  created_at?: string | null;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in?: number; // Opcional - si no viene, usar valor por defecto
  user: AuthUser;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  expires_in?: number; // Opcional - si no viene, usar valor por defecto
}

export interface VerifyTokenResponse {
  valid: boolean;
  user: AuthUser;
}

export const authApi = {
  // Login con credenciales
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(
      "/api/auth/login",
      credentials,
    );
    return response.data;
  },

  // Refresh del token
  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await apiClient.post<RefreshTokenResponse>(
      "/api/auth/refresh-token",
      {
        refresh_token: refreshToken,
      },
    );
    return response.data;
  },

  // Verificar que el token sea válido
  verifyToken: async (): Promise<VerifyTokenResponse> => {
    const response = await apiClient.post<VerifyTokenResponse>(
      "/api/auth/verify-token",
    );
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    await apiClient.post("/api/auth/logout");
  },

  // Validar sesión
  validateSession: async (): Promise<VerifyTokenResponse> => {
    const response = await apiClient.get<VerifyTokenResponse>(
      "/api/auth/validate-session",
    );
    return response.data;
  },

  // Cambiar contraseña
  changePassword: async (
    currentPassword: string,
    newPassword: string,
  ): Promise<void> => {
    await apiClient.put("/api/auth/change-password", {
      currentPassword,
      newPassword,
    });
  },

  // Solicitar reset de contraseña
  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post("/api/auth/forgot-password", { email });
  },

  // Reset de contraseña con token
  resetPassword: async (
    newPassword: string,
    refreshToken: string,
  ): Promise<void> => {
    await apiClient.post("/api/auth/reset-password", {
      new_password: newPassword,
      refresh_token: refreshToken,
    });
  },
};
