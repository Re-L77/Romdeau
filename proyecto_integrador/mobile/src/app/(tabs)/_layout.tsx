import { Tabs } from "expo-router";
import { useColorScheme, View, StyleSheet } from "react-native";
import { Home, CheckSquare, QrCode, ChartNoAxesColumn, User } from "lucide-react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const colors = {
    background: isDark ? "#060d1f" : "#ffffff",
    border: isDark ? "#1f2f55" : "#d7e1ff",
    inactive: isDark ? "#8194bc" : "#8ca0c7",
    active: isDark ? "#79a3ff" : "#2f66ff",
    scanBg: "#2f66ff",
    scanBorder: isDark ? "#0b1733" : "#ffffff",
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 88,
          paddingBottom: 18,
          paddingTop: 10,
        },
        tabBarActiveTintColor: colors.active,
        tabBarInactiveTintColor: colors.inactive,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="assets"
        options={{
          title: "Auditorías",
          tabBarIcon: ({ color, size }) => (
            <CheckSquare size={size} color={color} />
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
          tabBarIcon: ({ color, size }) => (
            <ChartNoAxesColumn size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  scanButton: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "#2f66ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 28,
    borderWidth: 4,
    shadowColor: "#2f66ff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
});
