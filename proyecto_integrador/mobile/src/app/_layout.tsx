import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme, ActivityIndicator, View } from "react-native";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { ThemeProvider, useTheme } from "../contexts/ThemeContext";

function RootLayoutNav() {
  const { isLoading, isAuthenticated } = useAuth();
  const { colors } = useTheme();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        // Flujo Autenticado
        <>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="scanner"
            options={{
              presentation: "fullScreenModal",
              animation: "slide_from_bottom",
            }}
          />
          <Stack.Screen
            name="audit/[assetId]"
            options={{
              presentation: "card",
              animation: "slide_from_right",
            }}
          />
          <Stack.Screen
            name="manual-entry"
            options={{
              presentation: "modal",
              animation: "slide_from_bottom",
            }}
          />
        </>
      ) : (
        // Flujo NO Autenticado
        <>
          <Stack.Screen
            name="index"
            options={{
              animation: "none",
            }}
          />
          <Stack.Screen
            name="forgot-password"
            options={{
              presentation: "card",
              animation: "slide_from_right",
            }}
          />
          <Stack.Screen
            name="reset-password"
            options={{
              presentation: "card",
              animation: "slide_from_right",
            }}
          />
        </>
      )}
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider>
      <AuthProvider>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        <RootLayoutNav />
      </AuthProvider>
    </ThemeProvider>
  );
}
