import React, { useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Mail,
  Briefcase,
  LogOut,
  ShieldCheck,
  Phone,
  Building2,
  User,
  Clock,
} from "lucide-react-native";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return null;
  try {
    return new Date(dateStr).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return null;
  }
};

export default function ProfileScreen() {
  const { user, logout, validateSession } = useAuth();
  const { colors } = useTheme();

  // Refrescar datos del usuario al abrir el perfil
  useEffect(() => {
    validateSession();
  }, []);

  const infoRows: {
    IconComp: React.ComponentType<any>;
    label: string;
    value: string | null | undefined;
  }[] = [
    {
      IconComp: User,
      label: "Nombre completo",
      value:
        user?.nombre_completo ||
        `${user?.nombres ?? ""} ${user?.apellido_paterno ?? ""}${user?.apellido_materno ? ` ${user.apellido_materno}` : ""}`.trim() ||
        null,
    },
    { IconComp: Mail, label: "Correo electrónico", value: user?.email },
    { IconComp: Briefcase, label: "Rol", value: user?.rol_nombre },
    {
      IconComp: Building2,
      label: "Departamento",
      value: user?.departamento_nombre || null,
    },
    { IconComp: Phone, label: "Teléfono", value: user?.telefono || null },
    {
      IconComp: ShieldCheck,
      label: "Estado de cuenta",
      value: user?.activo === false ? "Inactiva" : "Activa",
    },
    {
      IconComp: Clock,
      label: "Cuenta creada",
      value: formatDate(user?.created_at),
    },
  ].filter((row) => row.value != null) as {
    IconComp: React.ComponentType<any>;
    label: string;
    value: string;
  }[];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={["#334155", "#1e293b", "#0f172a"]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Mi Perfil</Text>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <View style={styles.avatarWrapper}>
            {user?.foto_perfil_url ? (
              <Image
                source={{ uri: user.foto_perfil_url }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.nombres?.charAt(0).toUpperCase() || "A"}
                </Text>
              </View>
            )}
            {user?.activo !== false && <View style={styles.activeBadge} />}
          </View>
          <View style={styles.profileDetails}>
            <Text style={styles.profileName}>
              {user?.nombre_completo ||
                `${user?.nombres ?? ""} ${user?.apellido_paterno ?? ""}`.trim() ||
                "Usuario"}
            </Text>
            <View style={styles.profileMeta}>
              <Mail size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.profileMetaText}>{user?.email}</Text>
            </View>
            <View style={styles.profileMeta}>
              <Briefcase size={14} color="rgba(255,255,255,0.7)" />
              <Text style={styles.profileMetaText}>{user?.rol_nombre}</Text>
            </View>
            <View style={styles.profileMeta}>
              <ShieldCheck size={14} color="rgba(255,255,255,0.6)" />
              <Text style={styles.profileMetaText}>
                {user?.activo === false ? "Cuenta inactiva" : "Cuenta activa"}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Info card wrapper — overlaps header */}
      <View style={styles.infoCardWrapper}>
        <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
          {infoRows.map((row, index) => {
            const IconComp = row.IconComp;
            return (
              <View
                key={row.label}
                style={[
                  styles.infoRow,
                  index < infoRows.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.infoIconBox,
                    { backgroundColor: colors.surfaceSecondary },
                  ]}
                >
                  <IconComp size={16} color={colors.textSecondary} />
                </View>
                <View style={styles.infoTextBlock}>
                  <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
                    {row.label}
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {row.value}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Placeholder for future activity — remove this block when implemented */}
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
          Actividad Reciente
        </Text>
        <View
          style={[
            styles.activityPlaceholder,
            { backgroundColor: colors.surface },
          ]}
        >
          <Text
            style={[
              styles.activityPlaceholderText,
              { color: colors.textMuted },
            ]}
          >
            Próximamente
          </Text>
        </View>

        {/* LEGACY activity items kept here for reference — will be replaced with real data */}
        {/* 
        <View
          style={[styles.activityList, { backgroundColor: colors.surface }]}
        >
          {recentActivity.map((item, index) => {
            const statusStyle = getStatusStyle(item.status);
            return (
              <View
                key={index}
                style={[
                  styles.activityItem,
                  index < recentActivity.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <View style={styles.activityMain}>
                  <Text style={[styles.activityAsset, { color: colors.text }]}>
                    {item.asset}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
        */}

        {/* Logout */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: "#fee2e2" }]}
          onPress={logout}
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
    paddingBottom: 80,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 24,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  activeBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#10b981",
    borderWidth: 2,
    borderColor: "#1e293b",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  avatarText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "700",
  },
  profileDetails: {
    flex: 1,
    gap: 6,
  },
  profileName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  profileMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  profileMetaText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
  },
  infoCardWrapper: {
    paddingHorizontal: 20,
    marginTop: -40,
  },
  infoCard: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  infoIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  infoTextBlock: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  activityPlaceholder: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  activityPlaceholderText: {
    fontSize: 14,
    fontWeight: "500",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 16,
    borderRadius: 16,
    marginTop: 24,
  },
  logoutText: {
    color: "#b91c1c",
    fontSize: 16,
    fontWeight: "600",
  },
});
