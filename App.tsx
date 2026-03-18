import "react-native-gesture-handler";
import React, { useEffect } from "react";
import "react-native-get-random-values";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider as PaperProvider } from "react-native-paper";
import { LightTheme, DarkTheme, AmoledTheme } from "./src/theme/theme";
import { useThemeStore } from "./src/store/themeStore";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthGate } from "./src/features/auth/AuthGate";
import { useAuthStore } from "./src/store/authStore";
import { bootstrapUser } from "./src/features/bootstrap/bootstrapUser";
export default function App() {
  const { theme } = useThemeStore();
  const userId = useAuthStore((s) => s.userId);
  const selectedTheme =
    theme === "light" ? LightTheme : theme === "dark" ? DarkTheme : AmoledTheme;

  useEffect(() => {
    if (!userId) return;
    bootstrapUser().catch((e) => console.warn("bootstrapUser failed", e));
  }, [userId]);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={selectedTheme}>
        <AuthGate>
          <AppNavigator />
        </AuthGate>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
