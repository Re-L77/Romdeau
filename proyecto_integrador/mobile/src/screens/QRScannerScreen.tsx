import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
} from "react-native";
import {
  CameraView,
  useCameraPermissions,
  BarcodeScanningResult,
} from "expo-camera";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  X,
  Flashlight,
  FlashlightOff,
  Keyboard,
  Wifi,
  WifiOff,
  Info,
} from "lucide-react-native";
import { useTheme } from "../contexts/ThemeContext";
import { useAuditorias } from "../contexts/AuditoriasContext";
import { activosApi } from "@/api/activos";
import { getMatchingActiveAuditId } from "../utils/auditScope";

export default function QRScannerScreen() {
  const router = useRouter();
  const { auditId } = useLocalSearchParams<{ auditId?: string }>();
  const { colors, isDark } = useTheme();
  const { auditorias } = useAuditorias();
  const [permission, requestPermission] = useCameraPermissions();
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = async (result: BarcodeScanningResult) => {
    if (scanned) return;

    setScanned(true);
    const raw = result.data;
    console.log("📱 [LOG] QR escaneado:", raw);

    // Intentar parsear JSON para extraer codigo_etiqueta
    let codigoEtiqueta: string = raw;
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.codigo_etiqueta === "string") {
        codigoEtiqueta = parsed.codigo_etiqueta;
        console.log("📱 [LOG] codigo_etiqueta extraído:", codigoEtiqueta);
      }
    } catch {
      // No es JSON, usar el valor crudo directamente
    }

    // Solo aceptar IDs de activo válidos (formato CORP-YY-0000000)
    const validFormat = /^CORP-\d{2}-\d{7}$/.test(codigoEtiqueta);
    if (validFormat) {
      try {
        let resolvedAuditId: string | null = auditId || null;

        if (!resolvedAuditId) {
          const asset = await activosApi.obtenerPorIdentificador(codigoEtiqueta);
          resolvedAuditId = getMatchingActiveAuditId(asset, auditorias);
        }

        const query = resolvedAuditId
          ? `?auditId=${encodeURIComponent(resolvedAuditId)}`
          : "";

        router.replace(`/audit/${codigoEtiqueta}${query}`);
      } catch (error) {
        console.error("Error resolviendo contexto de auditoria:", error);
        router.replace(`/audit/${codigoEtiqueta}`);
      }
    } else {
      Alert.alert(
        "Código Inválido",
        "El QR escaneado no corresponde a un activo válido.\n\nLos códigos deben tener el formato CORP-YY-0000000",
        [
          {
            text: "Reintentar",
            onPress: () => setScanned(false),
          },
        ],
      );
    }
  };

  const handleManualEntry = () => {
    const query = auditId ? `?auditId=${encodeURIComponent(auditId)}` : "";
    router.push(`/manual-entry${query}`);
  };

  const handleClose = () => {
    router.back();
  };

  if (!permission) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.messageText, { color: colors.text }]}>
          Solicitando permisos de cámara...
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.permissionContainer}>
          <View style={styles.permissionIcon}>
            <Text style={styles.permissionEmoji}>📷</Text>
          </View>
          <Text style={[styles.permissionTitle, { color: colors.text }]}>
            Acceso a Cámara Requerido
          </Text>
          <Text
            style={[styles.permissionText, { color: colors.textSecondary }]}
          >
            Necesitamos acceso a tu cámara para escanear códigos QR de los
            activos.
          </Text>

          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Permitir Cámara</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.border }]}
            onPress={handleManualEntry}
          >
            <Keyboard size={20} color={colors.text} />
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
              Ingresar ID Manualmente
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeLink} onPress={handleClose}>
            <Text style={[styles.closeLinkText, { color: colors.textMuted }]}>
              Volver
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        enableTorch={flashEnabled}
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "code128", "code39", "ean13", "ean8"],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={handleClose}>
            <X size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Escanear QR</Text>
            <View style={styles.connectionBadge}>
              {isOnline ? (
                <>
                  <Wifi size={12} color="#10b981" />
                  <Text style={[styles.connectionText, { color: "#10b981" }]}>
                    En línea
                  </Text>
                </>
              ) : (
                <>
                  <WifiOff size={12} color="#f59e0b" />
                  <Text style={[styles.connectionText, { color: "#f59e0b" }]}>
                    Sin conexión
                  </Text>
                </>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setFlashEnabled(!flashEnabled)}
          >
            {flashEnabled ? (
              <FlashlightOff size={24} color="#fbbf24" />
            ) : (
              <Flashlight size={24} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        {/* Scanner Frame */}
        <View style={styles.scannerArea}>
          <View style={styles.scannerFrame}>
            {/* Corner decorations */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            {/* Scan line animation would go here */}
            <View style={styles.scanLine} />
          </View>

          <Text style={styles.scanHint}>
            Posiciona el código QR dentro del marco
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.manualButton}
            onPress={handleManualEntry}
          >
            <Keyboard size={20} color="#fff" />
            <Text style={styles.manualButtonText}>Ingresar ID Manual</Text>
          </TouchableOpacity>

          {scanned && (
            <TouchableOpacity
              style={styles.rescanButton}
              onPress={() => setScanned(false)}
            >
              <Text style={styles.rescanButtonText}>Escanear de nuevo</Text>
            </TouchableOpacity>
          )}

          <View style={styles.helpRow}>
            <Info size={14} color="rgba(255,255,255,0.6)" />
            <Text style={styles.helpText}>
              Asegúrate de tener buena iluminación
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  messageText: {
    textAlign: "center",
    marginTop: 100,
    fontSize: 16,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 16,
  },
  permissionIcon: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: "rgba(37, 99, 235, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  permissionEmoji: {
    fontSize: 48,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  permissionText: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    marginTop: 8,
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    borderWidth: 2,
    marginTop: 8,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  closeLink: {
    marginTop: 16,
  },
  closeLinkText: {
    fontSize: 14,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    alignItems: "center",
    gap: 4,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  connectionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  connectionText: {
    fontSize: 11,
    fontWeight: "600",
  },
  scannerArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scannerFrame: {
    width: 280,
    height: 280,
    borderRadius: 24,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: "#fff",
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 24,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 24,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 24,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 24,
  },
  scanLine: {
    position: "absolute",
    left: 20,
    right: 20,
    top: "50%",
    height: 2,
    backgroundColor: "#2563eb",
    borderRadius: 1,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  scanHint: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    marginTop: 24,
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 50,
    paddingTop: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    gap: 16,
  },
  manualButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  manualButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  rescanButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  rescanButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  helpRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  helpText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
  },
});
