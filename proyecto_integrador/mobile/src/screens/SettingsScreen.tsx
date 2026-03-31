import React from "react";
import { View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

export default function SettingsScreen() {
  const { colors } = useTheme();

  return <View style={{ flex: 1, backgroundColor: colors.background }} />;
}
