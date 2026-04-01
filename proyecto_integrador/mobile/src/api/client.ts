import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { API_URL } from "@/config/env";
import { TokenManager } from "@/services/tokenManager";

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  error: string;
}

class ApiClient {
  private client: AxiosInstance;
  private refreshing = false;
  private static baseURL = API_URL;
  private static readonly REQUEST_TIMEOUT = Number(process.env.EXPO_PUBLIC_API_TIMEOUT_MS || 30000);
  private static readonly AUTH_PUBLIC_ENDPOINTS = [
    "/api/auth/login",
    "/api/auth/refresh-token",
    "/api/auth/forgot-password",
    "/api/auth/reset-password",
  ];
  private failedQueue: Array<{
    onSuccess: (token: string) => void;
    onFailed: (error: AxiosError) => void;
  }> = [];

  constructor() {
    console.log("🔧 Inicializando API Client con baseURL:", ApiClient.baseURL);
    console.log("⏱️ Timeout de requests (ms):", ApiClient.REQUEST_TIMEOUT);

    this.client = axios.create({
      baseURL: ApiClient.baseURL,
      timeout: ApiClient.REQUEST_TIMEOUT,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Interceptor para añadir el token a las requests
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const fullUrl = ApiClient.baseURL + config.url;
        console.log(`📤 Request: ${config.method?.toUpperCase()} ${fullUrl}`);

        const requestUrl = config.url || "";
        const isPublicAuthRequest = ApiClient.AUTH_PUBLIC_ENDPOINTS.some(
          (endpoint) => requestUrl.includes(endpoint),
        );

        if (isPublicAuthRequest) {
          return config;
        }

        try {
          const token = await TokenManager.getAccessToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.warn("⚠️ Error getting access token:", error);
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Interceptor para manejar respuestas y errores
    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ Response: ${response.status} ${response.config.url}`);
        return response;
      },
      async (error: AxiosError<ApiErrorResponse>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };
        const requestUrl = originalRequest?.url || "";
        const isPublicAuthRequest = ApiClient.AUTH_PUBLIC_ENDPOINTS.some(
          (endpoint) => requestUrl.includes(endpoint),
        );

        // 401 en endpoints de auth pública (login, etc.) es comportamiento esperado,
        // no es un error del sistema — loguear a nivel warn, no error.
        const isExpected401 =
          isPublicAuthRequest && error.response?.status === 401;
        const isTimeoutError =
          error.code === "ECONNABORTED" ||
          (error.message && error.message.toLowerCase().includes("timeout"));

        if (isExpected401) {
          console.warn(
            `⚠️ Auth failed: ${error.response?.status} ${requestUrl}`,
            error.response?.data?.message,
          );
        } else if (isTimeoutError) {
          console.error(
            `❌ Timeout de conexión: ${requestUrl}`,
            {
              code: error.code,
              message: error.message,
              config: originalRequest,
            },
          );
        } else {
          console.error(
            `❌ Error: ${error.response?.status || error.code} ${requestUrl}`,
            { message: error.message, data: error.response?.data },
          );
        }

        // Si es error 401 (Unauthorized)
        if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest._retry &&
          !isPublicAuthRequest
        ) {
          if (this.refreshing) {
            // Si ya estamos refrescando, esperar en la cola
            return new Promise((resolve, reject) => {
              this.failedQueue.push({
                onSuccess: (token: string) => {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                  resolve(this.client(originalRequest));
                },
                onFailed: (err) => reject(err),
              });
            });
          }

          this.refreshing = true;
          originalRequest._retry = true;

          try {
            const refreshToken = await TokenManager.getRefreshToken();
            if (!refreshToken) {
              await TokenManager.clearTokens();
              return Promise.reject(error);
            }

            console.log("🔄 Intentando renovar token...");
            const response = await this.client.post<{
              access_token: string;
              expires_in?: number;
            }>("/api/auth/refresh-token", { refresh_token: refreshToken });

            const { access_token, expires_in } = response.data;
            const expiresInSeconds = expires_in || 86400; // 24h por defecto

            // Guardar nuevo token usando TokenManager (sincroniza ambos stores)
            await TokenManager.saveTokens(
              access_token,
              refreshToken,
              expiresInSeconds,
            );
            console.log("✅ Token renovado exitosamente");

            // Procesar la cola de requests pendientes
            this.failedQueue.forEach((prom) => prom.onSuccess(access_token));
            this.failedQueue = [];

            // Reintentar el request original
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            // Si el refresh falla, limpiar tokens localmente y rechazar
            console.error("❌ Error renovando token:", refreshError);
            await TokenManager.clearTokens();

            // Notificar la cola de errores
            this.failedQueue.forEach((prom) =>
              prom.onFailed(refreshError as AxiosError),
            );
            this.failedQueue = [];
            return Promise.reject(refreshError);
          } finally {
            this.refreshing = false;
          }
        }

        return Promise.reject(error);
      },
    );
  }

  getClient(): AxiosInstance {
    return this.client;
  }

  // Método para recrear el cliente con una nueva URL (para debugging)
  private recreateClient() {
    this.client = axios.create({
      baseURL: ApiClient.baseURL,
      timeout: ApiClient.REQUEST_TIMEOUT,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Volver a aplicar los mismos interceptores
    this.setupInterceptors();
  }

  // Método estático para cambiar URL en debugging
  static setBaseURL(newUrl: string) {
    console.log(`🔄 Cambiando API base URL a: ${newUrl}`);
    ApiClient.baseURL = newUrl;
    // Recrear el cliente con la nueva URL
    apiClientInstance.recreateClient();
  }

  static getBaseURL(): string {
    return ApiClient.baseURL;
  }
}

const apiClientInstance = new ApiClient();
export const apiClient = apiClientInstance.getClient();
export const ApiClientClass = ApiClient;
