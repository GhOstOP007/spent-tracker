import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ThemeState {
  theme: "light" | "dark" | "amoled";
  setTheme: (theme: "light" | "dark" | "amoled") => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: "light",
  setTheme: async (theme) => {
    set({ theme });
    try {
      await AsyncStorage.setItem("theme", theme);
    } catch (e) {
      console.log("Failed to save theme", e);
    }
  },
}));
