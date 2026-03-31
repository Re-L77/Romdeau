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

type FilterType = "ALL" | 1 | 2 | 3 | 4 | 5;

export default function AssetListScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { auditorias } = useAuditorias();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterType>("ALL");

  const filteredAuditorias = auditorias.filter((audit) => {
    const matchesSearch =
      audit.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      audit.id.toString().includes(searchQuery);

    const matchesFilter =
      filterStatus === "ALL" || audit.estado_id === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const stats = {
    programada: auditorias.filter((a) => a.estado_id === 1).length,
    enProgreso: auditorias.filter((a) => a.estado_id === 2).length,
    completada: auditorias.filter((a) => a.estado_id === 4).length,
    cancelada: auditorias.filter((a) => a.estado_id === 3).length,
    vencida: auditorias.filter((a) => a.estado_id === 5).length,
    total: auditorias.length,
  };

  const getStatusConfig = (estadoId: number) => {
    switch (estadoId) {
      case 1:
        return {
          label: "Programada",
          bgColor: "#dbeafe",
          textColor: "#1e40af",
          Icon: Clock,
        };
      case 2:
        return {
          label: "En Progreso",
          bgColor: "#fef3c7",
          textColor: "#b45309",
          Icon: Clock,
        };
      case 4:
        return {
          label: "Completada",
          bgColor: "#d1fae5",
          textColor: "#047857",
          Icon: CheckCircle,
        };
      case 3:
        return {
          label: "Cancelada",
          bgColor: "#fee2e2",
          textColor: "#b91c1c",
          Icon: AlertCircle,
        };
      case 5:
        return {
          label: "Vencida",
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
      key: 4,
      label: "Completadas",
      count: stats.completada,
      activeColor: "#10b981",
    },
    {
      key: 3,
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
    const statusConfig = getStatusConfig(item.estado_id);
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
      <View
        style={[
          styles.header,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <Text style={[styles.title, { color: colors.text }]}>
          Mis Auditorías
        </Text>

        {/* Search */}
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}
        >
          <Search size={20} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar por nombre o ID..."
            placeholderTextColor={colors.textMuted}
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
                  : { backgroundColor: colors.surfaceSecondary },
              ]}
              onPress={() => setFilterStatus(item.key)}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color:
                      filterStatus === item.key ? "#fff" : colors.textSecondary,
                  },
                ]}
              >
                {item.label} ({item.count})
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

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
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
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
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 16,
    textAlign: "center",
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
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  filtersContainer: {
    gap: 8,
    paddingBottom: 4,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
  },
  listContent: {
    padding: 16,
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
