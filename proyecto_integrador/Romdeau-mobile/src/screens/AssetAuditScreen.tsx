import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { LinearGradient } from "expo-linear-gradient";
import {
  X,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MapPin,
  Camera,
  Save,
  Clock,
  User,
  Package,
} from "lucide-react-native";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

interface AssetAuditScreenProps {
  assetId: string;
}

type AuditStatus = "ENCONTRADO" | "NO_LOCALIZADO" | "DAÑADO";

interface AuditData {
  asset_id: string;
  auditor_name: string;
  timestamp: string;
  status: AuditStatus;
  observaciones: string;
  nueva_ubicacion?: string;
  gps_latitude?: number;
  gps_longitude?: number;
  foto_evidencia?: string;
}

interface AssetInfo {
  id: string;
  nombre: string;
  marca: string;
  modelo: string;
  numero_serie: string;
  ubicacion_actual: string;
  valor: number;
  categoria: string;
}

export default function AssetAuditScreen({ assetId }: AssetAuditScreenProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();

  const [status, setStatus] = useState<AuditStatus>("ENCONTRADO");
  const [observaciones, setObservaciones] = useState("");
  const [nuevaUbicacion, setNuevaUbicacion] = useState("");
  const [fotoEvidencia, setFotoEvidencia] = useState<string | null>(null);
  const [gpsCoords, setGpsCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [ubicacionCambiada, setUbicacionCambiada] = useState(false);

  // Mock asset info
  const asset: AssetInfo = {
    id: assetId,
    nombre: "Laptop Dell Latitude 5420",
    marca: "Dell",
    modelo: "Latitude 5420",
    numero_serie: assetId,
    ubicacion_actual: "Oficina 301 - Edificio A",
    valor: 25000,
    categoria: "Equipos de Cómputo",
  };

  // RF7: Fecha y hora automática
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // RF17: Captura de geolocalización GPS
  useEffect(() => {
    (async () => {
      const { status: permStatus } =
        await Location.requestForegroundPermissionsAsync();
      if (permStatus === "granted") {
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setGpsCoords({
            lat: location.coords.latitude,
            lng: location.coords.longitude,
          });
          console.log(
            "📍 [LOG] GPS capturado:",
            location.coords.latitude,
            location.coords.longitude,
          );
        } catch (error) {
          console.log("⚠️ [LOG] GPS no disponible");
        }
      }
    })();
  }, []);

  const handleTakePhoto = () => {
    // En producción usar expo-image-picker
    setFotoEvidencia("mock_photo_" + Date.now());
    Alert.alert("✅ Foto capturada", "La foto de evidencia ha sido guardada.");
  };

  const handleSave = () => {
    if (status === "DAÑADO" && !fotoEvidencia) {
      Alert.alert(
        "⚠️ Evidencia Obligatoria",
        "Debes tomar una foto del activo dañado antes de guardar.",
      );
      return;
    }

    if (!observaciones.trim() && status !== "ENCONTRADO") {
      Alert.alert(
        "⚠️ Observaciones Requeridas",
        "Agregar observaciones para activos No Localizados o Dañados.",
      );
      return;
    }

    setShowSaveConfirm(true);
  };

  const confirmSave = () => {
    const auditData: AuditData = {
      asset_id: assetId,
      auditor_name:
        user?.nombre_completo ||
        `${user?.nombres ?? ""} ${user?.apellido_paterno ?? ""}`.trim() ||
        "Auditor",
      timestamp: currentTime.toISOString(),
      status,
      observaciones,
      nueva_ubicacion: ubicacionCambiada ? nuevaUbicacion : undefined,
      gps_latitude: gpsCoords?.lat,
      gps_longitude: gpsCoords?.lng,
      foto_evidencia: fotoEvidencia || undefined,
    };

    console.log("💾 [LOG] Guardando auditoría:", auditData);

    const statusEmoji = {
      ENCONTRADO: "✅",
      NO_LOCALIZADO: "❌",
      DAÑADO: "⚠️",
    };

    setShowSaveConfirm(false);

    Alert.alert(
      `${statusEmoji[status]} Auditoría Registrada`,
      `Activo: ${assetId}\nEstado: ${status}\nAuditor: ${user?.nombre_completo || `${user?.nombres ?? ""} ${user?.apellido_paterno ?? ""}`.trim()}\n${gpsCoords ? `\n📍 GPS: ${gpsCoords.lat.toFixed(6)}, ${gpsCoords.lng.toFixed(6)}` : ""}`,
      [{ text: "OK", onPress: () => router.replace("/(tabs)") }],
    );
  };

  const statusOptions = [
    {
      value: "ENCONTRADO" as AuditStatus,
      label: "Encontrado",
      Icon: CheckCircle,
      bgColor: "#d1fae5",
      borderColor: "#10b981",
      textColor: "#047857",
    },
    {
      value: "NO_LOCALIZADO" as AuditStatus,
      label: "No Localizado",
      Icon: XCircle,
      bgColor: "#fee2e2",
      borderColor: "#ef4444",
      textColor: "#b91c1c",
    },
    {
      value: "DAÑADO" as AuditStatus,
      label: "Dañado",
      Icon: AlertTriangle,
      bgColor: "#fef3c7",
      borderColor: "#f59e0b",
      textColor: "#b45309",
    },
  ];

  const selectedStatusConfig = statusOptions.find((s) => s.value === status)!;

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
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <X size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Registrar Auditoría
        </Text>

        <View style={{ width: 40 }} />
      </View>

      {/* Auditor & Time Info */}
      <View
        style={[styles.metaBar, { backgroundColor: colors.surfaceSecondary }]}
      >
        <View style={styles.metaItem}>
          <User size={12} color={colors.textMuted} />
          <Text style={[styles.metaText, { color: colors.textMuted }]}>
            {user?.nombre_completo ||
              `${user?.nombres ?? ""} ${user?.apellido_paterno ?? ""}`.trim()}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Clock size={12} color={colors.textMuted} />
          <Text style={[styles.metaText, { color: colors.textMuted }]}>
            {currentTime.toLocaleString("es-MX")}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Asset Info Card */}
        <View
          style={[
            styles.assetCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View
            style={[
              styles.assetIconBox,
              { backgroundColor: colors.primary + "20" },
            ]}
          >
            <Package size={28} color={colors.primary} />
          </View>
          <View style={styles.assetDetails}>
            <Text style={[styles.assetName, { color: colors.text }]}>
              {asset.nombre}
            </Text>
            <Text style={[styles.assetId, { color: colors.textSecondary }]}>
              {asset.id} • {asset.categoria}
            </Text>
            <View style={styles.locationRow}>
              <MapPin size={12} color={colors.textMuted} />
              <Text style={[styles.locationText, { color: colors.textMuted }]}>
                {asset.ubicacion_actual}
              </Text>
            </View>
          </View>
        </View>

        {/* GPS Status */}
        {gpsCoords && (
          <View style={[styles.gpsCard, { backgroundColor: "#d1fae5" }]}>
            <MapPin size={16} color="#047857" />
            <Text style={styles.gpsText}>
              GPS: {gpsCoords.lat.toFixed(6)}, {gpsCoords.lng.toFixed(6)}
            </Text>
          </View>
        )}

        {/* Status Selection */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Estado del Activo
        </Text>
        <View style={styles.statusOptions}>
          {statusOptions.map((option) => {
            const Icon = option.Icon;
            const isSelected = status === option.value;

            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.statusOption,
                  {
                    backgroundColor: isSelected
                      ? option.bgColor
                      : colors.surface,
                    borderColor: isSelected
                      ? option.borderColor
                      : colors.border,
                  },
                ]}
                onPress={() => setStatus(option.value)}
                activeOpacity={0.7}
              >
                <Icon
                  size={24}
                  color={isSelected ? option.textColor : colors.textMuted}
                />
                <Text
                  style={[
                    styles.statusLabel,
                    {
                      color: isSelected
                        ? option.textColor
                        : colors.textSecondary,
                    },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Observaciones */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Observaciones{" "}
          {status !== "ENCONTRADO" && (
            <Text style={{ color: colors.error }}>*</Text>
          )}
        </Text>
        <TextInput
          style={[
            styles.textArea,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          value={observaciones}
          onChangeText={setObservaciones}
          placeholder="Añade observaciones sobre el activo..."
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* Location Change Toggle */}
        <TouchableOpacity
          style={[
            styles.toggleRow,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={() => setUbicacionCambiada(!ubicacionCambiada)}
        >
          <Text style={[styles.toggleLabel, { color: colors.text }]}>
            ¿Cambió la ubicación del activo?
          </Text>
          <View
            style={[
              styles.toggleSwitch,
              {
                backgroundColor: ubicacionCambiada
                  ? colors.primary
                  : colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.toggleKnob,
                { transform: [{ translateX: ubicacionCambiada ? 20 : 0 }] },
              ]}
            />
          </View>
        </TouchableOpacity>

        {ubicacionCambiada && (
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={nuevaUbicacion}
            onChangeText={setNuevaUbicacion}
            placeholder="Nueva ubicación del activo"
            placeholderTextColor={colors.textMuted}
          />
        )}

        {/* Photo Evidence */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Foto de Evidencia{" "}
          {status === "DAÑADO" && (
            <Text style={{ color: colors.error }}>*</Text>
          )}
        </Text>
        <TouchableOpacity
          style={[
            styles.photoButton,
            {
              backgroundColor: fotoEvidencia ? "#d1fae5" : colors.surface,
              borderColor: fotoEvidencia ? "#10b981" : colors.border,
            },
          ]}
          onPress={handleTakePhoto}
        >
          <Camera
            size={24}
            color={fotoEvidencia ? "#047857" : colors.textSecondary}
          />
          <Text
            style={[
              styles.photoButtonText,
              { color: fotoEvidencia ? "#047857" : colors.textSecondary },
            ]}
          >
            {fotoEvidencia ? "Foto capturada ✓" : "Tomar foto"}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Save Button */}
      <View style={[styles.footer, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#10b981", "#059669"]}
            style={styles.saveButtonGradient}
          >
            <Save size={20} color="#fff" />
            <Text style={styles.saveButtonText}>Guardar Auditoría</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Confirmation Modal */}
      <Modal visible={showSaveConfirm} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: colors.surface }]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Confirmar Auditoría
            </Text>
            <Text style={[styles.modalText, { color: colors.textSecondary }]}>
              ¿Estás seguro de guardar esta auditoría?
            </Text>

            <View style={styles.modalInfo}>
              <Text style={[styles.modalInfoText, { color: colors.text }]}>
                Activo: {assetId}
              </Text>
              <Text
                style={[
                  styles.modalInfoText,
                  { color: selectedStatusConfig.textColor },
                ]}
              >
                Estado: {selectedStatusConfig.label}
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: colors.surfaceSecondary },
                ]}
                onPress={() => setShowSaveConfirm(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#10b981" }]}
                onPress={confirmSave}
              >
                <Text style={[styles.modalButtonText, { color: "#fff" }]}>
                  Confirmar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  metaBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 11,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  assetCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    gap: 12,
    marginBottom: 16,
  },
  assetIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  assetDetails: {
    flex: 1,
    gap: 4,
  },
  assetName: {
    fontSize: 16,
    fontWeight: "700",
  },
  assetId: {
    fontSize: 13,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontSize: 12,
  },
  gpsCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 20,
  },
  gpsText: {
    fontSize: 12,
    color: "#047857",
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  statusOptions: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  statusOption: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 2,
    gap: 8,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    minHeight: 100,
    marginBottom: 20,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: "center",
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    marginBottom: 20,
  },
  photoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 18,
    borderRadius: 14,
    borderWidth: 2,
    borderStyle: "dashed",
    marginBottom: 20,
  },
  photoButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 32,
  },
  saveButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalContent: {
    width: "100%",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  modalInfo: {
    alignItems: "center",
    gap: 4,
    marginBottom: 24,
  },
  modalInfoText: {
    fontSize: 14,
    fontWeight: "500",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
