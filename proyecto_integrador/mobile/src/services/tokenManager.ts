import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthUser } from "@/api/auth";

const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  USER: "user",
  TOKEN_EXPIRY: "token_expiry",
};

// Fallback en memoria si AsyncStorage no está disponible
const memoryCache: Record<string, string> = {};

// Wrapper defensivo para AsyncStorage
const safeAsyncStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      // Intenta usar AsyncStorage primero
      const value = await AsyncStorage.getItem(key);
      return value;
    } catch (error: any) {
      // Si falla, usa fallback en memoria
      if (error?.message?.includes("Native module")) {
        console.warn(`AsyncStorage unavailable for ${key}, using memory cache`);
        return memoryCache[key] ?? null;
      }
      throw error;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      // Intenta usar AsyncStorage
      await AsyncStorage.setItem(key, value);
      // También guardar en memoria como backup
      memoryCache[key] = value;
    } catch (error: any) {
      // Si falla, usa fallback en memoria
      if (error?.message?.includes("Native module")) {
        console.warn(`AsyncStorage unavailable for ${key}, using memory cache`);
        memoryCache[key] = value;
        return;
      }
      throw error;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
      delete memoryCache[key];
    } catch (error: any) {
      if (error?.message?.includes("Native module")) {
        console.warn(`AsyncStorage unavailable for ${key}, using memory cache`);
        delete memoryCache[key];
        return;
      }
      throw error;
    }
  },
};

export class TokenManager {
  // Guardar tokens
  static async saveTokens(
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
  ): Promise<void> {
    try {
      // Guardar access token en Secure Store (encriptado)
      await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, accessToken);

      // Guardar refresh token en Secure Store (encriptado)
      await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);

      // Guardar fecha de expiración
      const expiryTime = Date.now() + expiresIn * 1000;
      await safeAsyncStorage.setItem(
        STORAGE_KEYS.TOKEN_EXPIRY,
        expiryTime.toString(),
      );
    } catch (error) {
      console.error("Error saving tokens:", error);
      throw error;
    }
  }

  // Obtener access token
  static async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error("Error getting access token:", error);
      return null;
    }
  }

  // Obtener refresh token
  static async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error("Error getting refresh token:", error);
      return null;
    }
  }

  // Guardar usuario
  static async saveUser(user: AuthUser): Promise<void> {
    try {
      await safeAsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error("Error saving user:", error);
      throw error;
    }
  }

  // Obtener usuario
  static async getUser(): Promise<AuthUser | null> {
    try {
      const userStr = await safeAsyncStorage.getItem(STORAGE_KEYS.USER);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  }

  // Verificar si el token está expirado
  static async isTokenExpired(): Promise<boolean> {
    try {
      const expiryStr = await safeAsyncStorage.getItem(
        STORAGE_KEYS.TOKEN_EXPIRY,
      );
      if (!expiryStr) return true;

      const expiryTime = parseInt(expiryStr, 10);
      // Refrescar 5 minutos antes de que expire
      const refreshThreshold = 5 * 60 * 1000;
      return Date.now() > expiryTime - refreshThreshold;
    } catch (error) {
      console.error("Error checking token expiry:", error);
      return true;
    }
  }

  // Limpiar todos los tokens
  static async clearTokens(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
      await safeAsyncStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
      await safeAsyncStorage.removeItem(STORAGE_KEYS.USER);
    } catch (error) {
      console.error("Error clearing tokens:", error);
      throw error;
    }
  }

  // Verificar si hay sesión activa
  static async hasActiveSession(): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      const user = await this.getUser();
      const isExpired = await this.isTokenExpired();

      return !!(token && user && !isExpired);
    } catch (error) {
      console.error("Error checking active session:", error);
      return false;
    }
  }
}
