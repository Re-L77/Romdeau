import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Lock,
} from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { useTheme } from "../contexts/ThemeContext";
import { authApi } from "../api/auth";

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]).{8,}$/;

function getFirstValue(value: string | string[] | undefined): string | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] || null : value;
}

function extractRecoveryRefreshToken(url: string): string | null {
  const hashIndex = url.indexOf("#");
  const queryIndex = url.indexOf("?");

  const queryPart =
    queryIndex >= 0
      ? url.slice(queryIndex + 1, hashIndex >= 0 ? hashIndex : undefined)
      : "";
  const hashPart = hashIndex >= 0 ? url.slice(hashIndex + 1) : "";

  const queryParams = new URLSearchParams(queryPart);
  const hashParams = new URLSearchParams(hashPart);

  const typeFromHash = hashParams.get("type");
  const typeFromQuery = queryParams.get("type");
  const tokenFromHash = hashParams.get("refresh_token");
  const tokenFromQuery = queryParams.get("refresh_token");

  if (typeFromHash === "recovery" && tokenFromHash) {
    return tokenFromHash;
  }

  if (typeFromQuery === "recovery" && tokenFromQuery) {
    return tokenFromQuery;
  }

  return tokenFromHash || tokenFromQuery;
}

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ refresh_token?: string | string[] }>();
  const incomingUrl = Linking.useURL();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [refreshToken, setRefreshToken] = useState<string | null>(
    getFirstValue(params.refresh_token),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fromParams = getFirstValue(params.refresh_token);
    if (fromParams) {
      setRefreshToken(fromParams);
      return;
    }

    if (!incomingUrl) {
      return;
    }

    const fromUrl = extractRecoveryRefreshToken(incomingUrl);
    if (fromUrl) {
      setRefreshToken(fromUrl);
    }
  }, [incomingUrl, params.refresh_token]);

  const passwordValidationError = useMemo(() => {
    if (!password) return null;
    if (!PASSWORD_REGEX.test(password)) {
      return "Debe tener 8+ caracteres, mayúscula, minúscula, número y símbolo.";
    }
    return null;
  }, [password]);

  const handleSubmit = async () => {
    setError(null);

    if (!refreshToken) {
      setError("El enlace de recuperación es inválido o expiró.");
      return;
    }

    if (!password || !confirmPassword) {
      setError("Completa ambos campos de contraseña.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (passwordValidationError) {
      setError(passwordValidationError);
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.resetPassword(password, refreshToken);
      setSuccess(true);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "No se pudo actualizar la contraseña.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { backgroundColor: colors.background },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={[
              styles.backButton,
              { borderColor: colors.border, backgroundColor: colors.surface },
            ]}
            onPress={() => router.replace("/")}
          >
            <ArrowLeft size={18} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Nueva contraseña
          </Text>
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.title, { color: colors.text }]}>
            Restablece tu acceso
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Crea una nueva contraseña para continuar usando tu cuenta.
          </Text>

          {!refreshToken && (
            <View
              style={[
                styles.banner,
                {
                  backgroundColor: colors.error + "15",
                  borderColor: colors.error,
                },
              ]}
            >
              <AlertCircle size={18} color={colors.error} />
              <Text style={[styles.bannerText, { color: colors.error }]}>
                No se detectó un token válido en el enlace.
              </Text>
            </View>
          )}

          {error && (
            <View
              style={[
                styles.banner,
                {
                  backgroundColor: colors.error + "15",
                  borderColor: colors.error,
                },
              ]}
            >
              <AlertCircle size={18} color={colors.error} />
              <Text style={[styles.bannerText, { color: colors.error }]}>
                {error}
              </Text>
            </View>
          )}

          {success && (
            <View
              style={[
                styles.banner,
                {
                  backgroundColor: colors.success + "15",
                  borderColor: colors.success,
                },
              ]}
            >
              <CheckCircle2 size={18} color={colors.success} />
              <Text style={[styles.bannerText, { color: colors.success }]}>
                Contraseña actualizada exitosamente. Ahora inicia sesión.
              </Text>
            </View>
          )}

          {!success && (
            <>
              <Text style={[styles.label, { color: colors.text }]}>
                Nueva contraseña
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.surfaceSecondary,
                  },
                ]}
              >
                <Lock size={18} color={colors.textSecondary} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!isSubmitting}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <Text style={[styles.label, { color: colors.text }]}>
                Confirmar contraseña
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.surfaceSecondary,
                  },
                ]}
              >
                <Lock size={18} color={colors.textSecondary} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  editable={!isSubmitting}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <Text style={[styles.hint, { color: colors.textSecondary }]}>
                Requisitos: 8+ caracteres, mayúscula, minúscula, número y
                símbolo.
              </Text>

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  isSubmitting && styles.disabledButton,
                ]}
                onPress={handleSubmit}
                disabled={isSubmitting}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={["#334155", "#0f172a"]}
                  style={styles.primaryButtonGradient}
                >
                  {isSubmitting ? (
                    <>
                      <ActivityIndicator
                        color="#fff"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.primaryButtonText}>
                        Actualizando...
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.primaryButtonText}>
                      Actualizar contraseña
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.replace("/")}
          >
            <Text
              style={[styles.secondaryButtonText, { color: colors.primary }]}
            >
              Volver a iniciar sesión
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 64,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    gap: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  banner: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  bannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 6,
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 14,
    minHeight: 52,
    paddingHorizontal: 12,
    gap: 10,
    alignItems: "center",
    flexDirection: "row",
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  hint: {
    fontSize: 12,
    lineHeight: 18,
  },
  primaryButton: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 8,
  },
  primaryButtonGradient: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryButton: {
    alignItems: "center",
    paddingVertical: 8,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },
});
