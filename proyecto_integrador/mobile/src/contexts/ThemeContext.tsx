import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";
import { useColorScheme, Appearance } from "react-native";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  isDark: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  colors: typeof lightColors;
}

const lightColors = {
  background: "#eef3ff",
  surface: "#ffffff",
  surfaceSecondary: "#e2ebff",
  text: "#0f172a",
  textSecondary: "#475569",
  textMuted: "#7c8aa5",
  border: "#cdd8f3",
  primary: "#2f66ff",
  primaryDark: "#1e4ee0",
  success: "#22c55e",
  warning: "#f59e0b",
  error: "#ff4d6d",
  headerBg: "#16274a",
  headerText: "#ffffff",
};

const darkColors = {
  background: "#070d1f",
  surface: "#111b34",
  surfaceSecondary: "#1a2848",
  text: "#eef4ff",
  textSecondary: "#a9b8d7",
  textMuted: "#7d90b4",
  border: "#263a65",
  primary: "#4a7dff",
  primaryDark: "#2f66ff",
  success: "#32d583",
  warning: "#ffb84d",
  error: "#ff6b8a",
  headerBg: "#0b142b",
  headerText: "#ffffff",
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");

  const isDark =
    themeMode === "system"
      ? systemColorScheme === "dark"
      : themeMode === "dark";

  const colors = isDark ? darkColors : lightColors;

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      // Re-render when system theme changes
    });
    return () => subscription.remove();
  }, []);

  return (
    <ThemeContext.Provider value={{ isDark, themeMode, setThemeMode, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme debe usarse dentro de ThemeProvider");
  }
  return context;
}
