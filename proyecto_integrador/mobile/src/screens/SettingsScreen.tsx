import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  CheckCircle2,
  Clock3,
  ArrowRight,
  ClipboardList,
  ChevronDown,
  ChevronUp,
  Package,
} from "lucide-react-native";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useAuditorias } from "../contexts/AuditoriasContext";
import { activosApi, ActivoDetalle } from "@/api/activos";
import { auditoriasApi } from "@/api/auditorias";
import { supabase } from "@/config/supabase";
import { resolveAuditoriaStatus } from "../data/auditoriaStatus";

type AuditProgressItem = {
  id: string;
  titulo: string;
  pendientes: number;
  auditados: number;
  total: number;
  porcentaje: number;
  activos: ActivoDetalle[];
  activosAuditadosIds: string[];
};

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const headerGradient = isDark
    ? (["#0b1430", "#122452", "#1d3b82"] as const)
    : (["#234fd9", "#2f66ff", "#5f8dff"] as const);
  const { user } = useAuth();
  const { auditorias } = useAuditorias();
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<AuditProgressItem[]>([]);
  const [expandedAuditIds, setExpandedAuditIds] = useState<string[]>([]);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [logsRealtimeTick, setLogsRealtimeTick] = useState(0);

  const activeAudits = useMemo(
    () =>
      auditorias.filter((audit) => {
        const status = resolveAuditoriaStatus(audit);
        return status === "programada" || status === "en_progreso";
      }),
    [auditorias],
  );

  const globalStats = useMemo(() => {
    const total = items.reduce((sum, item) => sum + item.total, 0);
    const auditados = items.reduce((sum, item) => sum + item.auditados, 0);
    const pendientes = Math.max(total - auditados, 0);
    const porcentaje = total > 0 ? Math.round((auditados / total) * 100) : 0;

    return { total, auditados, pendientes, porcentaje };
  }, [items]);

  useEffect(() => {
    const loadProgress = async () => {
      const showBlockingLoader = !hasLoadedOnce;

      if (!user?.id || activeAudits.length === 0) {
        setItems([]);
        setHasLoadedOnce(true);
        return;
      }

      if (showBlockingLoader) {
        setIsLoading(true);
      }
      try {
        const logs = await auditoriasApi.listarLogsPorAuditor(user.id);

        const list = await Promise.all(
          activeAudits.map(async (audit) => {
            const total = await activosApi.contarPorUbicacion({
              oficinaId: audit.oficina_id,
              estanteId: audit.estante_id,
            });
            const activos = await activosApi.listarPorUbicacion({
              oficinaId: audit.oficina_id,
              estanteId: audit.estante_id,
              limit: 25,
            });

            const auditadosSet = new Set(
              logs
                .filter((log) => {
                  const auditId = log.auditoria || log.auditorias_programadas?.id;
                  return auditId === audit.id;
                })
                .map((log) => log.activo_id),
            );

            const auditados = Math.min(auditadosSet.size, total);
            const pendientes = Math.max(total - auditados, 0);
            const porcentaje = total > 0 ? Math.round((auditados / total) * 100) : 0;

            return {
              id: audit.id,
              titulo: audit.titulo,
              pendientes,
              auditados,
              total,
              porcentaje,
              activos,
              activosAuditadosIds: Array.from(auditadosSet),
            };
          }),
        );

        setItems(list);
        setHasLoadedOnce(true);
      } catch (error) {
        console.error("Error cargando progreso de activos:", error);
        if (showBlockingLoader) {
          setItems([]);
        }
      } finally {
        if (showBlockingLoader) {
          setIsLoading(false);
        }
      }
    };

    loadProgress();
  }, [activeAudits, user?.id, hasLoadedOnce, logsRealtimeTick]);

  useEffect(() => {
    setHasLoadedOnce(false);
    setItems([]);
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    const channelName = `logs-auditoria-settings:auditor_id=${user.id}`;
    supabase
      .getChannels()
      .filter((existingChannel) =>
        existingChannel.topic.includes(channelName),
      )
      .forEach((existingChannel) => {
        supabase.removeChannel(existingChannel);
      });

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "logs_auditoria",
          filter: `auditor_id=eq.${user.id}`,
        },
        () => {
          setLogsRealtimeTick((value) => value + 1);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const toggleExpanded = (auditId: string) => {
    setExpandedAuditIds((current) =>
      current.includes(auditId)
        ? current.filter((id) => id !== auditId)
        : [...current, auditId],
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={headerGradient}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <Text style={styles.headerTitle}>Activos por Auditar</Text>
        <Text style={styles.headerSubtitle}>
          Progreso real de activos asignados a tus auditorias activas
        </Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}> 
          <View style={styles.summaryTopRow}>
            <Text style={[styles.summaryTitle, { color: colors.text }]}>Progreso Global</Text>
            <Text style={[styles.summaryPercent, { color: colors.primary }]}>
              {globalStats.porcentaje}%
            </Text>
          </View>

          <View
            style={[
              styles.progressBarBg,
              { backgroundColor: colors.surfaceSecondary || "#e5e7eb" },
            ]}
          >
            <View
              style={[
                styles.progressBarFill,
                { width: `${globalStats.porcentaje}%` },
              ]}
            />
          </View>

          <View style={styles.kpisRow}>
            <View style={styles.kpiItem}>
              <CheckCircle2 size={16} color="#10b981" />
              <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Auditados</Text>
              <Text style={[styles.kpiValue, { color: colors.text }]}>{globalStats.auditados}</Text>
            </View>
            <View style={styles.kpiItem}>
              <Clock3 size={16} color="#f59e0b" />
              <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Pendientes</Text>
              <Text style={[styles.kpiValue, { color: colors.text }]}>{globalStats.pendientes}</Text>
            </View>
            <View style={styles.kpiItem}>
              <ClipboardList size={16} color="#3b82f6" />
              <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Total</Text>
              <Text style={[styles.kpiValue, { color: colors.text }]}>{globalStats.total}</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Por auditoria activa</Text>

        {isLoading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text style={[styles.loaderText, { color: colors.textSecondary }]}>Cargando progreso...</Text>
          </View>
        ) : items.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface }]}> 
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Sin auditorias activas</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Cuando tengas auditorias programadas o en progreso, veras su avance aqui.</Text>
          </View>
        ) : (
          items.map((item) => (
            <View
              key={item.id}
              style={[styles.auditCard, { backgroundColor: colors.surface }]}
            >
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => toggleExpanded(item.id)}
              >
                <View style={styles.auditCardHeader}>
                  <Text style={[styles.auditTitle, { color: colors.text }]} numberOfLines={1}>
                    {item.titulo}
                  </Text>
                  {expandedAuditIds.includes(item.id) ? (
                    <ChevronUp size={18} color={colors.primary} />
                  ) : (
                    <ChevronDown size={18} color={colors.primary} />
                  )}
                </View>

                <View
                  style={[
                    styles.progressBarBg,
                    { backgroundColor: colors.surfaceSecondary || "#e5e7eb" },
                  ]}
                >
                  <View
                    style={[styles.progressBarFill, { width: `${item.porcentaje}%` }]}
                  />
                </View>

                <Text style={[styles.auditMeta, { color: colors.textSecondary }]}> 
                  {item.auditados} auditados de {item.total} | {item.pendientes} por auditar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.auditDetailButton}
                activeOpacity={0.85}
                onPress={() => router.push(`/audit/${item.id}`)}
              >
                <Text style={[styles.auditDetailButtonText, { color: colors.primary }]}> 
                  Ver detalle de auditoria
                </Text>
                <ArrowRight size={14} color={colors.primary} />
              </TouchableOpacity>

              {expandedAuditIds.includes(item.id) && (
                <View style={styles.assetsAccordionWrap}>
                  {item.activos.length === 0 ? (
                    <Text style={[styles.emptyAssetsText, { color: colors.textSecondary }]}> 
                      No hay activos cargados para este alcance.
                    </Text>
                  ) : (
                    item.activos.map((asset) => {
                      const isAudited = item.activosAuditadosIds.includes(asset.id);
                      const assetIdentifier = (asset.codigo_etiqueta || "").trim();

                      return (
                        <TouchableOpacity
                          key={asset.id}
                          style={[styles.assetRow, { backgroundColor: "rgba(59,130,246,0.06)" }]}
                          activeOpacity={0.85}
                          onPress={() => {
                            if (!assetIdentifier) {
                              Alert.alert(
                                "Activo sin codigo",
                                "Este activo no tiene codigo de etiqueta para abrir su vista detallada.",
                              );
                              return;
                            }

                            router.push(
                              `/audit/${encodeURIComponent(assetIdentifier)}`,
                            );
                          }}
                        >
                          <View style={styles.assetIconWrap}>
                            <Package
                              size={16}
                              color={isAudited ? "#10b981" : colors.primary}
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.assetTitle, { color: colors.text }]} numberOfLines={1}>
                              {asset.nombre || "Activo sin nombre"}
                            </Text>
                            <Text style={[styles.assetMeta, { color: colors.textSecondary }]} numberOfLines={1}>
                              {asset.codigo_etiqueta || "Sin codigo"}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.assetBadge,
                              {
                                backgroundColor: isAudited ? "#d1fae5" : "#fef3c7",
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.assetBadgeText,
                                { color: isAudited ? "#065f46" : "#92400e" },
                              ]}
                            >
                              {isAudited ? "Auditado" : "Pendiente"}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </View>
              )}
            </View>
          ))
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
    paddingHorizontal: 20,
    paddingBottom: 18,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.82)",
    marginTop: 6,
    fontSize: 13,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  summaryCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.18)",
    marginBottom: 18,
  },
  summaryTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  summaryPercent: {
    fontSize: 18,
    fontWeight: "800",
  },
  progressBarBg: {
    height: 10,
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#3b82f6",
    borderRadius: 999,
  },
  kpisRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  kpiItem: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
    backgroundColor: "rgba(59,130,246,0.06)",
  },
  kpiLabel: {
    marginTop: 5,
    fontSize: 11,
    fontWeight: "600",
  },
  kpiValue: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: "800",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },
  auditCard: {
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.14)",
  },
  auditCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  auditTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
  },
  auditMeta: {
    fontSize: 12,
    fontWeight: "500",
  },
  auditDetailButton: {
    marginTop: 10,
    marginBottom: 2,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  auditDetailButtonText: {
    fontSize: 12,
    fontWeight: "700",
  },
  assetsAccordionWrap: {
    gap: 8,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(59,130,246,0.14)",
  },
  emptyAssetsText: {
    fontSize: 12,
    fontWeight: "500",
    paddingVertical: 4,
  },
  assetRow: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  assetIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.74)",
    alignItems: "center",
    justifyContent: "center",
  },
  assetTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  assetMeta: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "500",
  },
  assetBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  assetBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  loaderWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
  },
  loaderText: {
    marginTop: 10,
    fontSize: 13,
  },
  emptyCard: {
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.14)",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: "center",
  },
});
