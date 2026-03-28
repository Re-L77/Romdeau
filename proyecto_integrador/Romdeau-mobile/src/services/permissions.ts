/**
 * Enums y constantes de roles y permisos
 */

export enum UserRole {
  ADMIN = "ADMIN",
  AUDITOR = "AUDITOR",
  EMPLEADO = "EMPLEADO",
}

export enum RoleId {
  ADMIN = 1,
  AUDITOR = 2,
  EMPLEADO = 3,
}

export interface Permission {
  name: string;
  roles: UserRole[];
}

/**
 * Mapa de permisos por rol
 */
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.ADMIN]: [
    "manage_users",
    "create_users",
    "edit_users",
    "delete_users",
    "manage_settings",
    "view_audit_logs",
    "perform_audits",
    "view_assets",
    "manage_assets",
    "view_reports",
    "export_data",
  ],
  [UserRole.AUDITOR]: [
    "perform_audits",
    "view_assets",
    "view_reports",
    "export_data",
  ],
  [UserRole.EMPLEADO]: ["view_assets"],
};

/**
 * Mensajes por rol
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: "Administrador",
  [UserRole.AUDITOR]: "Auditor",
  [UserRole.EMPLEADO]: "Empleado",
};

/**
 * Accesos a pantallas por rol
 */
export const ROLE_SCREEN_ACCESS: Record<UserRole, string[]> = {
  [UserRole.ADMIN]: [
    "index",
    "scan",
    "assets",
    "audit",
    "manual-entry",
    "profile",
    "settings",
  ],
  [UserRole.AUDITOR]: [
    "index",
    "scan",
    "assets",
    "audit",
    "manual-entry",
    "profile",
    "settings",
  ],
  [UserRole.EMPLEADO]: ["index", "assets", "profile", "settings"],
};

/**
 * Service para validar permisos y accesos
 */
export class PermissionService {
  /**
   * Verificar si un rol tiene un permiso específico
   */
  static hasPermission(role: UserRole, permission: string): boolean {
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes(permission);
  }

  /**
   * Verificar si un rol puede acceder a una pantalla
   */
  static canAccessScreen(role: UserRole, screenName: string): boolean {
    const screens = ROLE_SCREEN_ACCESS[role] || [];
    return screens.includes(screenName);
  }

  /**
   * Obtener todas las pantallas accesibles para un rol
   */
  static getAccessibleScreens(role: UserRole): string[] {
    return ROLE_SCREEN_ACCESS[role] || [];
  }

  /**
   * Obtener el label del rol
   */
  static getRoleLabel(role: UserRole | string): string {
    return ROLE_LABELS[role as UserRole] || role;
  }

  /**
   * Convertir rol_id numérico a enum
   */
  static roleIdToEnum(roleId: number): UserRole {
    switch (roleId) {
      case RoleId.ADMIN:
        return UserRole.ADMIN;
      case RoleId.AUDITOR:
        return UserRole.AUDITOR;
      case RoleId.EMPLEADO:
      default:
        return UserRole.EMPLEADO;
    }
  }

  /**
   * Convertir enum a rol_id numérico
   */
  static roleEnumToId(role: UserRole): RoleId {
    switch (role) {
      case UserRole.ADMIN:
        return RoleId.ADMIN;
      case UserRole.AUDITOR:
        return RoleId.AUDITOR;
      case UserRole.EMPLEADO:
      default:
        return RoleId.EMPLEADO;
    }
  }
}
