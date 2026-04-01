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
  colors: {
    primary: string;
    primaryDark: string;
    "primary-foreground": string;
    background: string;
    surface: string;
    "surface-2": string;
    border: string;
    "text-primary": string;
    "text-secondary": string;
    success: string;
    warning: string;
    danger: string;
    // Mantener compatibilidad
    surfaceSecondary: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    error: string;
    headerBg: string;
    headerText: string;
  };
}

const lightColors = {
  primary: "#2f66ff",
  "primary-foreground": "#ffffff",
  background: "#f4f7ff",
  surface: "#ffffff",
  "surface-2": "#f0f4ff",
  border: "#cdd8f3",
  "text-primary": "#0f172a",
  "text-secondary": "#5b708d",
  success: "#16c784",
  warning: "#e2a23f",
  danger: "#ff4d6d",
  // Compatibilidad existente
  surfaceSecondary: "#e2ebff",
  text: "#0f172a",
  textSecondary: "#475569",
  textMuted: "#7281a4",
  primaryDark: "#1e4ee0",
  error: "#ff4d6d",
  headerBg: "#eaf0ff",
  headerText: "#0f172a",
};

const darkColors = {
  primary: "#4a7dff",
  "primary-foreground": "#ffffff",
  background: "#020714",
  surface: "#0e1b40",
  "surface-2": "#123060",
  border: "#25427b",
  "text-primary": "#eef4ff",
  "text-secondary": "#a9b8d7",
  success: "#32d583",
  warning: "#ffb84d",
  danger: "#ff6b8a",
  // Compatibilidad existente
  surfaceSecondary: "#1a2848",
  text: "#eef4ff",
  textSecondary: "#a9b8d7",
  textMuted: "#8aa0c4",
  primaryDark: "#2f66ff",
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
