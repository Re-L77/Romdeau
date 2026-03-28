import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { authApi, AuthUser } from "@/api/auth";
import { TokenManager } from "@/services/tokenManager";

export interface AuthContextType {
  isLoading: boolean;
  isSignout: boolean;
  user: AuthUser | null;
  isAuthenticated: boolean;
  canAccessAudit: boolean;
  canManageUsers: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  validateSession: () => Promise<boolean>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthState {
  isLoading: boolean;
  isSignout: boolean;
  user: AuthUser | null;
  error: string | null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useState<AuthState>({
    isLoading: true,
    isSignout: false,
    user: null,
    error: null,
  });

  // Bootstrap: Validar sesión al iniciar la app
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const storedUser = await TokenManager.getUser();
        const hasSession = await TokenManager.hasActiveSession();

        if (hasSession) {
          // Token aún válido — validar con el backend para obtener datos frescos
          try {
            const response = await authApi.validateSession();
            // Guardar usuario fresco en storage para próxima vez
            await TokenManager.saveUser(response.user);
            dispatch({
              isLoading: false,
              isSignout: false,
              user: response.user,
              error: null,
            });
          } catch {
            // Validación falló (sin red u otro error) — usar datos guardados si existen
            if (storedUser) {
              dispatch({
                isLoading: false,
                isSignout: false,
                user: storedUser,
                error: null,
              });
            } else {
              await TokenManager.clearTokens();
              dispatch({
                isLoading: false,
                isSignout: true,
                user: null,
                error: null,
              });
            }
          }
        } else {
          // Access token expirado — intentar renovar con refresh token
          const refreshToken = await TokenManager.getRefreshToken();

          if (refreshToken && storedUser) {
            try {
              const refreshResponse = await authApi.refreshToken(refreshToken);
              const expiresIn = refreshResponse.expires_in || 86400;
              await TokenManager.saveTokens(
                refreshResponse.access_token,
                refreshToken,
                expiresIn,
              );

              // Con el nuevo token, obtener datos frescos del usuario
              const sessionResponse = await authApi.validateSession();
              await TokenManager.saveUser(sessionResponse.user);
              dispatch({
                isLoading: false,
                isSignout: false,
                user: sessionResponse.user,
                error: null,
              });
            } catch {
              // Refresh falló — sesión expirada definitivamente
              await TokenManager.clearTokens();
              dispatch({
                isLoading: false,
                isSignout: true,
                user: null,
                error: null,
              });
            }
          } else {
            dispatch({
              isLoading: false,
              isSignout: true,
              user: null,
              error: null,
            });
          }
        }
      } catch (error) {
        console.error("Bootstrap error:", error);
        dispatch({
          isLoading: false,
          isSignout: true,
          user: null,
          error: null,
        });
      }
    };

    bootstrapAsync();
  }, []);

  // Refrescar token automáticamente cada 30 minutos
  useEffect(() => {
    if (!state.user) return;

    const refreshInterval = setInterval(
      async () => {
        try {
          const isExpired = await TokenManager.isTokenExpired();
          if (isExpired) {
            const refreshToken = await TokenManager.getRefreshToken();
            if (refreshToken) {
              const response = await authApi.refreshToken(refreshToken);
              const expiresIn = response.expires_in || 86400; // 24 horas por defecto
              await TokenManager.saveTokens(
                response.access_token,
                refreshToken,
                expiresIn,
              );
            }
          }
        } catch (error) {
          console.error("Token refresh error:", error);
          // Si el refresh falla, hacer logout
          dispatch({
            isLoading: false,
            isSignout: true,
            user: null,
            error: "Sesión expirada",
          });
        }
      },
      30 * 60 * 1000,
    ); // Cada 30 minutos

    return () => clearInterval(refreshInterval);
  }, [state.user]);

  const authContext: AuthContextType = {
    isLoading: state.isLoading,
    isSignout: state.isSignout,
    user: state.user,
    isAuthenticated: !!state.user && !state.isSignout,
    error: state.error,

    // Verificar permisos basados en rol
    canAccessAudit: ["AUDITOR", "ADMIN"].includes(state.user?.rol_nombre || ""),
    canManageUsers: state.user?.rol_nombre === "ADMIN",

    // Login con credenciales
    login: useCallback(
      async (email: string, password: string) => {
        dispatch({ ...state, isLoading: true, error: null });

        try {
          console.log("📡 Intentando login con:", email);
          const response = await authApi.login({ email, password });
          console.log("✅ Login exitoso:", response.user);

          // Guardar tokens de forma segura
          // Si expires_in no viene del backend, usar 24 horas (86400 segundos)
          const expiresIn = response.expires_in || 86400;
          await TokenManager.saveTokens(
            response.access_token,
            response.refresh_token,
            expiresIn,
          );

          // Guardar información del usuario
          await TokenManager.saveUser(response.user);

          dispatch({
            isLoading: false,
            isSignout: false,
            user: response.user,
            error: null,
          });

          console.log("✅ Usuario autenticado:", response.user.email);
        } catch (error: any) {
          console.error("❌ Login failed:", {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            config: error.config?.url,
          });

          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Error al iniciar sesión. Verifica tus credenciales.";

          dispatch({
            isLoading: false,
            isSignout: true,
            user: null,
            error: errorMessage,
          });

          throw error;
        }
      },
      [state],
    ),

    // Logout
    logout: useCallback(async () => {
      dispatch({ ...state, isLoading: true });

      try {
        // Notificar al backend
        await authApi.logout();
      } catch (error) {
        console.error("Logout error:", error);
      }

      // Limpiar tokens y usuario localmente
      await TokenManager.clearTokens();

      dispatch({
        isLoading: false,
        isSignout: true,
        user: null,
        error: null,
      });

      console.log("✅ Usuario desconectado");
    }, [state]),

    // Validar sesión actual
    validateSession: useCallback(async () => {
      try {
        const response = await authApi.validateSession();
        await TokenManager.saveUser(response.user);
        dispatch({
          ...state,
          user: response.user,
          isSignout: false,
        });
        return true;
      } catch (error) {
        // Si la validación falla, hacer logout
        await TokenManager.clearTokens();
        dispatch({
          ...state,
          user: null,
          isSignout: true,
          error: "Sesión inválida",
        });
        return false;
      }
    }, [state]),

    // Cambiar contraseña
    changePassword: useCallback(
      async (currentPassword: string, newPassword: string) => {
        dispatch({ ...state, isLoading: true, error: null });

        try {
          await authApi.changePassword(currentPassword, newPassword);
          dispatch({
            ...state,
            isLoading: false,
            error: null,
          });
          console.log("✅ Contraseña actualizada");
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || "Error al cambiar la contraseña.";

          dispatch({
            ...state,
            isLoading: false,
            error: errorMessage,
          });

          throw error;
        }
      },
      [state],
    ),
  };

  return (
    <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>
  );
}

// Hook para usar el contexto
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
