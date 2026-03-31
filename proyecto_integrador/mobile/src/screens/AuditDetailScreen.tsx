import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
  Image,
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

interface AuditDetailScreenProps {
  auditId: string;
}

export default function AuditDetailScreen({ auditId }: AuditDetailScreenProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const { auditorias } = useAuditorias();
  const [audit, setAudit] = useState<any>(null);

  useEffect(() => {
    const foundAudit = auditorias.find((a) => a.id === auditId);
    setAudit(foundAudit);
  }, [auditId, auditorias]);

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
    1: {
      label: "Programada",
      color: "#1e40af",
      bgColor: "#dbeafe",
      textColor: "#073397",
      icon: Calendar,
    },
    2: {
      label: "En Progreso",
      color: "#d97706",
      bgColor: "#fef3c7",
      textColor: "#92400e",
      icon: Play,
    },
    4: {
      label: "Completada",
      color: "#047857",
      bgColor: "#d1fae5",
      textColor: "#065f46",
      icon: Check,
    },
    3: {
      label: "Cancelada",
      color: "#dc2626",
      bgColor: "#fee2e2",
      textColor: "#991b1b",
      icon: AlertCircle,
    },
  };

  const config = estadoConfig[audit.estado_id as keyof typeof estadoConfig];
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

  const handleStartAudit = () => {
    if (audit.estado_id === 2) {
      router.push(`/scanner`);
    } else if (audit.estado_id === 1) {
      Alert.alert(
        "Auditoría aún no iniciada",
        "Esta auditoría está programada. Aguarda a que el supervisor la inicie.",
      );
    } else {
      Alert.alert(
        "No disponible",
        "Solo puedes auditar si la auditoría está en progreso",
      );
    }
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
        <Text style={styles.headerTitle}>Detalle de Auditoría</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Estado Card */}
        <View style={[styles.card, { backgroundColor: config.bgColor }]}>
          <View style={styles.estadoHeader}>
            <IconComp size={24} color={config.color} />
            <Text style={[styles.estadoLabel, { color: config.color }]}>
              {config.label}
            </Text>
          </View>
          <Text style={[styles.auditTitle, { color: config.textColor }]}>
            {audit.titulo}
          </Text>
          <Text style={[styles.auditId, { color: config.color }]}>
            ID: #{audit.id}
          </Text>
        </View>

        {/* Ubicación Jerárquica */}
        {(audit.oficinas || audit.estantes) && (
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Ubicación Jerárquica
            </Text>

            {audit.oficinas && (
              <>
                <View style={styles.hierarchyItem}>
                  <Text
                    style={[styles.hierarchyLabel, { color: colors.textMuted }]}
                  >
                    Sede:
                  </Text>
                  <Text style={[styles.hierarchyValue, { color: colors.text }]}>
                    {audit.oficinas.pisos.edificios.sedes.nombre}
                  </Text>
                </View>
                <View style={styles.hierarchyItem}>
                  <Text
                    style={[styles.hierarchyLabel, { color: colors.textMuted }]}
                  >
                    Edificio:
                  </Text>
                  <Text style={[styles.hierarchyValue, { color: colors.text }]}>
                    {audit.oficinas.pisos.edificios.nombre}
                  </Text>
                </View>
                <View style={styles.hierarchyItem}>
                  <Text
                    style={[styles.hierarchyLabel, { color: colors.textMuted }]}
                  >
                    Piso:
                  </Text>
                  <Text style={[styles.hierarchyValue, { color: colors.text }]}>
                    {audit.oficinas.pisos.nombre}
                  </Text>
                </View>
                <View style={styles.hierarchyItem}>
                  <Text
                    style={[styles.hierarchyLabel, { color: colors.textMuted }]}
                  >
                    Oficina:
                  </Text>
                  <Text style={[styles.hierarchyValue, { color: colors.text }]}>
                    {audit.oficinas.nombre}
                  </Text>
                </View>
              </>
            )}

            {audit.estantes && !audit.oficinas && (
              <>
                <View style={styles.hierarchyItem}>
                  <Text
                    style={[styles.hierarchyLabel, { color: colors.textMuted }]}
                  >
                    Sede:
                  </Text>
                  <Text style={[styles.hierarchyValue, { color: colors.text }]}>
                    {audit.estantes.pasillos.almacenes.sedes.nombre}
                  </Text>
                </View>
                <View style={styles.hierarchyItem}>
                  <Text
                    style={[styles.hierarchyLabel, { color: colors.textMuted }]}
                  >
                    Almacén:
                  </Text>
                  <Text style={[styles.hierarchyValue, { color: colors.text }]}>
                    {audit.estantes.pasillos.almacenes.nombre}
                  </Text>
                </View>
                <View style={styles.hierarchyItem}>
                  <Text
                    style={[styles.hierarchyLabel, { color: colors.textMuted }]}
                  >
                    Pasillo:
                  </Text>
                  <Text style={[styles.hierarchyValue, { color: colors.text }]}>
                    {audit.estantes.pasillos.nombre}
                  </Text>
                </View>
                <View style={styles.hierarchyItem}>
                  <Text
                    style={[styles.hierarchyLabel, { color: colors.textMuted }]}
                  >
                    Estante:
                  </Text>
                  <Text style={[styles.hierarchyValue, { color: colors.text }]}>
                    {audit.estantes.nombre}
                  </Text>
                </View>
              </>
            )}
          </View>
        )}

        {/* Información Principal */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Información General
          </Text>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Calendar size={20} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
                Fecha Programada
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {fechaFormato}
              </Text>
              <Text style={[styles.infoSubValue, { color: colors.textMuted }]}>
                {horaFormato}
              </Text>
            </View>
          </View>

          {audit.descripcion && (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <FileText size={20} color={colors.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
                    Descripción
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {audit.descripcion}
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Información del Auditor */}
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
                  <User size={24} color="#fff" />
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

        {/* Fechas Importantes */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Registros del Sistema
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
                      month: "long",
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
                      month: "long",
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
                  style={[
                    styles.timelineDot,
                    { backgroundColor: colors.primary },
                  ]}
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
                      month: "long",
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
                  style={[
                    styles.timelineDot,
                    { backgroundColor: colors.primary },
                  ]}
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
                      month: "long",
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

        {/* Action Button */}
        {(audit.estado_id === 1 || audit.estado_id === 2) && (
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor:
                  audit.estado_id === 2 ? colors.primary : "#cbd5e1",
              },
            ]}
            onPress={handleStartAudit}
            activeOpacity={audit.estado_id === 2 ? 0.7 : 1}
          >
            <Play
              size={20}
              color={audit.estado_id === 2 ? "#fff" : "#64748b"}
            />
            <Text
              style={[
                styles.actionButtonText,
                {
                  color: audit.estado_id === 2 ? "#fff" : "#64748b",
                },
              ]}
            >
              {audit.estado_id === 2
                ? "Continuar Auditoría"
                : "Auditoría Programada"}
            </Text>
          </TouchableOpacity>
        )}

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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  estadoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  estadoLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
  auditTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 4,
  },
  auditId: {
    fontSize: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
    marginVertical: 12,
  },
  technicalLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  technicalValue: {
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  hierarchyItem: {
    marginBottom: 12,
  },
  hierarchyLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  hierarchyValue: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  infoSubValue: {
    fontSize: 12,
    marginTop: 2,
  },
  auditoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  auditoreIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
  },
  auditorePhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 6,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 12,
  },
  timelineLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  timelineValue: {
    fontSize: 13,
    fontWeight: "500",
  },
  timelineDivider: {
    width: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
    marginLeft: 5,
    marginVertical: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
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
