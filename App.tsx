import "react-native-gesture-handler";
import React, { useEffect } from "react";
import "react-native-get-random-values";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider as PaperProvider } from "react-native-paper";
import { LightTheme, DarkTheme, AmoledTheme } from "./src/theme/theme";
import { useThemeStore } from "./src/store/themeStore";
import AppNavigator from "./src/navigation/AppNavigator";
import { useExpenseStore } from "./src/store/expenseStore";
export default function App() {
  const { theme } = useThemeStore();
  const { loadExpenses } = useExpenseStore();
  const selectedTheme =
    theme === "light" ? LightTheme : theme === "dark" ? DarkTheme : AmoledTheme;

  useEffect(() => {
    loadExpenses();
  }, []);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={selectedTheme}>
        <AppNavigator />
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
