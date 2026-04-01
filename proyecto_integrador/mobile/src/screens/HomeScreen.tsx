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
import { QrCode, List, Bell, Zap, ChevronRight } from "lucide-react-native";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useNotificaciones } from "../contexts/NotificacionesContext";
import { useAuditorias } from "../contexts/AuditoriasContext";
import { Alert } from "react-native";
import {
  getAuditoriaStatusLabel,
  resolveAuditoriaStatus,
} from "../data/auditoriaStatus";

interface AuditStats {
  pending: number;
  completed: number;
  cancelada: number;
  vencida: number;
  notFound: number;
  total: number;
}

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout, validateSession } = useAuth();
  const { colors, isDark } = useTheme();
  const { noLeidasCount, notificaciones } = useNotificaciones();
  const { auditorias, refresh: refreshAuditorias } = useAuditorias();
  const [lastNotificationCount, setLastNotificationCount] = useState(0);
  const notifications = noLeidasCount;
  const headerGradient = isDark
    ? (["#0b1430", "#122452", "#1d3b82"] as const)
    : (["#234fd9", "#2f66ff", "#5f8dff"] as const);
  const primaryActionGradient = isDark
    ? (["#2f66ff", "#2450cc"] as const)
    : (["#3b73ff", "#2f66ff"] as const);

  const stats: AuditStats = {
    pending: auditorias.filter(
      (a) => resolveAuditoriaStatus(a) === "programada",
    ).length,
    completed: auditorias.filter(
      (a) => resolveAuditoriaStatus(a) === "completada",
    ).length,
    cancelada: auditorias.filter(
      (a) => resolveAuditoriaStatus(a) === "cancelada",
    ).length,
    vencida: auditorias.filter((a) => resolveAuditoriaStatus(a) === "vencida")
      .length,
    notFound: 0,
    total: auditorias.length,
  };

  // Solo contar auditorías activas (sin canceladas/vencidas) para el progreso
  const activeAuditorias = auditorias.filter((a) => {
    const status = resolveAuditoriaStatus(a);
    return status !== "cancelada" && status !== "vencida";
  }).length;
  const completionRate =
    activeAuditorias > 0
      ? Math.round((stats.completed / activeAuditorias) * 100)
      : 0;

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
    validateSession();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient colors={headerGradient} style={styles.header}>
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
              colors={primaryActionGradient}
              style={styles.actionGradient}
            >
              <QrCode size={32} color="#fff" />
              <Text style={styles.actionTitle}>Escanear QR</Text>
              <Text style={styles.actionSubtitle}>Consultar activo</Text>
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

            {auditorias.slice(0, 5).map((audit) => {
              const status = resolveAuditoriaStatus(audit);

              const estadoColor =
                status === "programada"
                  ? "#2563eb"
                  : status === "en_progreso"
                    ? "#f59e0b"
                    : status === "completada"
                      ? "#10b981"
                      : status === "cancelada"
                        ? "#dc2626"
                        : status === "vencida"
                          ? "#ea580c"
                          : "#6b7280";

              const estadoLabel = getAuditoriaStatusLabel(status);

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
            {auditorias.length > 5 && (
              <TouchableOpacity
                style={[
                  styles.auditoryCard,
                  { backgroundColor: colors.surface },
                ]}
                activeOpacity={0.7}
                onPress={() => router.push("/(tabs)/assets")}
              >
                <View style={styles.auditContent}>
                  <Text style={[styles.auditTitle, { color: colors.primary }]}>
                    Ver todas ({auditorias.length - 5} más)
                  </Text>
                </View>
                <ChevronRight size={20} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={{ height: 24 }} />
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
    paddingBottom: 16,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 0,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.24)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 18,
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
    backgroundColor: "rgba(255,255,255,0.25)",
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
    backgroundColor: "rgba(8,18,48,0.36)",
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
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
    color: "#7df6be",
    fontSize: 18,
    fontWeight: "800",
  },
  progressBarBg: {
    height: 12,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#30d488",
    borderRadius: 6,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  progressInfo: {
    flexDirection: "column",
    gap: 8,
    marginBottom: 16,
  },
  progressInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressInfoText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    fontWeight: "500",
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
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 28,
  },
  actionCard: {
    flex: 1,
    borderRadius: 24,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 150,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 5,
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
    fontSize: 17,
    fontWeight: "800",
    marginTop: 10,
    color: "#fff",
  },
  actionSubtitle: {
    fontSize: 13,
    marginTop: 4,
    color: "rgba(255,255,255,0.8)",
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
  auditoriasSection: {
    marginBottom: 24,
  },
  auditoryCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    gap: 12,
    elevation: 4,
    shadowColor: "#1f3f93",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
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
