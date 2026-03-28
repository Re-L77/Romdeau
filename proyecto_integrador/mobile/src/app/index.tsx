import { Redirect } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import LoginScreen from "../screens/LoginScreen";

export default function Index() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <LoginScreen />;
}
