import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  QrCode,
  List,
  Bell,
  TrendingUp,
  Zap,
  Clock,
  ChevronRight,
} from "lucide-react-native";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useNotificaciones } from "../contexts/NotificacionesContext";
import { useAuditorias } from "../contexts/AuditoriasContext";
import { Alert } from "react-native";

interface AuditStats {
  pending: number;
  completed: number;
  notFound: number;
  total: number;
}

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout, validateSession } = useAuth();
  const { colors, isDark } = useTheme();
  const { noLeidasCount, notificaciones } = useNotificaciones();
  const { auditorias, refresh: refreshAuditorias } = useAuditorias();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastNotificationCount, setLastNotificationCount] = useState(0);
  const notifications = noLeidasCount;

  const stats: AuditStats = {
    pending: auditorias.filter((a) => a.estado_id === 1).length,
    completed: auditorias.filter((a) => a.estado_id === 4).length,
    notFound: 0,
    total: auditorias.length,
  };

  const completionRate =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  // Detectar cuando llega una nueva notificación de auditoría asignada
  useEffect(() => {
    if (noLeidasCount > lastNotificationCount) {
      const nuevaNotif = notificaciones[0];
      if (nuevaNotif?.tipo === "AUDITORIA_ASIGNADA") {
        Alert.alert("📋 Nueva Auditoría", nuevaNotif.mensaje, [
          { text: "OK", onPress: refreshAuditorias },
        ]);
      }
      setLastNotificationCount(noLeidasCount);
    }
  }, [noLeidasCount]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    validateSession();
  }, []);

  const recentActivity = [
    {
      id: "ACT-00045",
      status: "ENCONTRADO",
      time: "14:30",
      location: "Oficina 301",
    },
    {
      id: "ACT-00044",
      status: "ENCONTRADO",
      time: "11:15",
      location: "Sala Juntas",
    },
    {
      id: "ACT-00043",
      status: "NO_LOCALIZADO",
      time: "Ayer",
      location: "Data Center",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ENCONTRADO":
        return "#10b981";
      case "NO_LOCALIZADO":
        return "#ef4444";
      case "DAÑADO":
        return "#f59e0b";
      default:
        return colors.textSecondary;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={["#334155", "#1e293b", "#0f172a"]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View style={styles.userInfo}>
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
            <View>
              <Text style={styles.userName}>
                {user?.nombre_completo ||
                  `${user?.nombres ?? ""} ${user?.apellido_paterno ?? ""}`.trim() ||
                  "Auditor"}
              </Text>
              <Text style={styles.userRole}>
                {user?.rol_nombre || "Auditor de Campo"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => router.push("/notificaciones")}
          >
            <Bell size={20} color="#fff" />
            {notifications > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationCount}>{notifications}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Auditorías Asignadas</Text>
            <Text style={styles.progressPercent}>
              {stats.total > 0 ? completionRate : 0}%
            </Text>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${stats.total > 0 ? completionRate : 0}%` },
              ]}
            />
          </View>
          <View style={styles.progressStats}>
            <View style={styles.progressStat}>
              <Text style={styles.statValue}>{stats.completed}</Text>
              <Text style={styles.statLabel}>Completadas</Text>
            </View>
            <View style={styles.progressStat}>
              <Text style={styles.statValue}>{stats.pending}</Text>
              <Text style={styles.statLabel}>Pendientes</Text>
            </View>
            <View style={styles.progressStat}>
              <Text style={[styles.statValue, { color: "#2563eb" }]}>
                {stats.total}
              </Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Acciones Rápidas
        </Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionCard, styles.scanCard]}
            onPress={() => router.push("/scanner")}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#2563eb", "#1d4ed8"]}
              style={styles.actionGradient}
            >
              <QrCode size={32} color="#fff" />
              <Text style={styles.actionTitle}>Escanear QR</Text>
              <Text style={styles.actionSubtitle}>Iniciar auditoría</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: colors.surface }]}
            onPress={() => router.push("/(tabs)/assets")}
            activeOpacity={0.8}
          >
            <List size={28} color={colors.primary} />
            <Text style={[styles.actionTitle, { color: colors.text }]}>
              Ver Lista
            </Text>
            <Text
              style={[styles.actionSubtitle, { color: colors.textSecondary }]}
            >
              {stats.pending} pendientes
            </Text>
          </TouchableOpacity>
        </View>

        {/* Auditorías Asignadas */}
        {auditorias.length > 0 && (
          <View style={styles.auditoriasSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Auditorías Asignadas
              </Text>
              <Text style={[styles.seeAll, { color: colors.primary }]}>
                {auditorias.length}
              </Text>
            </View>

            {auditorias.map((audit) => {
              const estadoColor =
                audit.estado_id === 1
                  ? "#2563eb"
                  : audit.estado_id === 2
                    ? "#f59e0b"
                    : audit.estado_id === 4
                      ? "#10b981"
                      : "#6b7280";

              const estadoLabel =
                audit.estado_id === 1
                  ? "Programada"
                  : audit.estado_id === 2
                    ? "En Progreso"
                    : audit.estado_id === 4
                      ? "Completada"
                      : "Cancelada";

              const fecha = new Date(audit.fecha_programada).toLocaleDateString(
                "es-MX",
                { month: "short", day: "numeric" },
              );

              return (
                <TouchableOpacity
                  key={audit.id}
                  style={[
                    styles.auditoryCard,
                    { backgroundColor: colors.surface },
                  ]}
                  activeOpacity={0.7}
                  onPress={() =>
                    audit.estado_id === 1
                      ? router.push("/scanner")
                      : router.push(`/audit/${audit.id}`)
                  }
                >
                  <View
                    style={[
                      styles.auditStateIndicator,
                      { backgroundColor: estadoColor },
                    ]}
                  />
                  <View style={styles.auditContent}>
                    <Text
                      style={[styles.auditTitle, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {audit.titulo}
                    </Text>
                    <Text style={[styles.auditState, { color: estadoColor }]}>
                      {estadoLabel}
                    </Text>
                    <Text
                      style={[
                        styles.auditDate,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {fecha}
                    </Text>
                  </View>
                  {audit.estado_id === 1 && (
                    <TouchableOpacity
                      style={[
                        styles.auditButton,
                        { backgroundColor: estadoColor },
                      ]}
                      onPress={(e) => {
                        e.stopPropagation();
                        router.push("/scanner");
                      }}
                    >
                      <Zap size={16} color="#fff" />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Recent Activity */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Actividad Reciente
            </Text>
            <TouchableOpacity>
              <Text style={[styles.seeAll, { color: colors.primary }]}>
                Ver todo
              </Text>
            </TouchableOpacity>
          </View>

          {recentActivity.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.activityItem, { backgroundColor: colors.surface }]}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.activityDot,
                  { backgroundColor: getStatusColor(item.status) },
                ]}
              />
              <View style={styles.activityInfo}>
                <Text style={[styles.activityId, { color: colors.text }]}>
                  {item.id}
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
              <Text style={[styles.activityTime, { color: colors.textMuted }]}>
                {item.time}
              </Text>
              <ChevronRight size={20} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Time Display */}
        <View style={[styles.timeCard, { backgroundColor: colors.surface }]}>
          <Clock size={20} color={colors.textSecondary} />
          <Text style={[styles.timeText, { color: colors.textSecondary }]}>
            {currentTime.toLocaleTimeString("es-MX", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
          <Text style={[styles.dateText, { color: colors.textMuted }]}>
            {currentTime.toLocaleDateString("es-MX", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </Text>
        </View>

        <View style={{ height: 100 }} />
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
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  avatarText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  userName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  userRole: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  notificationBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#1e293b",
  },
  notificationCount: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  progressCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  progressPercent: {
    color: "#10b981",
    fontSize: 18,
    fontWeight: "800",
  },
  progressBarBg: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 16,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#10b981",
    borderRadius: 4,
  },
  progressStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  progressStat: {
    alignItems: "center",
  },
  statValue: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
  },
  statLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 28,
  },
  actionCard: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 140,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  scanCard: {
    overflow: "hidden",
    padding: 0,
  },
  actionGradient: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 10,
    color: "#fff",
  },
  actionSubtitle: {
    fontSize: 12,
    marginTop: 4,
    color: "rgba(255,255,255,0.8)",
  },
  recentSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: "600",
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
    gap: 12,
  },
  activityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  activityInfo: {
    flex: 1,
  },
  activityId: {
    fontSize: 14,
    fontWeight: "600",
  },
  activityLocation: {
    fontSize: 12,
    marginTop: 2,
  },
  activityTime: {
    fontSize: 12,
    marginRight: 4,
  },
  timeCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  timeText: {
    fontSize: 18,
    fontWeight: "700",
  },
  dateText: {
    fontSize: 13,
    flex: 1,
    textAlign: "right",
  },
  auditoriasSection: {
    marginBottom: 24,
  },
  auditoryCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    gap: 12,
    elevation: 2,
  },
  auditStateIndicator: {
    width: 5,
    height: 60,
    borderRadius: 3,
  },
  auditContent: {
    flex: 1,
  },
  auditTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  auditState: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  auditDate: {
    fontSize: 12,
  },
  auditButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});
