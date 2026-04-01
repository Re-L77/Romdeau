import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system/legacy";
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
import { ActivoDetalle, activosApi } from "@/api/activos";
import { auditoriasApi } from "@/api/auditorias";

interface AssetAuditScreenProps {
  assetId: string;
  auditoriaProgramadaId?: string;
}

type AuditStatus = "ENCONTRADO" | "NO_LOCALIZADO" | "DAÑADO";

interface AuditData {
  asset_id: string;
  auditoria_programada_id?: string;
  auditor_name: string;
  timestamp: string;
  status: AuditStatus;
  observaciones: string;
  gps_latitude?: number;
  gps_longitude?: number;
  foto_evidencia?: string;
}

const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;

export default function AssetAuditScreen({
  assetId,
  auditoriaProgramadaId,
}: AssetAuditScreenProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();

  const [status, setStatus] = useState<AuditStatus>("ENCONTRADO");
  const [observaciones, setObservaciones] = useState("");
  const [fotoEvidenciaLocalUri, setFotoEvidenciaLocalUri] = useState<string | null>(null);
  const [fotoEvidenciaUrl, setFotoEvidenciaUrl] = useState<string | null>(null);
  const [gpsCoords, setGpsCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [asset, setAsset] = useState<ActivoDetalle | null>(null);
  const [isAssetLoading, setIsAssetLoading] = useState(true);
  const [assetError, setAssetError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const isReadOnlyMode = !auditoriaProgramadaId;

  const statusToEstadoId: Record<AuditStatus, number> = {
    ENCONTRADO: 1,
    DAÑADO: 2,
    NO_LOCALIZADO: 3,
  };

  const loadAsset = async () => {
    setIsAssetLoading(true);
    setAssetError(null);

    try {
      const assetData = await activosApi.obtenerPorIdentificador(assetId);
      if (!assetData) {
        setAsset(null);
        setAssetError("No se encontró información del activo.");
      } else {
        setAsset(assetData);
      }
    } catch (error) {
      setAsset(null);
      setAssetError("No se pudo cargar la información del activo.");
    } finally {
      setIsAssetLoading(false);
    }
  };

  useEffect(() => {
    loadAsset();
  }, [assetId]);

  const moneyFormatter = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 2,
  });

  const toText = (value?: string | null) => (value ? value : "N/A");
  const specs = (asset?.especificaciones || {}) as Record<string, unknown>;
  const marca = typeof specs.marca === "string" ? specs.marca : "N/A";
  const modelo = typeof specs.modelo === "string" ? specs.modelo : "N/A";
  const serie =
    typeof specs.numero_serie === "string"
      ? specs.numero_serie
      : toText(asset?.codigo_etiqueta || assetId);
  const valorAdquisicion =
    asset?.datos_financieros?.costo_adquisicion != null
      ? moneyFormatter.format(Number(asset.datos_financieros.costo_adquisicion))
      : "N/A";
  const valorLibro =
    asset?.datos_financieros?.valor_libro_actual != null
      ? moneyFormatter.format(
          Number(asset.datos_financieros.valor_libro_actual),
        )
      : "N/A";
  const fechaCompra = asset?.datos_financieros?.fecha_compra
    ? new Date(asset.datos_financieros.fecha_compra).toLocaleDateString("es-MX")
    : "N/A";
  const ubicacionTexto =
    asset?.oficinas?.nombre || asset?.estantes?.nombre || "N/A";
  const custodioTexto = asset?.usuarios?.nombre_completo || "Sin asignar";

  // RF7: Fecha y hora automática
  useEffect(() => {
    if (isReadOnlyMode) return;
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [isReadOnlyMode]);

  // RF17: Captura de geolocalización GPS
  useEffect(() => {
    if (isReadOnlyMode) return;
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
  }, [isReadOnlyMode]);

  const compressImageUnder2MB = async (uri: string) => {
    let workingUri = uri;
    let targetWidth: number | null = null;

    for (let i = 0; i < 8; i += 1) {
      const quality = Math.max(0.35, 0.8 - i * 0.07);
      const actions = targetWidth
        ? [{ resize: { width: targetWidth } }]
        : [];

      const result = await ImageManipulator.manipulateAsync(workingUri, actions, {
        compress: quality,
        format: ImageManipulator.SaveFormat.JPEG,
      });

      const info = await FileSystem.getInfoAsync(result.uri, { size: true });
      const size = info.exists ? info.size || 0 : 0;

      if (size > 0 && size <= MAX_IMAGE_SIZE_BYTES) {
        return result.uri;
      }

      workingUri = result.uri;
      targetWidth = Math.max(
        720,
        Math.round((result.width || targetWidth || 1080) * 0.85),
      );
    }

    return null;
  };

  const uploadEvidenceToBackend = async (localUri: string) => {
    const fileName = `evidencia-${Date.now()}.jpg`;
    const uploadResult = await auditoriasApi.subirEvidencia({
      uri: localUri,
      fileName,
      mimeType: "image/jpeg",
      auditoria: auditoriaProgramadaId,
      activo_id: asset?.id,
    });

    return uploadResult.evidencia_url;
  };

  const handleTakePhoto = async () => {
    if (isUploadingPhoto) return;

    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permiso requerido",
        "Necesitas conceder permiso de cámara para tomar evidencia.",
      );
      return;
    }

    const capture = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: false,
      exif: false,
    });

    if (capture.canceled || !capture.assets?.length) return;

    setIsUploadingPhoto(true);
    try {
      const compressedUri = await compressImageUnder2MB(capture.assets[0].uri);
      if (!compressedUri) {
        Alert.alert(
          "No se pudo comprimir",
          "La imagen sigue superando 2MB. Intenta con otra foto.",
        );
        return;
      }

      setFotoEvidenciaLocalUri(compressedUri);
      setFotoEvidenciaUrl(null);

      Alert.alert(
        "✅ Foto lista",
        "La evidencia quedó lista y se subirá al guardar la auditoría.",
      );
    } catch (error) {
      console.error("Error procesando evidencia:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Error desconocido al subir evidencia.";
      Alert.alert(
        "Error",
        `No se pudo subir la evidencia. ${message}`,
      );
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSave = () => {
    if (status === "DAÑADO" && !fotoEvidenciaLocalUri) {
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

  const confirmSave = async () => {
    if (!asset?.id) {
      Alert.alert("Error", "No se pudo identificar el activo para registrar la auditoría.");
      return;
    }

    setIsSaving(true);

    const auditData: AuditData = {
      asset_id: assetId,
      auditoria_programada_id: auditoriaProgramadaId,
      auditor_name:
        user?.nombre_completo ||
        `${user?.nombres ?? ""} ${user?.apellido_paterno ?? ""}`.trim() ||
        "Auditor",
      timestamp: currentTime.toISOString(),
      status,
      observaciones,
      gps_latitude: gpsCoords?.lat,
      gps_longitude: gpsCoords?.lng,
      foto_evidencia: fotoEvidenciaUrl || undefined,
    };

    console.log("💾 [LOG] Guardando auditoría:", auditData);

    const statusEmoji = {
      ENCONTRADO: "✅",
      NO_LOCALIZADO: "❌",
      DAÑADO: "⚠️",
    };

    try {
      let evidenceUrl = fotoEvidenciaUrl;

      if (fotoEvidenciaLocalUri && !evidenceUrl) {
        evidenceUrl = await uploadEvidenceToBackend(fotoEvidenciaLocalUri);
        setFotoEvidenciaUrl(evidenceUrl);
      }

      await auditoriasApi.registrarLog({
        activo_id: asset.id,
        auditoria: auditoriaProgramadaId,
        estado_reportado_id: statusToEstadoId[status],
        comentarios: observaciones?.trim() || undefined,
        url: evidenceUrl || undefined,
      });

      setShowSaveConfirm(false);

      Alert.alert(
        `${statusEmoji[status]} Auditoría Registrada`,
        `Activo: ${assetId}\nEstado: ${status}\nAuditor: ${user?.nombre_completo || `${user?.nombres ?? ""} ${user?.apellido_paterno ?? ""}`.trim()}\n${gpsCoords ? `\n📍 GPS: ${gpsCoords.lat.toFixed(6)}, ${gpsCoords.lng.toFixed(6)}` : ""}`,
        [{ text: "OK", onPress: () => router.replace("/(tabs)") }],
      );
    } catch (error) {
      console.error("Error registrando auditoría:", error);
      Alert.alert(
        "Error",
        "No se pudo registrar la auditoría. Intenta nuevamente.",
      );
    } finally {
      setIsSaving(false);
    }
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
          {isReadOnlyMode ? "Información del Activo" : "Registrar Auditoría"}
        </Text>

        <View style={{ width: 40 }} />
      </View>

      {!isReadOnlyMode && (
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
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isAssetLoading ? (
          <View
            style={[
              styles.assetCard,
              styles.centeredCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <ActivityIndicator color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Cargando información del activo...
            </Text>
          </View>
        ) : assetError ? (
          <View
            style={[
              styles.assetCard,
              { backgroundColor: colors.surface, borderColor: colors.error },
            ]}
          >
            <Text style={[styles.infoOnlyTitle, { color: colors.error }]}>
              Información no disponible
            </Text>
            <Text
              style={[styles.infoOnlyText, { color: colors.textSecondary }]}
            >
              {assetError}
            </Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: colors.primary }]}
              onPress={loadAsset}
            >
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Resumen principal */}
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
                  {toText(asset?.nombre)}
                </Text>
                <Text style={[styles.assetId, { color: colors.textSecondary }]}>
                  {toText(asset?.codigo_etiqueta || assetId)}
                </Text>
                <View style={styles.locationRow}>
                  <MapPin size={12} color={colors.textMuted} />
                  <Text
                    style={[styles.locationText, { color: colors.textMuted }]}
                  >
                    {ubicacionTexto}
                  </Text>
                </View>
              </View>
            </View>

            {/* Identificación */}
            <View
              style={[
                styles.infoSection,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.infoSectionTitle, { color: colors.text }]}>
                Identificación
              </Text>
              <InfoRow
                label="ID"
                value={toText(asset?.id || assetId)}
                colors={colors}
              />
              <InfoRow
                label="Código Etiqueta"
                value={toText(asset?.codigo_etiqueta)}
                colors={colors}
              />
              <InfoRow
                label="Categoría"
                value={toText(asset?.categorias?.nombre)}
                colors={colors}
              />
              <InfoRow
                label="Estado"
                value={toText(asset?.estados_activo?.nombre)}
                colors={colors}
              />
            </View>

            {/* Especificaciones */}
            <View
              style={[
                styles.infoSection,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.infoSectionTitle, { color: colors.text }]}>
                Especificaciones
              </Text>
              <InfoRow label="Marca" value={marca} colors={colors} />
              <InfoRow label="Modelo" value={modelo} colors={colors} />
              <InfoRow label="No. Serie" value={serie} colors={colors} />
            </View>

            {/* Ubicación y custodio */}
            <View
              style={[
                styles.infoSection,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.infoSectionTitle, { color: colors.text }]}>
                Ubicación y Custodia
              </Text>
              <InfoRow
                label="Oficina"
                value={toText(asset?.oficinas?.nombre)}
                colors={colors}
              />
              <InfoRow
                label="Estante"
                value={toText(asset?.estantes?.nombre)}
                colors={colors}
              />
              <InfoRow label="Custodio" value={custodioTexto} colors={colors} />
            </View>

            {/* Información financiera */}
            <View
              style={[
                styles.infoSection,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.infoSectionTitle, { color: colors.text }]}>
                Información Financiera
              </Text>
              <InfoRow
                label="Costo de Adquisición"
                value={valorAdquisicion}
                colors={colors}
              />
              <InfoRow
                label="Valor en Libros"
                value={valorLibro}
                colors={colors}
              />
              <InfoRow
                label="Fecha de Compra"
                value={fechaCompra}
                colors={colors}
              />
              <InfoRow
                label="Proveedor"
                value={toText(asset?.datos_financieros?.proveedores?.nombre)}
                colors={colors}
              />
            </View>
          </>
        )}

        {isReadOnlyMode && (
          <View
            style={[
              styles.infoOnlyCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.infoOnlyTitle, { color: colors.text }]}>
              Modo consulta
            </Text>
            <Text
              style={[styles.infoOnlyText, { color: colors.textSecondary }]}
            >
              Este escaneo no está vinculado a una auditoría en progreso. Solo
              se muestra la información del activo.
            </Text>
          </View>
        )}

        {/* GPS Status */}
        {!isReadOnlyMode && gpsCoords && (
          <View style={[styles.gpsCard, { backgroundColor: "#d1fae5" }]}>
            <MapPin size={16} color="#047857" />
            <Text style={styles.gpsText}>
              GPS: {gpsCoords.lat.toFixed(6)}, {gpsCoords.lng.toFixed(6)}
            </Text>
          </View>
        )}

        {!isReadOnlyMode && (
          <>
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
                  backgroundColor: fotoEvidenciaLocalUri ? "#d1fae5" : colors.surface,
                  borderColor: fotoEvidenciaLocalUri ? "#10b981" : colors.border,
                },
              ]}
              onPress={handleTakePhoto}
            >
              <Camera
                size={24}
                color={fotoEvidenciaLocalUri ? "#047857" : colors.textSecondary}
              />
              <Text
                style={[
                  styles.photoButtonText,
                  {
                    color: fotoEvidenciaLocalUri
                      ? "#047857"
                      : colors.textSecondary,
                  },
                ]}
              >
                {isUploadingPhoto
                  ? "Procesando..."
                  : fotoEvidenciaLocalUri
                    ? "Foto capturada ✓"
                    : "Tomar foto"}
              </Text>
            </TouchableOpacity>

            {fotoEvidenciaLocalUri && (
              <Image
                source={{ uri: fotoEvidenciaLocalUri }}
                style={styles.evidencePreview}
              />
            )}
          </>
        )}

        <View style={{ height: isReadOnlyMode ? 24 : 120 }} />
      </ScrollView>

      {!isReadOnlyMode && (
        <>
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
                style={[
                  styles.modalContent,
                  { backgroundColor: colors.surface },
                ]}
              >
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Confirmar Auditoría
                </Text>
                <Text
                  style={[styles.modalText, { color: colors.textSecondary }]}
                >
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
                    <Text
                      style={[styles.modalButtonText, { color: colors.text }]}
                    >
                      Cancelar
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: "#10b981" }]}
                    onPress={confirmSave}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={[styles.modalButtonText, { color: "#fff" }]}>
                        Confirmar
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </>
      )}
    </SafeAreaView>
  );
}

function InfoRow({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: {
    text: string;
    textSecondary: string;
    border: string;
  };
}) {
  return (
    <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
        {label}
      </Text>
      <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
    </View>
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
  centeredCard: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
  },
  loadingText: {
    fontSize: 13,
    marginTop: 10,
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
  infoSection: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  infoSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },
  infoRow: {
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
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
  infoOnlyCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  infoOnlyTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
  },
  infoOnlyText: {
    fontSize: 13,
    lineHeight: 19,
  },
  retryButton: {
    marginTop: 12,
    alignSelf: "flex-start",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
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
  evidencePreview: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginTop: -8,
    marginBottom: 20,
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
