import { MD3LightTheme, MD3DarkTheme } from "react-native-paper";
import { lightColors, darkColors, amoledColors } from "./colors";


export const LightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...lightColors,
  },
};

export const DarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...darkColors,
  },
};

export const AmoledTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...amoledColors,
  },
};
