import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { PermissionService, UserRole } from "@/services/permissions";
import { Lock } from "lucide-react-native";

interface ProtectedScreenProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
  requiredPermission?: string;
  fallback?: React.ReactNode;
}

/**
 * Componente para proteger pantallas basado en roles y permisos
 */
export function ProtectedScreen({
  children,
  requiredRole,
  requiredPermission,
  fallback,
}: ProtectedScreenProps) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace("/");
    }
  }, [user]);

  if (!user) {
    return null;
  }

  // Verificar si el usuario tiene el rol requerido
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const hasRole = roles.includes(user.rol_nombre as UserRole);

    if (!hasRole) {
      return (
        fallback || (
          <View
            style={[styles.container, { backgroundColor: colors.background }]}
          >
            <View style={styles.contentContainer}>
              <Lock
                size={48}
                color={colors.error}
                style={{ marginBottom: 16 }}
              />
              <Text style={[styles.title, { color: colors.text }]}>
                Acceso Denegado
              </Text>
              <Text style={[styles.message, { color: colors.textSecondary }]}>
                Tu rol ({PermissionService.getRoleLabel(user.rol_nombre)}) no
                tiene permisos para acceder a esta pantalla.
              </Text>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={() => router.back()}
              >
                <Text style={styles.buttonText}>Volver</Text>
              </TouchableOpacity>
            </View>
          </View>
        )
      );
    }
  }

  // Verificar si el usuario tiene el permiso requerido
  if (requiredPermission) {
    const hasPermission = PermissionService.hasPermission(
      user.rol_nombre as UserRole,
      requiredPermission,
    );

    if (!hasPermission) {
      return (
        fallback || (
          <View
            style={[styles.container, { backgroundColor: colors.background }]}
          >
            <View style={styles.contentContainer}>
              <Lock
                size={48}
                color={colors.error}
                style={{ marginBottom: 16 }}
              />
              <Text style={[styles.title, { color: colors.text }]}>
                Permiso Requerido
              </Text>
              <Text style={[styles.message, { color: colors.textSecondary }]}>
                No tienes permiso para acceder a esta funcionalidad.
              </Text>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={() => router.back()}
              >
                <Text style={styles.buttonText}>Volver</Text>
              </TouchableOpacity>
            </View>
          </View>
        )
      );
    }
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  contentContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  errorText: {
    fontSize: 16,
    fontWeight: "600",
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
