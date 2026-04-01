import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronRight,
} from "lucide-react-native";
import { useTheme } from "../contexts/ThemeContext";
import { useAuditorias } from "../contexts/AuditoriasContext";
import {
  AuditoriaStatusKey,
  getAuditoriaStatusLabel,
  resolveAuditoriaStatus,
} from "../data/auditoriaStatus";

type FilterType = "ALL" | 1 | 2 | 3 | 4 | 5;

export default function AssetListScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { auditorias } = useAuditorias();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterType>("ALL");
  const headerGradient = isDark
    ? (["#101a36", "#142752", "#1f3b79"] as const)
    : (["#326cff", "#4d7cff", "#7b9dff"] as const);

  const filteredAuditorias = auditorias.filter((audit) => {
    const matchesSearch =
      audit.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      audit.id.toString().includes(searchQuery);

    const status = resolveAuditoriaStatus(audit);
    const statusByFilter: Partial<
      Record<Exclude<FilterType, "ALL">, AuditoriaStatusKey>
    > = {
      1: "programada",
      2: "en_progreso",
      3: "completada",
      4: "cancelada",
      5: "vencida",
    };

    const matchesFilter =
      filterStatus === "ALL" || status === statusByFilter[filterStatus];

    return matchesSearch && matchesFilter;
  });

  const stats = {
    programada: auditorias.filter(
      (a) => resolveAuditoriaStatus(a) === "programada",
    ).length,
    enProgreso: auditorias.filter(
      (a) => resolveAuditoriaStatus(a) === "en_progreso",
    ).length,
    completada: auditorias.filter(
      (a) => resolveAuditoriaStatus(a) === "completada",
    ).length,
    cancelada: auditorias.filter(
      (a) => resolveAuditoriaStatus(a) === "cancelada",
    ).length,
    vencida: auditorias.filter((a) => resolveAuditoriaStatus(a) === "vencida")
      .length,
    total: auditorias.length,
  };

  const getStatusConfig = (status: AuditoriaStatusKey) => {
    switch (status) {
      case "programada":
        return {
          label: getAuditoriaStatusLabel(status),
          bgColor: "#dbeafe",
          textColor: "#1e40af",
          Icon: Clock,
        };
      case "en_progreso":
        return {
          label: getAuditoriaStatusLabel(status),
          bgColor: "#fef3c7",
          textColor: "#b45309",
          Icon: Clock,
        };
      case "completada":
        return {
          label: getAuditoriaStatusLabel(status),
          bgColor: "#d1fae5",
          textColor: "#047857",
          Icon: CheckCircle,
        };
      case "cancelada":
        return {
          label: getAuditoriaStatusLabel(status),
          bgColor: "#fee2e2",
          textColor: "#b91c1c",
          Icon: AlertCircle,
        };
      case "vencida":
        return {
          label: getAuditoriaStatusLabel(status),
          bgColor: "#fff7ed",
          textColor: "#ea580c",
          Icon: AlertCircle,
        };
      default:
        return {
          label: "Desconocido",
          bgColor: "#f3f4f6",
          textColor: "#6b7280",
          Icon: Clock,
        };
    }
  };

  const filters: {
    key: FilterType;
    label: string;
    count: number;
    activeColor: string;
  }[] = [
    {
      key: "ALL",
      label: "Todas",
      count: stats.total,
      activeColor: colors.primary,
    },
    {
      key: 1,
      label: "Programadas",
      count: stats.programada,
      activeColor: "#2563eb",
    },
    {
      key: 2,
      label: "En Progreso",
      count: stats.enProgreso,
      activeColor: "#f59e0b",
    },
    {
      key: 3,
      label: "Completadas",
      count: stats.completada,
      activeColor: "#10b981",
    },
    {
      key: 4,
      label: "Canceladas",
      count: stats.cancelada,
      activeColor: "#ef4444",
    },
    {
      key: 5,
      label: "Vencidas",
      count: stats.vencida,
      activeColor: "#ea580c",
    },
  ];

  const renderAuditoria = ({ item }: { item: (typeof auditorias)[0] }) => {
    const statusConfig = getStatusConfig(resolveAuditoriaStatus(item));
    const StatusIcon = statusConfig.Icon;
    const fecha = new Date(item.fecha_programada).toLocaleDateString("es-MX", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    return (
      <TouchableOpacity
        style={[styles.auditCard, { backgroundColor: colors.surface }]}
        onPress={() => router.push(`/audit/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.auditHeader}>
          <Text
            style={[styles.auditTitle, { color: colors.text }]}
            numberOfLines={2}
          >
            {item.titulo}
          </Text>
          <Text style={[styles.auditId, { color: colors.textMuted }]}>
            #{item.id}
          </Text>
        </View>

        <View style={styles.auditDetails}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusConfig.bgColor },
            ]}
          >
            <StatusIcon size={14} color={statusConfig.textColor} />
            <Text
              style={[styles.statusText, { color: statusConfig.textColor }]}
            >
              {statusConfig.label}
            </Text>
          </View>

          <Text style={[styles.auditDate, { color: colors.textMuted }]}>
            {fecha}
          </Text>
        </View>

        <ChevronRight size={20} color={colors.textMuted} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      {/* Header */}
      <LinearGradient colors={headerGradient} style={styles.header}>
        <Text style={styles.title}>Mis Auditorías</Text>

        {/* Search */}
        <View
          style={[
            styles.searchContainer,
            { borderColor: "rgba(255,255,255,0.28)" },
          ]}
        >
          <Search size={20} color="#dbeafe" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar por nombre o ID..."
            placeholderTextColor="rgba(219,234,254,0.75)"
          />
        </View>

        {/* Filters */}
        <FlatList
          horizontal
          data={filters}
          keyExtractor={(item) => item.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterPill,
                filterStatus === item.key
                  ? { backgroundColor: item.activeColor }
                  : { backgroundColor: "rgba(255,255,255,0.18)" },
              ]}
              onPress={() => setFilterStatus(item.key)}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color: filterStatus === item.key ? "#fff" : "#dbeafe",
                  },
                ]}
              >
                {item.label} ({item.count})
              </Text>
            </TouchableOpacity>
          )}
        />
      </LinearGradient>

      {/* List */}
      <FlatList
        data={filteredAuditorias}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderAuditoria}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <CheckCircle size={64} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>
              No se encontraron auditorías
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
              Intenta cambiar los filtros o la búsqueda
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  auditoriasSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f4f8",
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  auditoriasContainer: {
    gap: 12,
  },
  auditCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 18,
    marginBottom: 10,
    gap: 12,
    elevation: 5,
    shadowColor: "#20408e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  auditHeader: {
    flex: 1,
  },
  auditTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  auditId: {
    fontSize: 12,
    marginBottom: 8,
  },
  auditDetails: {
    flexDirection: "column",
    gap: 4,
    alignItems: "flex-end",
  },
  auditDate: {
    fontSize: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  auditCardTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
    lineHeight: 16,
  },
  auditCardEstado: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
  },
  auditCardDate: {
    fontSize: 11,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 16,
    textAlign: "center",
    color: "#ffffff",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
    marginBottom: 12,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#ffffff",
  },
  filtersContainer: {
    gap: 8,
    paddingBottom: 4,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 100,
    gap: 12,
  },
  assetCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  assetIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  assetInfo: {
    flex: 1,
    gap: 4,
  },
  assetHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  assetName: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  assetMeta: {
    fontSize: 12,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: 11,
    flex: 1,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    marginTop: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  emptySubtitle: {
    fontSize: 13,
  },
});
