import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { CheckCircle2, Clock3, ArrowRight, ClipboardList } from "lucide-react-native";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useAuditorias } from "../contexts/AuditoriasContext";
import { activosApi } from "@/api/activos";
import { auditoriasApi } from "@/api/auditorias";
import { resolveAuditoriaStatus } from "../data/auditoriaStatus";

type AuditProgressItem = {
  id: string;
  titulo: string;
  pendientes: number;
  auditados: number;
  total: number;
  porcentaje: number;
};

export default function SettingsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { auditorias } = useAuditorias();
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<AuditProgressItem[]>([]);

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
      if (!user?.id || activeAudits.length === 0) {
        setItems([]);
        return;
      }

      setIsLoading(true);
      try {
        const logs = await auditoriasApi.listarLogsPorAuditor(user.id);

        const list = await Promise.all(
          activeAudits.map(async (audit) => {
            const total = await activosApi.contarPorUbicacion({
              oficinaId: audit.oficina_id,
              estanteId: audit.estante_id,
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
            };
          }),
        );

        setItems(list);
      } catch (error) {
        console.error("Error cargando progreso de activos:", error);
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [activeAudits, user?.id]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <LinearGradient colors={["#0b1430", "#122452", "#1d3b82"]} style={styles.header}>
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
            <TouchableOpacity
              key={item.id}
              style={[styles.auditCard, { backgroundColor: colors.surface }]}
              activeOpacity={0.85}
              onPress={() => router.push(`/audit/${item.id}`)}
            >
              <View style={styles.auditCardHeader}>
                <Text style={[styles.auditTitle, { color: colors.text }]} numberOfLines={1}>
                  {item.titulo}
                </Text>
                <ArrowRight size={16} color={colors.primary} />
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
          ))
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 16,
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
