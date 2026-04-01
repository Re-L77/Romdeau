import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  FileText,
  Check,
  AlertCircle,
  Play,
} from "lucide-react-native";
import { useTheme } from "../contexts/ThemeContext";
import { useAuditorias } from "../contexts/AuditoriasContext";
import { auditoriasApi } from "@/api/auditorias";
import {
  getAuditoriaStatusLabel,
  resolveAuditoriaStatus,
} from "../data/auditoriaStatus";

interface AuditDetailScreenProps {
  auditId: string;
}

export default function AuditDetailScreen({ auditId }: AuditDetailScreenProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const { auditorias, refresh } = useAuditorias();
  const [audit, setAudit] = useState<any>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const previousEstadoRef = useRef<number | null>(null);

  useEffect(() => {
    const foundAudit = auditorias.find((a) => a.id === auditId);
    setAudit(foundAudit);
  }, [auditId, auditorias]);

  useEffect(() => {
    refresh();
    const pollId = setInterval(() => {
      refresh();
    }, 10000);

    return () => clearInterval(pollId);
  }, [refresh]);

  useEffect(() => {
    if (!audit?.estado_id) return;

    if (
      previousEstadoRef.current !== null &&
      previousEstadoRef.current !== audit.estado_id
    ) {
      Alert.alert(
        "Estado actualizado",
        `La auditoría cambió a ${getAuditoriaStatusLabel(resolveAuditoriaStatus(audit))}.`,
      );
    }

    previousEstadoRef.current = audit.estado_id;
  }, [audit?.estado_id]);

  if (!audit) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Auditoría no encontrada
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const estadoConfig = {
    programada: {
      label: getAuditoriaStatusLabel("programada"),
      color: "#1e40af",
      bgColor: "#dbeafe",
      textColor: "#073397",
      icon: Calendar,
    },
    en_progreso: {
      label: getAuditoriaStatusLabel("en_progreso"),
      color: "#d97706",
      bgColor: "#fef3c7",
      textColor: "#92400e",
      icon: Play,
    },
    completada: {
      label: getAuditoriaStatusLabel("completada"),
      color: "#047857",
      bgColor: "#d1fae5",
      textColor: "#065f46",
      icon: Check,
    },
    cancelada: {
      label: getAuditoriaStatusLabel("cancelada"),
      color: "#dc2626",
      bgColor: "#fee2e2",
      textColor: "#991b1b",
      icon: AlertCircle,
    },
    vencida: {
      label: getAuditoriaStatusLabel("vencida"),
      color: "#ea580c",
      bgColor: "#fff7ed",
      textColor: "#9a3412",
      icon: AlertCircle,
    },
    desconocido: {
      label: getAuditoriaStatusLabel("desconocido"),
      color: "#6b7280",
      bgColor: "#f3f4f6",
      textColor: "#4b5563",
      icon: Clock,
    },
  };

  const status = resolveAuditoriaStatus(audit);
  const config = estadoConfig[status];
  const IconComp = config.icon;
  const fecha = new Date(audit.fecha_programada);
  const fechaFormato = fecha.toLocaleDateString("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const horaFormato = fecha.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleStartAudit = async () => {
    if (audit.estado_id !== 1 && audit.estado_id !== 2) {
      Alert.alert(
        "No disponible",
        "Solo puedes auditar si la auditoría está en progreso",
      );
      return;
    }

    setIsStarting(true);
    try {
      if (audit.estado_id === 1) {
        // Programada -> En Progreso
        await auditoriasApi.cambiarEstado(audit.id, 2);
      }

      await refresh();
      router.push(`/scanner?auditId=${audit.id}`);
    } catch (error) {
      console.error("Error iniciando auditoría:", error);
      Alert.alert("Error", "No se pudo iniciar la auditoría");
    } finally {
      setIsStarting(false);
    }
  };

  const handleCancelAudit = () => {
    Alert.alert(
      "Cancelar Auditoría",
      "¿Seguro que deseas cancelar esta auditoría? Esta acción no se puede deshacer.",
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí, cancelar",
          style: "destructive",
          onPress: async () => {
            setIsCancelling(true);
            try {
              await auditoriasApi.cambiarEstado(audit.id, 4);
              await refresh();
            } catch (error) {
              console.error("Error cancelando auditoría:", error);
              Alert.alert("Error", "No se pudo cancelar la auditoría");
            } finally {
              setIsCancelling(false);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <LinearGradient
        colors={["#334155", "#1e293b", "#0f172a"]}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Auditoría</Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        {/* Estado Card - Top Priority */}
        <View style={[styles.heroCard, { backgroundColor: config.bgColor }]}>
          <View style={styles.estadoHeader}>
            <IconComp size={32} color={config.color} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.estadoLabel, { color: config.color }]}>
                {config.label}
              </Text>
              <Text style={[styles.auditTitle, { color: config.textColor }]}>
                {audit.titulo}
              </Text>
            </View>
          </View>
        </View>

        {/* Auditor Card */}
        {audit.usuarios && (
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Auditor Asignado
            </Text>

            <View style={styles.auditoreRow}>
              {audit.usuarios.foto_perfil_url ? (
                <Image
                  source={{ uri: audit.usuarios.foto_perfil_url }}
                  style={styles.auditorePhoto}
                />
              ) : (
                <View style={styles.auditoreIcon}>
                  <User size={28} color="#fff" />
                </View>
              )}
              <View style={styles.auditoreContent}>
                <Text style={[styles.auditoryName, { color: colors.text }]}>
                  {audit.usuarios.nombre_completo}
                </Text>
                {audit.usuarios.email && (
                  <TouchableOpacity
                    onPress={() =>
                      Linking.openURL(`mailto:${audit.usuarios.email}`)
                    }
                  >
                    <Text
                      style={[styles.auditoryEmail, { color: colors.primary }]}
                    >
                      {audit.usuarios.email}
                    </Text>
                  </TouchableOpacity>
                )}
                {audit.usuarios.telefono && (
                  <TouchableOpacity
                    onPress={() =>
                      Linking.openURL(`tel:${audit.usuarios.telefono}`)
                    }
                  >
                    <Text
                      style={[styles.auditoryPhone, { color: colors.primary }]}
                    >
                      {audit.usuarios.telefono}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Información General */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Información
          </Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoGridItem}>
              <View style={styles.infoIcon}>
                <Calendar size={20} color={colors.primary} />
              </View>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
                Fecha
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {fechaFormato}
              </Text>
            </View>

            <View style={styles.infoGridItem}>
              <View style={styles.infoIcon}>
                <Clock size={20} color={colors.primary} />
              </View>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
                Hora
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {horaFormato}
              </Text>
            </View>
          </View>

          {audit.descripcion && (
            <>
              <View style={styles.divider} />
              <Text
                style={[
                  styles.infoLabel,
                  { color: colors.textMuted, marginBottom: 8 },
                ]}
              >
                Descripción
              </Text>
              <Text style={[styles.descriptionText, { color: colors.text }]}>
                {audit.descripcion}
              </Text>
            </>
          )}

          {/* Action Button */}
          {(audit.estado_id === 1 || audit.estado_id === 2) && (
            <>
              <View style={styles.divider} />
              <TouchableOpacity
                style={[
                  styles.cardActionButton,
                  { borderColor: `${colors.primary}66` },
                ]}
                onPress={handleStartAudit}
                activeOpacity={0.8}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                disabled={isStarting}
              >
                <LinearGradient
                  colors={[
                    colors.primary,
                    colors.primaryDark || colors.primary,
                  ]}
                  style={styles.cardButtonGradient}
                >
                  <View style={styles.cardButtonIconWrap}>
                    {isStarting ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Play size={20} color="#fff" strokeWidth={2.5} />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cardButtonText, { color: "#fff" }]}>
                      {isStarting
                        ? "Actualizando..."
                        : audit.estado_id === 2
                          ? "Continuar Auditoría"
                          : "Seleccionar Auditoría"}
                    </Text>
                    <Text style={styles.cardButtonSubtext}>
                      {audit.estado_id === 2
                        ? "Escanea activos vinculados"
                        : "Iniciar y abrir escáner"}
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelActionButton}
                onPress={handleCancelAudit}
                activeOpacity={0.85}
                disabled={isCancelling}
              >
                <LinearGradient
                  colors={["#dc2626", "#991b1b"]}
                  style={styles.cancelButtonGradient}
                >
                  <View style={styles.cancelButtonIconWrap}>
                    {isCancelling ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <AlertCircle size={16} color="#fff" />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cancelButtonText}>
                      {isCancelling ? "Cancelando..." : "Cancelar Auditoría"}
                    </Text>
                    <Text style={styles.cancelButtonSubtext}>
                      Cambiar estado a cancelada
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Ubicación */}
        {(audit.oficinas || audit.estantes) && (
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              <MapPin size={16} color={colors.primary} /> Ubicación
            </Text>

            {audit.oficinas && (
              <View style={styles.hierarchyContainer}>
                <View style={styles.hierarchyLevel}>
                  <Text
                    style={[styles.hierarchyLabel, { color: colors.textMuted }]}
                  >
                    Sede
                  </Text>
                  <Text style={[styles.hierarchyValue, { color: colors.text }]}>
                    {audit.oficinas.pisos.edificios.sedes.nombre}
                  </Text>
                </View>
                <View style={styles.hierarchyLevel}>
                  <Text
                    style={[styles.hierarchyLabel, { color: colors.textMuted }]}
                  >
                    Edificio
                  </Text>
                  <Text style={[styles.hierarchyValue, { color: colors.text }]}>
                    {audit.oficinas.pisos.edificios.nombre}
                  </Text>
                </View>
                <View style={styles.hierarchyLevel}>
                  <Text
                    style={[styles.hierarchyLabel, { color: colors.textMuted }]}
                  >
                    Piso
                  </Text>
                  <Text style={[styles.hierarchyValue, { color: colors.text }]}>
                    {audit.oficinas.pisos.nombre}
                  </Text>
                </View>
                <View style={styles.hierarchyLevel}>
                  <Text
                    style={[styles.hierarchyLabel, { color: colors.textMuted }]}
                  >
                    Oficina
                  </Text>
                  <Text style={[styles.hierarchyValue, { color: colors.text }]}>
                    {audit.oficinas.nombre}
                  </Text>
                </View>
              </View>
            )}

            {audit.estantes && !audit.oficinas && (
              <View style={styles.hierarchyContainer}>
                <View style={styles.hierarchyLevel}>
                  <Text
                    style={[styles.hierarchyLabel, { color: colors.textMuted }]}
                  >
                    Sede
                  </Text>
                  <Text style={[styles.hierarchyValue, { color: colors.text }]}>
                    {audit.estantes.pasillos.almacenes.sedes.nombre}
                  </Text>
                </View>
                <View style={styles.hierarchyLevel}>
                  <Text
                    style={[styles.hierarchyLabel, { color: colors.textMuted }]}
                  >
                    Almacén
                  </Text>
                  <Text style={[styles.hierarchyValue, { color: colors.text }]}>
                    {audit.estantes.pasillos.almacenes.nombre}
                  </Text>
                </View>
                <View style={styles.hierarchyLevel}>
                  <Text
                    style={[styles.hierarchyLabel, { color: colors.textMuted }]}
                  >
                    Pasillo
                  </Text>
                  <Text style={[styles.hierarchyValue, { color: colors.text }]}>
                    {audit.estantes.pasillos.nombre}
                  </Text>
                </View>
                <View style={styles.hierarchyLevel}>
                  <Text
                    style={[styles.hierarchyLabel, { color: colors.textMuted }]}
                  >
                    Estante
                  </Text>
                  <Text style={[styles.hierarchyValue, { color: colors.text }]}>
                    {audit.estantes.nombre}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Timeline */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Historial
          </Text>

          <View style={styles.timelineItem}>
            <View
              style={[styles.timelineDot, { backgroundColor: colors.primary }]}
            />
            <View style={styles.timelineContent}>
              <Text style={[styles.timelineLabel, { color: colors.textMuted }]}>
                Creado
              </Text>
              <Text style={[styles.timelineValue, { color: colors.text }]}>
                {audit.created_at
                  ? new Date(audit.created_at).toLocaleDateString("es-MX", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "No disponible"}
              </Text>
            </View>
          </View>

          {audit.updated_at && (
            <>
              <View style={styles.timelineDivider} />
              <View style={styles.timelineItem}>
                <View
                  style={[
                    styles.timelineDot,
                    { backgroundColor: colors.primary },
                  ]}
                />
                <View style={styles.timelineContent}>
                  <Text
                    style={[styles.timelineLabel, { color: colors.textMuted }]}
                  >
                    Actualizado
                  </Text>
                  <Text style={[styles.timelineValue, { color: colors.text }]}>
                    {new Date(audit.updated_at).toLocaleDateString("es-MX", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              </View>
            </>
          )}

          {audit.fecha_inicio && (
            <>
              <View style={styles.timelineDivider} />
              <View style={styles.timelineItem}>
                <View
                  style={[styles.timelineDot, { backgroundColor: "#f59e0b" }]}
                />
                <View style={styles.timelineContent}>
                  <Text
                    style={[styles.timelineLabel, { color: colors.textMuted }]}
                  >
                    Inicio
                  </Text>
                  <Text style={[styles.timelineValue, { color: colors.text }]}>
                    {new Date(audit.fecha_inicio).toLocaleDateString("es-MX", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              </View>
            </>
          )}

          {audit.fecha_fin && (
            <>
              <View style={styles.timelineDivider} />
              <View style={styles.timelineItem}>
                <View
                  style={[styles.timelineDot, { backgroundColor: "#10b981" }]}
                />
                <View style={styles.timelineContent}>
                  <Text
                    style={[styles.timelineLabel, { color: colors.textMuted }]}
                  >
                    Cierre
                  </Text>
                  <Text style={[styles.timelineValue, { color: colors.text }]}>
                    {new Date(audit.fecha_fin).toLocaleDateString("es-MX", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  heroCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  estadoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  estadoLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
  auditTitle: {
    fontSize: 20,
    fontWeight: "900",
    marginTop: 4,
    lineHeight: 26,
  },
  auditId: {
    fontSize: 12,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  infoGrid: {
    flexDirection: "row",
    gap: 12,
  },
  infoGridItem: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.02)",
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.08)",
    marginVertical: 12,
  },
  descriptionText: {
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  hierarchyContainer: {
    gap: 10,
  },
  hierarchyLevel: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderLeftWidth: 2,
    borderLeftColor: "#3b82f6",
    backgroundColor: "rgba(59, 130, 246, 0.05)",
    borderRadius: 6,
  },
  hierarchyLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 3,
  },
  hierarchyValue: {
    fontSize: 13,
    fontWeight: "600",
  },
  primaryActionButton: {
    borderRadius: 16,
    marginHorizontal: 0,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    minHeight: 70,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 14,
    minHeight: 70,
    justifyContent: "flex-start",
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: "800",
  },
  primaryButtonSubtext: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
  },
  cardActionButton: {
    borderRadius: 16,
    marginTop: 8,
    overflow: "hidden",
    borderWidth: 1,
    elevation: 4,
    shadowColor: "#1d4ed8",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    minHeight: 64,
  },
  cardButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
    minHeight: 64,
    justifyContent: "flex-start",
  },
  cardButtonIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardButtonText: {
    fontSize: 16,
    fontWeight: "800",
  },
  cardButtonSubtext: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    marginTop: 2,
  },
  cancelActionButton: {
    borderRadius: 16,
    marginTop: 10,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#7f1d1d",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  cancelButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  cancelButtonIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
  cancelButtonSubtext: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 11,
    marginTop: 1,
  },
  auditoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  auditoreIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
  },
  auditorePhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  auditoreContent: {
    flex: 1,
  },
  auditoryName: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  auditoryEmail: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 2,
  },
  auditoryPhone: {
    fontSize: 13,
    fontWeight: "500",
  },
  timelineItem: {
    flexDirection: "row",
    gap: 12,
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: 5,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 12,
  },
  timelineLabel: {
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  timelineValue: {
    fontSize: 13,
    fontWeight: "500",
  },
  timelineDivider: {
    width: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
    marginLeft: 7,
    marginVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
