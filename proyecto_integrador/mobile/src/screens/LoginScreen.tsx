import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Wifi,
  WifiOff,
  AlertCircle,
} from "lucide-react-native";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useNetInfo } from "@react-native-community/netinfo";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const { login, isLoading, error: authError } = useAuth();
  const { colors, isDark } = useTheme();
  const { isConnected } = useNetInfo();
  const router = useRouter();

  const [email, setEmail] = useState("xd@xd.com");
  const [password, setPassword] = useState("ZmY!xH5eMCpT");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Sincronizar errores del contexto de auth
  useEffect(() => {
    if (authError) {
      setGeneralError(authError);
    }
  }, [authError]);

  const validateForm = (): boolean => {
    const newErrors = { email: "", password: "" };
    setGeneralError(null);

    if (!email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Email inválido";
    }

    if (!password) {
      newErrors.password = "La contraseña es requerida";
    } else if (password.length < 8) {
      newErrors.password = "Mínimo 8 caracteres";
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleLogin = async () => {
    if (!validateForm() || !isConnected) {
      if (!isConnected) {
        setGeneralError("No hay conexión a internet");
      }
      return;
    }

    try {
      await login(email, password);
      // El contexto manejará la navegación
    } catch (error: any) {
      let errorMessage = "Error al iniciar sesión. Verifica tus credenciales.";

      if (error.code === "ECONNREFUSED") {
        errorMessage =
          "No se puede conectar al servidor (http://localhost:3000)";
      } else if (error.response?.status === 401) {
        errorMessage = "Email o contraseña incorrectos";
      } else if (error.response?.status === 500) {
        errorMessage = "Error en el servidor: " + error.response?.data?.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setGeneralError(errorMessage);
    }
  };

  const handleDemoLogin = async () => {
    setEmail("admin@romdeau.com");
    setPassword("AdminPassword123!@");
    // Simular delay para que se vean los cambios
    setTimeout(() => {
      login("admin@romdeau.com", "AdminPassword123!@").catch((error) => {
        const errorMessage =
          error.response?.data?.message ||
          "Error con credenciales de demostración";
        setGeneralError(errorMessage);
      });
    }, 300);
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
        {/* Offline Banner */}
        {isConnected === false && (
          <View style={styles.offlineBanner}>
            <WifiOff size={20} color="#fff" />
            <Text style={styles.offlineText}>
              Sin Conexión - Conecta a internet
            </Text>
          </View>
        )}

        {/* Logo Section */}
        <View style={styles.logoSection}>
          <LinearGradient
            colors={["#334155", "#0f172a"]}
            style={styles.logoContainer}
          >
            <Text style={styles.logoEmoji}>📦</Text>
          </LinearGradient>

          <Text style={[styles.title, { color: colors.text }]}>
            Romdeau Audit
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Sistema de Auditoría Móvil
          </Text>

          <View
            style={[
              styles.versionBadge,
              { backgroundColor: colors.surfaceSecondary },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isConnected ? "#10b981" : "#ef4444" },
              ]}
            />
            <Text style={[styles.versionText, { color: colors.textSecondary }]}>
              {isConnected ? "Conectado" : "Sin conexión"} • v1.0.0
            </Text>
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Error General */}
          {generalError && (
            <View
              style={[
                styles.errorBanner,
                {
                  backgroundColor: colors.error + "15",
                  borderColor: colors.error,
                },
              ]}
            >
              <AlertCircle size={20} color={colors.error} />
              <Text style={[styles.errorBannerText, { color: colors.error }]}>
                {generalError}
              </Text>
            </View>
          )}

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Correo Electrónico
            </Text>
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: colors.surface,
                  borderColor: errors.email ? colors.error : colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: colors.surfaceSecondary },
                ]}
              >
                <Mail size={20} color={colors.textSecondary} />
              </View>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) setErrors({ ...errors, email: "" });
                }}
                placeholder="tu.email@empresa.com"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>
            {errors.email ? (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.email}
              </Text>
            ) : null}
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Contraseña
            </Text>
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: colors.surface,
                  borderColor: errors.password ? colors.error : colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: colors.surfaceSecondary },
                ]}
              >
                <Lock size={20} color={colors.textSecondary} />
              </View>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors({ ...errors, password: "" });
                }}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showPassword}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff size={20} color={colors.textSecondary} />
                ) : (
                  <Eye size={20} color={colors.textSecondary} />
                )}
              </TouchableOpacity>
            </View>
            {errors.password ? (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.password}
              </Text>
            ) : null}
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              (isLoading || !isConnected) && styles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={isLoading || !isConnected}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#334155", "#0f172a"]}
              style={styles.loginButtonGradient}
            >
              {isLoading ? (
                <>
                  <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.loginButtonText}>
                    Iniciando sesión...
                  </Text>
                </>
              ) : (
                <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.forgotPasswordButton}
            onPress={() => router.push("/forgot-password" as any)}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text
              style={[styles.forgotPasswordText, { color: colors.primary }]}
            >
              ¿Olvidaste tu contraseña?
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
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  offlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ef4444",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  offlineText: {
    color: "#fff",
    fontWeight: "600",
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  logoEmoji: {
    fontSize: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  versionBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  versionText: {
    fontSize: 12,
    fontWeight: "500",
  },
  form: {
    gap: 20,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 2,
    overflow: "hidden",
  },
  iconBox: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
    marginVertical: 4,
    borderRadius: 12,
  },
  input: {
    flex: 1,
    height: 56,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  eyeButton: {
    padding: 16,
  },
  errorText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: "500",
  },
  loginButton: {
    marginTop: 8,
    borderRadius: 16,
    overflow: "hidden",
  },
  loginButtonDisabled: {
    opacity: 0.5,
  },
  loginButtonGradient: {
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  forgotPasswordButton: {
    alignItems: "center",
    marginTop: -6,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: "600",
  },
  demoButton: {
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#3b82f6",
  },
  demoButtonDisabled: {
    opacity: 0.5,
  },
  demoButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  infoBox: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    marginBottom: 4,
    lineHeight: 18,
  },
});
