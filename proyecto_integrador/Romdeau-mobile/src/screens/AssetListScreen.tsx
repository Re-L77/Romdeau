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
  Package,
  MapPin,
  CheckCircle,
  Clock,
  XCircle,
  ChevronRight,
} from "lucide-react-native";
import { useTheme } from "../contexts/ThemeContext";

interface Asset {
  id: string;
  nombre: string;
  categoria: string;
  ubicacion: string;
  estado: "PENDIENTE" | "AUDITADO" | "NO_LOCALIZADO";
  valor: number;
}

const mockAssets: Asset[] = [
  {
    id: "ACT-00001",
    nombre: "Laptop Dell Latitude 5420",
    categoria: "Equipos de Cómputo",
    ubicacion: "Oficina 301 - Edificio A",
    estado: "PENDIENTE",
    valor: 25000,
  },
  {
    id: "ACT-00002",
    nombre: 'Monitor LG 27" 4K',
    categoria: "Equipos de Cómputo",
    ubicacion: "Oficina 301 - Edificio A",
    estado: "AUDITADO",
    valor: 8500,
  },
  {
    id: "ACT-00003",
    nombre: "Impresora HP LaserJet Pro",
    categoria: "Equipos de Oficina",
    ubicacion: "Sala de Juntas B",
    estado: "PENDIENTE",
    valor: 6200,
  },
  {
    id: "ACT-00004",
    nombre: "Escritorio Ejecutivo",
    categoria: "Mobiliario",
    ubicacion: "Oficina 305 - Edificio A",
    estado: "AUDITADO",
    valor: 12000,
  },
  {
    id: "ACT-00005",
    nombre: "Silla Ergonómica Herman Miller",
    categoria: "Mobiliario",
    ubicacion: "Oficina 305 - Edificio A",
    estado: "PENDIENTE",
    valor: 18500,
  },
  {
    id: "ACT-00006",
    nombre: "Servidor Dell PowerEdge R740",
    categoria: "Equipos de Cómputo",
    ubicacion: "Data Center - Edificio C",
    estado: "NO_LOCALIZADO",
    valor: 125000,
  },
  {
    id: "ACT-00007",
    nombre: "Proyector Epson EB-2250U",
    categoria: "Equipos de Oficina",
    ubicacion: "Sala de Capacitación",
    estado: "PENDIENTE",
    valor: 32000,
  },
  {
    id: "ACT-00008",
    nombre: 'Laptop MacBook Pro 16"',
    categoria: "Equipos de Cómputo",
    ubicacion: "Oficina 402 - Edificio B",
    estado: "AUDITADO",
    valor: 55000,
  },
  {
    id: "ACT-00009",
    nombre: "Aire Acondicionado Split",
    categoria: "Climatización",
    ubicacion: "Oficina 301 - Edificio A",
    estado: "PENDIENTE",
    valor: 15000,
  },
  {
    id: "ACT-00010",
    nombre: "UPS APC Smart-UPS 3000VA",
    categoria: "Equipos de Cómputo",
    ubicacion: "Data Center - Edificio C",
    estado: "AUDITADO",
    valor: 22000,
  },
];

type FilterType = "ALL" | "PENDIENTE" | "AUDITADO" | "NO_LOCALIZADO";

export default function AssetListScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterType>("ALL");

  const filteredAssets = mockAssets.filter((asset) => {
    const matchesSearch =
      asset.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.ubicacion.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterStatus === "ALL" || asset.estado === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const stats = {
    pendiente: mockAssets.filter((a) => a.estado === "PENDIENTE").length,
    auditado: mockAssets.filter((a) => a.estado === "AUDITADO").length,
    noLocalizado: mockAssets.filter((a) => a.estado === "NO_LOCALIZADO").length,
    total: mockAssets.length,
  };

  const getStatusConfig = (estado: Asset["estado"]) => {
    switch (estado) {
      case "PENDIENTE":
        return {
          label: "Pendiente",
          bgColor: "#fef3c7",
          textColor: "#b45309",
          Icon: Clock,
        };
      case "AUDITADO":
        return {
          label: "Auditado",
          bgColor: "#d1fae5",
          textColor: "#047857",
          Icon: CheckCircle,
        };
      case "NO_LOCALIZADO":
        return {
          label: "No Localizado",
          bgColor: "#fee2e2",
          textColor: "#b91c1c",
          Icon: XCircle,
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
      label: "Todos",
      count: stats.total,
      activeColor: colors.primary,
    },
    {
      key: "PENDIENTE",
      label: "Pendientes",
      count: stats.pendiente,
      activeColor: "#f59e0b",
    },
    {
      key: "AUDITADO",
      label: "Auditados",
      count: stats.auditado,
      activeColor: "#10b981",
    },
    {
      key: "NO_LOCALIZADO",
      label: "No Local.",
      count: stats.noLocalizado,
      activeColor: "#ef4444",
    },
  ];

  const renderAsset = ({ item, index }: { item: Asset; index: number }) => {
    const statusConfig = getStatusConfig(item.estado);
    const StatusIcon = statusConfig.Icon;

    return (
      <TouchableOpacity
        style={[styles.assetCard, { backgroundColor: colors.surface }]}
        onPress={() => router.push(`/audit/${item.id}`)}
        activeOpacity={0.7}
      >
        <View
          style={[styles.assetIcon, { backgroundColor: colors.primary + "20" }]}
        >
          <Package size={24} color={colors.primary} />
        </View>

        <View style={styles.assetInfo}>
          <View style={styles.assetHeader}>
            <Text
              style={[styles.assetName, { color: colors.text }]}
              numberOfLines={1}
            >
              {item.nombre}
            </Text>
          </View>

          <Text style={[styles.assetMeta, { color: colors.textSecondary }]}>
            {item.id} • {item.categoria}
          </Text>

          <View style={styles.locationRow}>
            <MapPin size={12} color={colors.textMuted} />
            <Text
              style={[styles.locationText, { color: colors.textMuted }]}
              numberOfLines={1}
            >
              {item.ubicacion}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusConfig.bgColor },
            ]}
          >
            <StatusIcon size={12} color={statusConfig.textColor} />
            <Text
              style={[styles.statusText, { color: statusConfig.textColor }]}
            >
              {statusConfig.label}
            </Text>
          </View>
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
          Activos Asignados
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
            placeholder="Buscar por nombre, ID o ubicación..."
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
        data={filteredAssets}
        keyExtractor={(item) => item.id}
        renderItem={renderAsset}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Package size={64} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>
              No se encontraron activos
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
