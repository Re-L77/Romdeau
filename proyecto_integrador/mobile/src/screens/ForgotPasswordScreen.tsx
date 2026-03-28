import React, { useState } from "react";
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
  Mail,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { useTheme } from "../contexts/ThemeContext";
import { authApi } from "../api/auth";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [email, setEmail] = useState("124051537@upq.edu.mx");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSendRecovery = async () => {
    setError(null);

    if (!email.trim()) {
      setError("El email es requerido");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Email inválido");
      return;
    }

    setIsSubmitting(true);
    try {
      const redirectTo = Linking.createURL("/reset-password");
      await authApi.forgotPassword(email.trim(), redirectTo);
      setSuccess(true);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "No se pudo enviar el correo de recuperación.";
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
            Recuperar contraseña
          </Text>
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.title, { color: colors.text }]}>
            Te enviamos un enlace
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Ingresa tu correo y te enviaremos un link para restablecer tu
            contraseña.
          </Text>

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
                Si el correo existe, recibirás un enlace de recuperación.
              </Text>
            </View>
          )}

          <Text style={[styles.label, { color: colors.text }]}>
            Correo electrónico
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
            <Mail size={18} color={colors.textSecondary} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isSubmitting}
              placeholder="tu.email@empresa.com"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              isSubmitting && styles.disabledButton,
            ]}
            onPress={handleSendRecovery}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={["#334155", "#0f172a"]}
              style={styles.primaryButtonGradient}
            >
              {isSubmitting ? (
                <>
                  <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.primaryButtonText}>Enviando...</Text>
                </>
              ) : (
                <Text style={styles.primaryButtonText}>Enviar enlace</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

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
