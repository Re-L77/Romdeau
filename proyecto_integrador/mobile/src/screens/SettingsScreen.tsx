import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  Moon,
  Sun,
  Bell,
  Lock,
  Globe,
  HelpCircle,
  Info,
  LogOut,
  Shield,
  Database,
  ChevronRight,
  User,
  Badge,
} from "lucide-react-native";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { usePermissions, useRoleActions } from "../hooks/usePermissions";

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { colors, isDark, setThemeMode, themeMode } = useTheme();
  const { getRoleLabel } = usePermissions();
  const { getFullName, isActive } = useRoleActions();
  const [notifications, setNotifications] = useState(true);

  const toggleTheme = () => {
    setThemeMode(isDark ? "light" : "dark");
    console.log("🌓 [LOG] Tema cambiado a:", isDark ? "claro" : "oscuro");
  };

  const handleLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro de que deseas salir?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Salir",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const handleChangePassword = () => {
    Alert.alert(
      "Cambiar Contraseña",
      "Esta funcionalidad estaría implementada en el backend",
    );
  };

  const settingsSections = [
    {
      title: "Preferencias",
      items: [
        {
          label: "Modo Oscuro",
          icon: isDark ? Moon : Sun,
          value: isDark ? "Activado" : "Desactivado",
          toggle: true,
          isOn: isDark,
          onToggle: toggleTheme,
        },
        {
          label: "Notificaciones",
          icon: Bell,
          value: notifications ? "Activadas" : "Desactivadas",
          toggle: true,
          isOn: notifications,
          onToggle: () => setNotifications(!notifications),
        },
        {
          label: "Idioma",
          icon: Globe,
          value: "Español",
          onPress: () => Alert.alert("Idioma", "Español (México)"),
        },
      ],
    },
    {
      title: "Seguridad",
      items: [
        {
          label: "Cambiar Contraseña",
          icon: Lock,
          onPress: handleChangePassword,
        },
        {
          label: "Privacidad",
          icon: Shield,
          onPress: () =>
            Alert.alert(
              "Privacidad",
              "• Cifrado de extremo a extremo\n• Cumplimiento GDPR\n• Datos seguros en servidores",
            ),
        },
      ],
    },
    {
      title: "Soporte",
      items: [
        {
          label: "Centro de Ayuda",
          icon: HelpCircle,
          onPress: () => Alert.alert("Ayuda", "Guía rápida de auditoría"),
        },
        {
          label: "Acerca de",
          icon: Info,
          value: "v1.0.0",
          onPress: () =>
            Alert.alert("Romdeau Audit", "Versión 1.0.0\n\n© 2026 Romdeau"),
        },
        {
          label: "Limpiar Caché",
          icon: Database,
          onPress: () =>
            Alert.alert("Limpiar Caché", "¿Eliminar datos temporales?"),
        },
      ],
    },
  ];

  const getInitials = (): string => {
    if (!user) return "AA";
    const names = getFullName().split(" ");
    return (names[0]?.charAt(0) || "A") + (names[1]?.charAt(0) || "A");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={["#334155", "#1e293b", "#0f172a"]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Configuración</Text>
        <Text style={styles.headerSubtitle}>Personaliza tu experiencia</Text>
      </LinearGradient>

      {/* User Card */}
      <View style={styles.userCardWrapper}>
        <View style={[styles.userCard, { backgroundColor: colors.surface }]}>
          <View
            style={[
              styles.userAvatar,
              { backgroundColor: isActive() ? colors.primary : colors.error },
            ]}
          >
            <Text style={styles.userAvatarText}>
              {getInitials().toUpperCase()}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>
              {getFullName()}
            </Text>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
              {user?.email}
            </Text>
            <View style={styles.userRoleContainer}>
              <Badge size={14} color={colors.primary} />
              <Text style={[styles.userRole, { color: colors.textMuted }]}>
                {getRoleLabel(user?.rol_nombre || "")}
              </Text>
              {!isActive() && (
                <Text style={[styles.userRole, { color: colors.error }]}>
                  • Inactivo
                </Text>
              )}
            </View>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {settingsSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
              {section.title}
            </Text>
            <View
              style={[
                styles.sectionContent,
                { backgroundColor: colors.surface },
              ]}
            >
              {section.items.map((item, index) => {
                const Icon = item.icon;
                return (
                  <TouchableOpacity
                    key={item.label}
                    style={[
                      styles.settingItem,
                      index < section.items.length - 1 && {
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border,
                      },
                    ]}
                    onPress={item.toggle ? item.onToggle : item.onPress}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.settingIcon,
                        { backgroundColor: colors.surfaceSecondary },
                      ]}
                    >
                      <Icon size={20} color={colors.primary} />
                    </View>
                    <View style={styles.settingInfo}>
                      <Text
                        style={[styles.settingLabel, { color: colors.text }]}
                      >
                        {item.label}
                      </Text>
                      {item.value && (
                        <Text
                          style={[
                            styles.settingValue,
                            { color: colors.textMuted },
                          ]}
                        >
                          {item.value}
                        </Text>
                      )}
                    </View>
                    {item.toggle ? (
                      <View
                        style={[
                          styles.toggleSwitch,
                          {
                            backgroundColor: item.isOn
                              ? colors.primary
                              : colors.border,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.toggleKnob,
                            { transform: [{ translateX: item.isOn ? 20 : 0 }] },
                          ]}
                        />
                      </View>
                    ) : (
                      <ChevronRight size={20} color={colors.textMuted} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: "#fee2e2" }]}
          onPress={handleLogout}
        >
          <LogOut size={20} color="#b91c1c" />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 4,
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
  },
  userCardWrapper: {
    paddingHorizontal: 20,
    marginTop: -20,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 20,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: "#334155",
    justifyContent: "center",
    alignItems: "center",
  },
  userAvatarText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
  },
  userEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  userRoleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  userRole: {
    fontSize: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionContent: {
    borderRadius: 16,
    overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  settingValue: {
    fontSize: 12,
    marginTop: 2,
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: "center",
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
  },
  logoutText: {
    color: "#b91c1c",
    fontSize: 16,
    fontWeight: "600",
  },
});
