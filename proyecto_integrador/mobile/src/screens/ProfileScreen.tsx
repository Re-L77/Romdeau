import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  type KeyboardTypeOptions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import {
  Mail,
  Briefcase,
  LogOut,
  ShieldCheck,
  Phone,
  Building2,
  User,
  Clock,
  Pencil,
  Camera,
  Save,
  X,
  Moon,
  Sun,
  Bell,
  Lock,
  HelpCircle,
  Info,
  Shield,
  Database,
  ChevronRight,
} from "lucide-react-native";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { apiClient } from "../api/client";

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return null;
  try {
    return new Date(dateStr).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return null;
  }
};

export default function ProfileScreen() {
  const { user, logout, validateSession } = useAuth();
  const { colors, isDark, setThemeMode, themeMode } = useTheme();
  const headerGradient = isDark
    ? (["#0b1430", "#122452", "#1d3b82"] as const)
    : (["#234fd9", "#2f66ff", "#5f8dff"] as const);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [nombres, setNombres] = useState("");
  const [apellidoPaterno, setApellidoPaterno] = useState("");
  const [apellidoMaterno, setApellidoMaterno] = useState("");
  const [telefono, setTelefono] = useState("");
  const [notifications, setNotifications] = useState(true);

  const toggleTheme = () => {
    setThemeMode(isDark ? "light" : "dark");
  };

  const handleChangePassword = () => {
    Alert.alert(
      "Cambiar Contraseña",
      "Esta funcionalidad estaría implementada en el backend",
    );
  };

  // Refrescar datos del usuario al abrir el perfil
  useEffect(() => {
    validateSession();
  }, []);

  useEffect(() => {
    setNombres(user?.nombres ?? "");
    setApellidoPaterno(user?.apellido_paterno ?? "");
    setApellidoMaterno(user?.apellido_materno ?? "");
    setTelefono(user?.telefono ?? "");
  }, [
    user?.nombres,
    user?.apellido_paterno,
    user?.apellido_materno,
    user?.telefono,
  ]);

  const fullName = useMemo(() => {
    if (user?.nombre_completo) return user.nombre_completo;
    return `${user?.nombres ?? ""} ${user?.apellido_paterno ?? ""}`.trim();
  }, [user?.nombre_completo, user?.nombres, user?.apellido_paterno]);

  const handleSaveProfile = async () => {
    if (!user?.id) return;

    if (!nombres.trim() || !apellidoPaterno.trim()) {
      Alert.alert(
        "Campos requeridos",
        "Nombre y apellido paterno son obligatorios.",
      );
      return;
    }

    setIsSaving(true);
    try {
      await apiClient.patch(`/api/usuarios/${user.id}`, {
        nombres: nombres.trim(),
        apellido_paterno: apellidoPaterno.trim(),
        apellido_materno: apellidoMaterno.trim() || null,
        telefono: telefono.trim() || null,
      });

      await validateSession();
      setIsEditing(false);
      Alert.alert(
        "Perfil actualizado",
        "Tus datos se guardaron correctamente.",
      );
    } catch (error: any) {
      Alert.alert(
        "No se pudo actualizar",
        error?.response?.data?.message || "Intenta de nuevo.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePhoto = async () => {
    if (!user?.id) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permiso requerido",
        "Debes permitir acceso a tu galería para cambiar la foto.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) {
      return;
    }

    const asset = result.assets[0];
    const uri = asset.uri;
    const fileName = asset.fileName || `avatar-${Date.now()}.jpg`;
    const mimeType = asset.mimeType || "image/jpeg";

    const formData = new FormData();
    formData.append("file", {
      uri,
      name: fileName,
      type: mimeType,
    } as any);

    setIsUploadingPhoto(true);
    try {
      await apiClient.post(
        `/api/usuarios/${user.id}/foto-perfil/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      await validateSession();
      Alert.alert(
        "Foto actualizada",
        "Tu foto de perfil se cambió correctamente.",
      );
    } catch (error: any) {
      Alert.alert(
        "No se pudo actualizar la foto",
        error?.response?.data?.message || "Intenta de nuevo.",
      );
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  type InfoRow = {
    key: string;
    IconComp: any;
    label: string;
    value: string | null | undefined;
    editable?: boolean;
    inputValue?: string;
    onChangeText?: (value: string) => void;
    keyboardType?: KeyboardTypeOptions;
  };

  const infoRowsDraft: InfoRow[] = [];

  if (isEditing) {
    infoRowsDraft.push(
      {
        key: "nombres",
        IconComp: User,
        label: "Nombre(s)",
        value: nombres,
        editable: true,
        inputValue: nombres,
        onChangeText: setNombres,
      },
      {
        key: "apellido_paterno",
        IconComp: User,
        label: "Apellido paterno",
        value: apellidoPaterno,
        editable: true,
        inputValue: apellidoPaterno,
        onChangeText: setApellidoPaterno,
      },
      {
        key: "apellido_materno",
        IconComp: User,
        label: "Apellido materno",
        value: apellidoMaterno,
        editable: true,
        inputValue: apellidoMaterno,
        onChangeText: setApellidoMaterno,
      },
    );
  } else {
    infoRowsDraft.push({
      key: "nombre_completo",
      IconComp: User,
      label: "Nombre completo",
      value: fullName || null,
    });
  }

  infoRowsDraft.push(
    {
      key: "email",
      IconComp: Mail,
      label: "Correo electrónico",
      value: user?.email,
    },
    {
      key: "rol",
      IconComp: Briefcase,
      label: "Rol",
      value: user?.rol_nombre,
    },
    {
      key: "departamento",
      IconComp: Building2,
      label: "Departamento",
      value: user?.departamento_nombre || null,
    },
    {
      key: "telefono",
      IconComp: Phone,
      label: "Teléfono",
      value: isEditing ? telefono : user?.telefono || null,
      editable: isEditing,
      inputValue: telefono,
      onChangeText: setTelefono,
      keyboardType: "phone-pad",
    },
    {
      key: "estado",
      IconComp: ShieldCheck,
      label: "Estado de cuenta",
      value: user?.activo === false ? "Inactiva" : "Activa",
    },
    {
      key: "created_at",
      IconComp: Clock,
      label: "Cuenta creada",
      value: formatDate(user?.created_at),
    },
  );

  const infoRows = infoRowsDraft.filter((row) => row.value != null);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={headerGradient}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Mi Perfil</Text>

          <View style={styles.profileInfo}>
            <View style={styles.avatarWrapper}>
              {user?.foto_perfil_url ? (
                <Image
                  source={{ uri: user.foto_perfil_url }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {user?.nombres?.charAt(0).toUpperCase() || "A"}
                  </Text>
                </View>
              )}
              {user?.activo !== false && <View style={styles.activeBadge} />}
              <TouchableOpacity
                style={styles.avatarCameraButton}
                onPress={handleChangePhoto}
                disabled={isUploadingPhoto}
              >
                {isUploadingPhoto ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Camera size={14} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
            <View style={styles.profileDetails}>
              <Text style={styles.profileName}>{fullName || "Usuario"}</Text>
              <View style={styles.profileMeta}>
                <Mail size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.profileMetaText}>{user?.email}</Text>
              </View>
              <View style={styles.profileMeta}>
                <Briefcase size={14} color="rgba(255,255,255,0.7)" />
                <Text style={styles.profileMetaText}>{user?.rol_nombre}</Text>
              </View>
              <View style={styles.profileMeta}>
                <ShieldCheck size={14} color="rgba(255,255,255,0.6)" />
                <Text style={styles.profileMetaText}>
                  {user?.activo === false ? "Cuenta inactiva" : "Cuenta activa"}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.infoCardWrapper}>
          <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
            {infoRows.map((row, index) => {
              const IconComp = row.IconComp;
              return (
                <View
                  key={row.key}
                  style={[
                    styles.infoRow,
                    index < infoRows.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.infoIconBox,
                      { backgroundColor: colors.surfaceSecondary },
                    ]}
                  >
                    <IconComp size={16} color={colors.textSecondary} />
                  </View>
                  <View style={styles.infoTextBlock}>
                    <Text
                      style={[styles.infoLabel, { color: colors.textMuted }]}
                    >
                      {row.label}
                    </Text>
                    {row.editable ? (
                      <TextInput
                        value={row.inputValue}
                        onChangeText={row.onChangeText}
                        placeholder={row.label}
                        placeholderTextColor={colors.textMuted}
                        keyboardType={row.keyboardType ?? "default"}
                        style={[
                          styles.inlineInput,
                          {
                            backgroundColor: colors.surfaceSecondary,
                            color: colors.text,
                            borderColor: colors.border,
                          },
                        ]}
                      />
                    ) : (
                      <Text style={[styles.infoValue, { color: colors.text }]}>
                        {row.value}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.surface }]}
            onPress={isEditing ? handleSaveProfile : () => setIsEditing(true)}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={colors.text} />
            ) : isEditing ? (
              <Save size={18} color={colors.text} />
            ) : (
              <Pencil size={18} color={colors.text} />
            )}
            <Text style={[styles.actionButtonText, { color: colors.text }]}>
              {isEditing ? "Guardar cambios" : "Editar datos"}
            </Text>
          </TouchableOpacity>

          {isEditing && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.surface }]}
              onPress={() => {
                setNombres(user?.nombres ?? "");
                setApellidoPaterno(user?.apellido_paterno ?? "");
                setApellidoMaterno(user?.apellido_materno ?? "");
                setTelefono(user?.telefono ?? "");
                setIsEditing(false);
              }}
            >
              <X size={18} color={colors.text} />
              <Text style={[styles.actionButtonText, { color: colors.text }]}>
                Cancelar
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Configuración */}
        <View style={styles.settingsContainer}>
          {/* Preferencias */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
              Preferencias
            </Text>
            <View
              style={[
                styles.sectionContent,
                { backgroundColor: colors.surface },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.settingItem,
                  { borderBottomWidth: 1, borderBottomColor: colors.border },
                ]}
                onPress={toggleTheme}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.settingIcon,
                    { backgroundColor: colors.surfaceSecondary },
                  ]}
                >
                  {isDark ? (
                    <Moon size={20} color={colors.primary} />
                  ) : (
                    <Sun size={20} color={colors.primary} />
                  )}
                </View>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    Modo Oscuro
                  </Text>
                  <Text
                    style={[styles.settingValue, { color: colors.textMuted }]}
                  >
                    {isDark ? "Activado" : "Desactivado"}
                  </Text>
                </View>
                <View
                  style={[
                    styles.toggleSwitch,
                    {
                      backgroundColor: isDark ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.toggleKnob,
                      {
                        transform: [{ translateX: isDark ? 20 : 0 }],
                      },
                    ]}
                  />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.settingItem]}
                onPress={() => setNotifications(!notifications)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.settingIcon,
                    { backgroundColor: colors.surfaceSecondary },
                  ]}
                >
                  <Bell size={20} color={colors.primary} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    Notificaciones
                  </Text>
                  <Text
                    style={[styles.settingValue, { color: colors.textMuted }]}
                  >
                    {notifications ? "Activadas" : "Desactivadas"}
                  </Text>
                </View>
                <View
                  style={[
                    styles.toggleSwitch,
                    {
                      backgroundColor: notifications
                        ? colors.primary
                        : colors.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.toggleKnob,
                      {
                        transform: [{ translateX: notifications ? 20 : 0 }],
                      },
                    ]}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Seguridad */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
              Seguridad
            </Text>
            <View
              style={[
                styles.sectionContent,
                { backgroundColor: colors.surface },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.settingItem,
                  { borderBottomWidth: 1, borderBottomColor: colors.border },
                ]}
                onPress={handleChangePassword}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.settingIcon,
                    { backgroundColor: colors.surfaceSecondary },
                  ]}
                >
                  <Lock size={20} color={colors.primary} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    Cambiar Contraseña
                  </Text>
                </View>
                <ChevronRight size={20} color={colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.settingItem]}
                onPress={() =>
                  Alert.alert(
                    "Privacidad",
                    "• Cifrado de extremo a extremo\n• Cumplimiento GDPR\n• Datos seguros en servidores",
                  )
                }
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.settingIcon,
                    { backgroundColor: colors.surfaceSecondary },
                  ]}
                >
                  <Shield size={20} color={colors.primary} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    Privacidad
                  </Text>
                </View>
                <ChevronRight size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Soporte */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
              Soporte
            </Text>
            <View
              style={[
                styles.sectionContent,
                { backgroundColor: colors.surface },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.settingItem,
                  { borderBottomWidth: 1, borderBottomColor: colors.border },
                ]}
                onPress={() =>
                  Alert.alert(
                    "Correos de Administradores",
                    "Contacta al equipo administrativo:\n\nadmin@romdeau.com\nsupport@romdeau.com",
                  )
                }
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.settingIcon,
                    { backgroundColor: colors.surfaceSecondary },
                  ]}
                >
                  <HelpCircle size={20} color={colors.primary} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    Centro de Administración
                  </Text>
                </View>
                <ChevronRight size={20} color={colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.settingItem,
                  { borderBottomWidth: 1, borderBottomColor: colors.border },
                ]}
                onPress={() =>
                  Alert.alert(
                    "Romdeau Audit",
                    "Versión 1.0.0\n\n© 2026 Romdeau",
                  )
                }
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.settingIcon,
                    { backgroundColor: colors.surfaceSecondary },
                  ]}
                >
                  <Info size={20} color={colors.primary} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    Acerca de
                  </Text>
                  <Text
                    style={[styles.settingValue, { color: colors.textMuted }]}
                  >
                    v1.0.0
                  </Text>
                </View>
                <ChevronRight size={20} color={colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.settingItem]}
                onPress={() =>
                  Alert.alert("Limpiar Caché", "¿Eliminar datos temporales?")
                }
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.settingIcon,
                    { backgroundColor: colors.surfaceSecondary },
                  ]}
                >
                  <Database size={20} color={colors.primary} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    Limpiar Caché
                  </Text>
                </View>
                <ChevronRight size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: "#fee2e2" }]}
          onPress={logout}
        >
          <LogOut size={20} color="#b91c1c" />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 80,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 24,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatarCameraButton: {
    position: "absolute",
    right: -4,
    bottom: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#1e293b",
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  activeBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#10b981",
    borderWidth: 2,
    borderColor: "#1e293b",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  avatarText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "700",
  },
  profileDetails: {
    flex: 1,
    gap: 6,
  },
  profileName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  profileMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  profileMetaText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
  },
  infoCardWrapper: {
    paddingHorizontal: 20,
    marginTop: -40,
  },
  infoCard: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  infoIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  infoTextBlock: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  inlineInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  actionsRow: {
    paddingHorizontal: 20,
    marginTop: 16,
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 16,
    borderRadius: 16,
    marginTop: 20,
    marginHorizontal: 20,
  },
  logoutText: {
    color: "#b91c1c",
    fontSize: 16,
    fontWeight: "600",
  },
  settingsContainer: {
    paddingHorizontal: 20,
    marginVertical: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 12,
  },
  sectionContent: {
    borderRadius: 16,
    overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  settingValue: {
    fontSize: 13,
    marginTop: 4,
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
});
