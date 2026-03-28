import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import * as SecureStore from "expo-secure-store";
import { API_URL } from "@/config/env";

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  error: string;
}

class ApiClient {
  private client: AxiosInstance;
  private refreshing = false;
  private static baseURL = API_URL;
  private failedQueue: Array<{
    onSuccess: (token: string) => void;
    onFailed: (error: AxiosError) => void;
  }> = [];

  constructor() {
    console.log("🔧 Inicializando API Client con baseURL:", ApiClient.baseURL);

    this.client = axios.create({
      baseURL: ApiClient.baseURL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Interceptor para añadir el token a las requests
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const fullUrl = API_URL + config.url;
        console.log(`📤 Request: ${config.method?.toUpperCase()} ${fullUrl}`);

        const token = await SecureStore.getItemAsync("access_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
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

        console.error(
          `❌ Error: ${error.response?.status || error.code} ${originalRequest.url}`,
          {
            message: error.message,
            data: error.response?.data,
          },
        );

        // Si es error 401 (Unauthorized)
        if (error.response?.status === 401 && !originalRequest._retry) {
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
            const refreshToken =
              await SecureStore.getItemAsync("refresh_token");
            if (!refreshToken) {
              throw new Error("No refresh token available");
            }

            const response = await this.client.post<{ access_token: string }>(
              "/api/auth/refresh-token",
              { refresh_token: refreshToken },
            );

            const { access_token } = response.data;
            await SecureStore.setItemAsync("access_token", access_token);

            // Procesar la cola de requests pendientes
            this.failedQueue.forEach((prom) => prom.onSuccess(access_token));
            this.failedQueue = [];

            // Reintentar el request original
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            // Si el refresh falla, limpiar tokens y rechazar
            await SecureStore.deleteItemAsync("access_token");
            await SecureStore.deleteItemAsync("refresh_token");
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
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Volver a aplicar los mismos interceptores
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Interceptor para añadir el token a las requests
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const fullUrl = ApiClient.baseURL + config.url;
        console.log(`📤 Request: ${config.method?.toUpperCase()} ${fullUrl}`);

        const token = await SecureStore.getItemAsync("access_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
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

        console.error(
          `❌ Error: ${error.response?.status || error.code} ${originalRequest.url}`,
          {
            message: error.message,
            data: error.response?.data,
          },
        );

        // Si es error 401 (Unauthorized)
        if (error.response?.status === 401 && !originalRequest._retry) {
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
            const refreshToken =
              await SecureStore.getItemAsync("refresh_token");
            if (!refreshToken) {
              throw new Error("No refresh token available");
            }

            const response = await this.client.post<{ access_token: string }>(
              "/api/auth/refresh-token",
              { refresh_token: refreshToken },
            );

            const { access_token } = response.data;
            await SecureStore.setItemAsync("access_token", access_token);

            // Procesar la cola de requests pendientes
            this.failedQueue.forEach((prom) => prom.onSuccess(access_token));
            this.failedQueue = [];

            // Reintentar el request original
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            // Si el refresh falla, limpiar tokens y rechazar
            await SecureStore.deleteItemAsync("access_token");
            await SecureStore.deleteItemAsync("refresh_token");
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
