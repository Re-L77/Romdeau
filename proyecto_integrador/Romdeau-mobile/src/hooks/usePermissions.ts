import { useAuth } from "@/contexts/AuthContext";
import { PermissionService, UserRole } from "@/services/permissions";

/**
 * Hook personalizado para verificar permisos del usuario actual
 */
export function usePermissions() {
  const { user } = useAuth();

  if (!user) {
    return {
      hasPermission: () => false,
      canAccessScreen: () => false,
      getAccessibleScreens: () => [],
      getRoleLabel: (role: string) => role,
      currentRole: null as UserRole | null,
    };
  }

  const currentRole = user.rol_nombre as UserRole;

  return {
    /**
     * Verificar si el usuario tiene un permiso específico
     */
    hasPermission: (permission: string): boolean => {
      return PermissionService.hasPermission(currentRole, permission);
    },

    /**
     * Verificar si el usuario puede acceder a una pantalla
     */
    canAccessScreen: (screenName: string): boolean => {
      return PermissionService.canAccessScreen(currentRole, screenName);
    },

    /**
     * Obtener todas las pantallas accesibles para el usuario
     */
    getAccessibleScreens: (): string[] => {
      return PermissionService.getAccessibleScreens(currentRole);
    },

    /**
     * Obtener el label del rol del usuario
     */
    getRoleLabel: (role: string = currentRole): string => {
      return PermissionService.getRoleLabel(role);
    },

    /**
     * Role actual del usuario
     */
    currentRole,

    /**
     * Verificar si el usuario es ADMIN
     */
    isAdmin: (): boolean => currentRole === UserRole.ADMIN,

    /**
     * Verificar si el usuario es AUDITOR
     */
    isAuditor: (): boolean => currentRole === UserRole.AUDITOR,

    /**
     * Verificar si el usuario es EMPLEADO
     */
    isEmpleado: (): boolean => currentRole === UserRole.EMPLEADO,
  };
}

/**
 * Hook para facilitar acciones comunes relacionadas con roles
 */
export function useRoleActions() {
  const { user, logout } = useAuth();

  return {
    /**
     * Obtener el nombre completo del usuario
     */
    getFullName: (): string => {
      if (!user) return "Usuario";
      const { nombres, apellido_paterno, apellido_materno } = user;
      const parts = [nombres, apellido_paterno];
      if (apellido_materno) parts.push(apellido_materno);
      return parts.filter(Boolean).join(" ");
    },

    /**
     * Obtener información de contacto del usuario
     */
    getUserContact: () => ({
      email: user?.email || "",
      departamento_id: user?.departamento_id,
      foto_perfil_url: user?.foto_perfil_url,
    }),

    /**
     * Verificar si el usuario está activo
     */
    isActive: (): boolean => user?.activo ?? false,

    /**
     * Logout del usuario
     */
    logout,
  };
}
