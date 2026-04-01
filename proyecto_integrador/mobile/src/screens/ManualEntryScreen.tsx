import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { X, Search, Keyboard, ArrowRight } from "lucide-react-native";
import { useTheme } from "../contexts/ThemeContext";
import { useAuditorias } from "../contexts/AuditoriasContext";
import { activosApi } from "@/api/activos";
import { getMatchingActiveAuditId } from "../utils/auditScope";

export default function ManualEntryScreen() {
  const router = useRouter();
  const { auditId } = useLocalSearchParams<{ auditId?: string }>();
  const { colors } = useTheme();
  const { auditorias } = useAuditorias();
  const [assetId, setAssetId] = useState("");
  const [error, setError] = useState("");
  const [isResolvingContext, setIsResolvingContext] = useState(false);

  const handleSubmit = async () => {
    if (!assetId.trim()) {
      setError("Ingresa un ID de activo");
      return;
    }

    if (assetId.trim().length < 3) {
      setError("El ID debe tener al menos 3 caracteres");
      return;
    }

    console.log("⌨️ [LOG] ID ingresado manualmente:", assetId);
    const normalized = assetId.trim().toUpperCase();

    try {
      setIsResolvingContext(true);
      let resolvedAuditId: string | null = auditId || null;

      if (!resolvedAuditId) {
        const asset = await activosApi.obtenerPorIdentificador(normalized);
        resolvedAuditId = getMatchingActiveAuditId(asset, auditorias);
      }

      const query = resolvedAuditId
        ? `?auditId=${encodeURIComponent(resolvedAuditId)}`
        : "";

      router.replace(`/audit/${normalized}${query}`);
    } catch (contextError) {
      console.error("Error resolviendo contexto de auditoria manual:", contextError);
      router.replace(`/audit/${normalized}`);
    } finally {
      setIsResolvingContext(false);
    }
  };

  const recentIds = ["ACT-00045", "ACT-00044", "ACT-00043"];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <X size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Ingreso Manual
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          {/* Icon */}
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: colors.primary + "20" },
            ]}
          >
            <Keyboard size={40} color={colors.primary} />
          </View>

          <Text style={[styles.title, { color: colors.text }]}>
            Ingresar ID de Activo
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Escribe el código del activo que deseas auditar
          </Text>

          {/* Input */}
          <View style={styles.inputContainer}>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.surface,
                  borderColor: error ? colors.error : colors.border,
                },
              ]}
            >
              <Search size={20} color={colors.textMuted} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={assetId}
                onChangeText={(text) => {
                  setAssetId(text);
                  setError("");
                }}
                placeholder="Ej: ACT-00045"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="characters"
                autoCorrect={false}
                autoFocus
              />
            </View>
            {error ? (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {error}
              </Text>
            ) : null}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              {
                backgroundColor: assetId.trim() && !isResolvingContext
                  ? colors.primary
                  : colors.border,
              },
            ]}
            onPress={handleSubmit}
            disabled={!assetId.trim() || isResolvingContext}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.submitButtonText,
                {
                  color:
                    assetId.trim() && !isResolvingContext
                      ? "#fff"
                      : colors.textMuted,
                },
              ]}
            >
              {isResolvingContext ? "Verificando..." : "Buscar Activo"}
            </Text>
            <ArrowRight
              size={20}
              color={
                assetId.trim() && !isResolvingContext
                  ? "#fff"
                  : colors.textMuted
              }
            />
          </TouchableOpacity>

          {/* Recent IDs */}
          <View style={styles.recentSection}>
            <Text style={[styles.recentTitle, { color: colors.textSecondary }]}>
              IDs Recientes
            </Text>
            <View style={styles.recentList}>
              {recentIds.map((id) => (
                <TouchableOpacity
                  key={id}
                  style={[
                    styles.recentChip,
                    { backgroundColor: colors.surfaceSecondary },
                  ]}
                  onPress={() => setAssetId(id)}
                >
                  <Text style={[styles.recentChipText, { color: colors.text }]}>
                    {id}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: "center",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 32,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 56,
    borderRadius: 16,
    borderWidth: 2,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 1,
  },
  errorText: {
    fontSize: 13,
    marginTop: 8,
    marginLeft: 4,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 40,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  recentSection: {
    width: "100%",
  },
  recentTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  recentList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  recentChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  recentChipText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
