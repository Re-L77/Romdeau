import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Bell,
  CheckCheck,
  ClipboardCheck,
  AlertTriangle,
  Info,
} from "lucide-react-native";
import { useTheme } from "../contexts/ThemeContext";
import { useNotificaciones } from "../contexts/NotificacionesContext";
import type { Notificacion } from "../api/notificaciones";

function getIconForTipo(tipo: string, color: string) {
  switch (tipo) {
    case "AUDITORIA_ASIGNADA":
      return <ClipboardCheck size={24} color={color} />;
    case "ALERTA":
      return <AlertTriangle size={24} color="#f59e0b" />;
    default:
      return <Info size={24} color={color} />;
  }
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Ahora";
  if (diffMin < 60) return `Hace ${diffMin}m`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Hace ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `Hace ${diffD}d`;
  return date.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}

export default function NotificacionesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const {
    notificaciones,
    noLeidasCount,
    isLoading,
    refresh,
    marcarLeida,
    marcarTodasLeidas,
  } = useNotificaciones();

  const handlePress = async (item: Notificacion) => {
    if (!item.leida) {
      await marcarLeida(item.id);
    }
  };

  const renderItem = ({ item }: { item: Notificacion }) => (
    <TouchableOpacity
      style={[
        styles.item,
        {
          backgroundColor: item.leida
            ? colors.surface
            : colors.surfaceSecondary,
          borderLeftColor: item.leida ? "transparent" : colors.primary,
        },
      ]}
      onPress={() => handlePress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.itemIcon}>
        {getIconForTipo(item.tipo, colors.primary)}
      </View>
      <View style={styles.itemContent}>
        <Text
          style={[
            styles.itemTitle,
            {
              color: colors.text,
              fontWeight: item.leida ? "400" : "600",
            },
          ]}
          numberOfLines={1}
        >
          {item.titulo}
        </Text>
        <Text
          style={[styles.itemMessage, { color: colors.textSecondary }]}
          numberOfLines={2}
        >
          {item.mensaje}
        </Text>
        <Text style={[styles.itemTime, { color: colors.textMuted }]}>
          {timeAgo(item.creado_en)}
        </Text>
      </View>
      {!item.leida && (
        <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Bell size={20} color={colors.text} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Notificaciones
          </Text>
          {noLeidasCount > 0 && (
            <View
              style={[styles.headerBadge, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.headerBadgeText}>{noLeidasCount}</Text>
            </View>
          )}
        </View>
        {noLeidasCount > 0 && (
          <TouchableOpacity
            onPress={marcarTodasLeidas}
            style={styles.markAllButton}
          >
            <CheckCheck size={20} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      <FlatList
        data={notificaciones}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refresh} />
        }
        contentContainerStyle={
          notificaciones.length === 0 ? styles.emptyContainer : undefined
        }
        ListEmptyComponent={
          <View style={styles.emptyContent}>
            <Bell size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No tienes notificaciones
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backButton: { marginRight: 12 },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  headerBadge: {
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: "center",
  },
  headerBadgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  markAllButton: { padding: 8 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderLeftWidth: 3,
    gap: 12,
  },
  itemIcon: { width: 40, alignItems: "center" },
  itemContent: { flex: 1 },
  itemTitle: { fontSize: 15, marginBottom: 2 },
  itemMessage: { fontSize: 13, lineHeight: 18 },
  itemTime: { fontSize: 11, marginTop: 4 },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  emptyContainer: { flex: 1 },
  emptyContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  emptyText: { fontSize: 16 },
});
