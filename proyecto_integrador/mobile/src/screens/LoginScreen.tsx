import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
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
            colors={["#0c1a39", "#10245e"]}
            style={styles.logoContainer}
          >
            <Image
              source={require("../../assets/icon.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </LinearGradient>

          <Text style={[styles.title, { color: "#ffffff" }]}>Romdeau Audit</Text>
          <Text style={[styles.subtitle, { color: "rgba(227, 242, 255, 0.8)" }]}>Sistema de Auditoría Móvil</Text>
        </View>

        <View style={styles.form}>
          {/* Error General */}
          {generalError && (
            <View
              style={[
                styles.errorBanner,
                {
                  backgroundColor: colors.danger + "20",
                  borderColor: colors.danger,
                },
              ]}
            >
              <AlertCircle size={20} color={colors.danger} />
              <Text style={[styles.errorBannerText, { color: colors.danger }]}>
                {generalError}
              </Text>
            </View>
          )}

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors["text-primary"] }]}> 
              Correo Electrónico
            </Text>
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: colors.surface,
                  borderColor: errors.email ? colors.danger : colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: "rgba(96, 165, 250, 0.25)" },
                ]}
              >
                <Mail size={22} color="#93c5fd" />
              </View>
              <TextInput
                style={[styles.input, { color: "#f8fafc" }]}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) setErrors({ ...errors, email: "" });
                }}
                placeholder="tu.email@empresa.com"
                placeholderTextColor="#dbeafe"
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
            <Text style={[styles.label, { color: colors["text-primary"] }]}>
              Contraseña
            </Text>
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: colors.surface,
                  borderColor: errors.password ? colors.danger : colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: "rgba(96, 165, 250, 0.25)" },
                ]}
              >
                <Lock size={22} color="#93c5fd" />
              </View>
              <TextInput
                style={[styles.input, { color: "#f8fafc" }]}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors({ ...errors, password: "" });
                }}
                placeholder="••••••••"
                placeholderTextColor="#dbeafe"
                secureTextEntry={!showPassword}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff size={20} color={colors["text-secondary"]} />
                ) : (
                  <Eye size={20} color={colors["text-secondary"]} />
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
              colors={[colors.primary, colors["primary-foreground"]]}
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
    paddingTop: 70,
    paddingBottom: 40,
    backgroundColor: "#060b1a",
  },
  offlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dc2626",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 20,
    gap: 8,
  },
  offlineText: {
    color: "#fff",
    fontWeight: "700",
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 34,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(72,187,255,0.45)",
    shadowColor: "rgba(0, 143, 255, 0.45)",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.46,
    shadowRadius: 16,
    elevation: 12,
  },
  logoImage: {
    width: 76,
    height: 76,
    borderRadius: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: "900",
    marginBottom: 6,
    color: "#ffffff",
    textShadowColor: "rgba(0, 0, 0, 0.35)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 20,
    color: "rgba(242, 246, 255, 0.8)",
    fontWeight: "500",
  },
  versionBadge: {
    display: "none",
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
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "rgba(96, 165, 250, 0.8)",
    overflow: "hidden",
    backgroundColor: "rgba(15, 23, 42, 0.85)",
  },
  iconBox: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
    marginVertical: 4,
    borderRadius: 12,
    backgroundColor: "rgba(51, 65, 85, 0.8)",
  },
  input: {
    flex: 1,
    height: 56,
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#ffffff",
  },
  eyeButton: {
    padding: 16,
  },
  errorText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: "500",
    color: "#fb7185",
  },
  loginButton: {
    marginTop: 10,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "rgba(56, 189, 248, 0.45)",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 10,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonGradient: {
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  loginButtonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.5,
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
