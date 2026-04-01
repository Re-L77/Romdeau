import { Tabs } from "expo-router";
import { View, StyleSheet } from "react-native";
import {
  Home,
  CheckSquare,
  QrCode,
  ChartNoAxesColumn,
  User,
} from "lucide-react-native";
import { useTheme } from "../../contexts/ThemeContext";

export default function TabLayout() {
  const { isDark } = useTheme();

  const colors = {
    tabBackground: isDark ? "#0d1a32" : "#ffffff",
    tabBorder: isDark ? "#1f3a6b" : "#dbe5ff",
    inactive: isDark ? "#5a7095" : "#64748b",
    active: isDark ? "#4da8ff" : "#2f66ff",
    activeBg: isDark ? "#1e3a6f" : "#e9efff",
    scanBg: "#2f66ff",
    scanBorder: isDark ? "#0d1f40" : "#ffffff",
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          left: 14,
          right: 14,
          bottom: 14,
          backgroundColor: colors.tabBackground,
          borderColor: colors.tabBorder,
          borderTopWidth: 1,
          borderWidth: 1,
          height: 78,
          paddingBottom: 10,
          paddingTop: 8,
          borderRadius: 24,
          elevation: 10,
          shadowColor: isDark ? "#000" : "#24407a",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: isDark ? 0.45 : 0.2,
          shadowRadius: 16,
        },
        tabBarActiveTintColor: colors.active,
        tabBarInactiveTintColor: colors.inactive,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingTop: 1,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={[
                styles.iconFrame,
                focused && {
                  backgroundColor: colors.activeBg,
                  borderColor: colors.tabBorder,
                },
              ]}
            >
              <Home size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="assets"
        options={{
          title: "Auditorías",
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={[
                styles.iconFrame,
                focused && {
                  backgroundColor: colors.activeBg,
                  borderColor: colors.tabBorder,
                },
              ]}
            >
              <CheckSquare size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: "Escanear",
          tabBarIcon: ({ focused }) => (
            <View
              style={[styles.scanButton, { borderColor: colors.scanBorder }]}
            >
              <QrCode size={28} color="#ffffff" />
            </View>
          ),
          tabBarLabel: () => null,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate("scanner");
          },
        })}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Progreso",
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={[
                styles.iconFrame,
                focused && {
                  backgroundColor: colors.activeBg,
                  borderColor: colors.tabBorder,
                },
              ]}
            >
              <ChartNoAxesColumn size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={[
                styles.iconFrame,
                focused && {
                  backgroundColor: colors.activeBg,
                  borderColor: colors.tabBorder,
                },
              ]}
            >
              <User size={size} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconFrame: {
    width: 40,
    height: 32,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  scanButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#2f66ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
    borderWidth: 3,
    shadowColor: "#2f66ff",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 12,
  },
});
