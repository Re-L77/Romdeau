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
  Calendar,
  CheckCircle,
  Target,
  LogOut,
  ShieldCheck,
} from "lucide-react-native";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

export default function ProfileScreen() {
  const { user, logout, validateSession } = useAuth();
  const { colors } = useTheme();

  // Refrescar datos del usuario al abrir el perfil
  useEffect(() => {
    validateSession();
  }, []);

  const stats = [
    {
      label: "Auditados",
      value: 127,
      Icon: CheckCircle,
      gradient: ["#10b981", "#059669"],
    },
    {
      label: "Tasa Éxito",
      value: "98%",
      Icon: Target,
      gradient: ["#3b82f6", "#2563eb"],
    },
    {
      label: "Días Activo",
      value: 12,
      Icon: Calendar,
      gradient: ["#f59e0b", "#d97706"],
    },
  ];

  const recentActivity = [
    {
      date: "2026-03-09 14:30",
      asset: "ACT-00045",
      status: "ENCONTRADO",
      location: "Oficina 301",
    },
    {
      date: "2026-03-09 11:15",
      asset: "ACT-00044",
      status: "ENCONTRADO",
      location: "Sala Juntas B",
    },
    {
      date: "2026-03-08 16:45",
      asset: "ACT-00043",
      status: "NO_LOCALIZADO",
      location: "Data Center",
    },
    {
      date: "2026-03-08 09:20",
      asset: "ACT-00042",
      status: "DAÑADO",
      location: "Oficina 405",
    },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "ENCONTRADO":
        return { bg: "#d1fae5", text: "#047857", label: "Encontrado" };
      case "NO_LOCALIZADO":
        return { bg: "#fee2e2", text: "#b91c1c", label: "No Localizado" };
      case "DAÑADO":
        return { bg: "#fef3c7", text: "#b45309", label: "Dañado" };
      default:
        return {
          bg: colors.surfaceSecondary,
          text: colors.textSecondary,
          label: status,
        };
    }
  };

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
            {user?.activo && <View style={styles.activeBadge} />}
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
            {user?.apellido_materno ? (
              <View style={styles.profileMeta}>
                <ShieldCheck size={14} color="rgba(255,255,255,0.6)" />
                <Text style={styles.profileMetaText}>
                  {user.activo ? "Cuenta activa" : "Cuenta inactiva"}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </LinearGradient>

      {/* Stats Cards */}
      <View style={styles.statsWrapper}>
        <View style={styles.statsRow}>
          {stats.map((stat) => {
            const Icon = stat.Icon;
            return (
              <View
                key={stat.label}
                style={[styles.statCard, { backgroundColor: colors.surface }]}
              >
                <LinearGradient
                  colors={stat.gradient}
                  style={styles.statIconBox}
                >
                  <Icon size={20} color="#fff" />
                </LinearGradient>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {stat.value}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                  {stat.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Recent Activity */}
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
          Actividad Reciente
        </Text>

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
                  <Text
                    style={[
                      styles.activityLocation,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {item.location}
                  </Text>
                </View>
                <View style={styles.activityRight}>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusStyle.bg },
                    ]}
                  >
                    <Text
                      style={[styles.statusText, { color: statusStyle.text }]}
                    >
                      {statusStyle.label}
                    </Text>
                  </View>
                  <Text
                    style={[styles.activityDate, { color: colors.textMuted }]}
                  >
                    {item.date.split(" ")[1]}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

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
  statsWrapper: {
    paddingHorizontal: 20,
    marginTop: -50,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  activityList: {
    borderRadius: 16,
    overflow: "hidden",
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  activityMain: {
    flex: 1,
    gap: 4,
  },
  activityAsset: {
    fontSize: 15,
    fontWeight: "600",
  },
  activityLocation: {
    fontSize: 12,
  },
  activityRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  activityDate: {
    fontSize: 11,
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
