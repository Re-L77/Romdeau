import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import {
  apiClient,
  authApi,
  LoginResponse,
  ApiError,
  setRefreshTokenCallback,
} from "../services/api";
import { isTokenExpired } from "../utils/jwt";
import { ErrorType } from "../utils/errors";

export interface User {
  id: string;
  email: string;
  nombres?: string;
  apellido_paterno?: string;
  foto_perfil_url?: string;
  [key: string]: any;
}

export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isValidating: boolean;
  error: string | null;
  errorType: ErrorType | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  updateUser: (partial: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<ErrorType | null>(null);

  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  /**
   * Refresca el token de acceso
   */
  const performTokenRefresh = async (): Promise<string | null> => {
    if (isRefreshingRef.current) return accessToken;
    isRefreshingRef.current = true;

    try {
      const savedRefreshToken = localStorage.getItem("refreshToken");
      if (!savedRefreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await authApi.refreshToken(savedRefreshToken);
      const newAccessToken = response.access_token;
      const newRefreshToken = response.refresh_token;

      setAccessToken(newAccessToken);
      setRefreshToken(newRefreshToken);

      localStorage.setItem("accessToken", newAccessToken);
      localStorage.setItem("refreshToken", newRefreshToken);

      scheduleTokenRefresh(newAccessToken);
      return newAccessToken;
    } catch (err) {
      console.error("Token refresh failed:", err);
      // Si falla el refresh, limpiar sesión
      await performLogout();
      return null;
    } finally {
      isRefreshingRef.current = false;
    }
  };

  /**
   * Configura el callback de refresh para el cliente HTTP
   */
  useEffect(() => {
    setRefreshTokenCallback(performTokenRefresh);
  }, []);

  /**
   * Programa el refresh automático 1 minuto antes de que expire
   */
  const scheduleTokenRefresh = (token: string) => {
    // Limpiar timeout anterior
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    const timeUntilExpiration = isTokenExpired(token, 0)
      ? 0
      : Math.max(0, 60000); // Buffer de 1 minuto
    const timeToRefresh = Math.max(5000, timeUntilExpiration - 60000); // Refrescar 1 minuto antes

    refreshTimeoutRef.current = setTimeout(() => {
      performTokenRefresh();
    }, timeToRefresh);
  };

  /**
   * Valida la sesión al cargar la app
   */
  const validateSession = async () => {
    setIsValidating(true);
    const savedAccessToken = localStorage.getItem("accessToken");
    const savedRefreshToken = localStorage.getItem("refreshToken");
    const savedUser = localStorage.getItem("user");

    if (!savedAccessToken || !savedRefreshToken || !savedUser) {
      setIsValidating(false);
      return;
    }

    try {
      let activeToken = savedAccessToken;

      // Verificar si el token está expirado
      if (isTokenExpired(savedAccessToken, 0)) {
        // Token expirado, intentar refrescar
        const newToken = await performTokenRefresh();
        if (!newToken) {
          setIsValidating(false);
          return;
        }
        activeToken = newToken;
      } else {
        // Token válido, restaurar sesión
        setAccessToken(savedAccessToken);
        setRefreshToken(savedRefreshToken);
        setUser(JSON.parse(savedUser));
        scheduleTokenRefresh(savedAccessToken);
      }

      // Verificar que el token sea válido llamando al API
      await authApi.verifyToken(activeToken);

      try {
        // Refrescar datos de la bd
        const restoredUser = JSON.parse(savedUser);
        if (restoredUser?.id) {
          const userDetails = await apiClient.get(
            `/api/usuarios/${restoredUser.id}`,
          );
          if (userDetails) {
            const updatedUser = { ...restoredUser, ...userDetails };
            setUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));
          }
        }
      } catch (err) {
        console.warn("No se pudo refrescar el perfil de usuario", err);
      }

      setError(null);
      setErrorType(null);
    } catch (err) {
      console.error("Session validation failed:", err);
      // Limpiar sesión inválida
      await performLogout();
    } finally {
      setIsValidating(false);
    }
  };

  // Validar sesión al montar
  useEffect(() => {
    validateSession();

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    setErrorType(null);

    try {
      const response: LoginResponse = await authApi.login(email, password);

      let userInfo = response.user;

      localStorage.setItem("accessToken", response.access_token);
      localStorage.setItem("refreshToken", response.refresh_token);

      try {
        const userDetails = await apiClient.get(
          `/api/usuarios/${response.user.id}`,
        );
        if (userDetails) {
          userInfo = { ...userInfo, ...userDetails };
        }
      } catch (err) {
        console.warn(
          "No se pudo obtener información extendida del usuario",
          err,
        );
      }

      setAccessToken(response.access_token);
      setRefreshToken(response.refresh_token);
      setUser(userInfo);

      // Guardar en localStorage
      localStorage.setItem("user", JSON.stringify(userInfo));

      // Programar refresh automático
      scheduleTokenRefresh(response.access_token);
    } catch (err) {
      const apiError = err as ApiError;
      const errorMsg = apiError.message || "Error al iniciar sesión";
      const errType = apiError.type || "UNKNOWN";

      setError(errorMsg);
      setErrorType(errType);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const performLogout = async () => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    try {
      if (accessToken) {
        await authApi.logout(accessToken);
      }
    } catch (err) {
      console.error("Error during logout:", err);
    } finally {
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      setError(null);
      setErrorType(null);

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await performLogout();
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
    setErrorType(null);
  };

  const updateUser = (partial: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...partial };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  };

  const value: AuthContextType = {
    user,
    accessToken,
    refreshToken,
    isAuthenticated: !!accessToken && !!user,
    isLoading,
    isValidating,
    error,
    errorType,
    login,
    logout,
    clearError,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de AuthProvider");
  }
  return context;
}
