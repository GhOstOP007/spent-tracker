import { useThemeStore } from "../store/themeStore";
import { AmoledTheme, DarkTheme, LightTheme } from "../theme/theme";

export function useSpendwiseTheme() {
  const { theme } = useThemeStore();
  const paperTheme =
    theme === "light" ? LightTheme : theme === "dark" ? DarkTheme : AmoledTheme;

  const colors = paperTheme.colors as any;
  return {
    mode: theme,
    paperTheme,
    c: {
      bg: colors.background as string,
      surface: colors.surface as string,
      card: (colors.card ?? colors.surface) as string,
      border: (colors.border ?? colors.outline) as string,
      text: colors.text as string,
      text2: (colors.text2 ?? colors.outline) as string,
      text3: (colors.text3 ?? colors.outlineVariant ?? colors.outline) as string,
      accent: (colors.accent ?? colors.primary) as string,
      accent2: (colors.accent2 ?? "#00D4AA") as string,
      danger: (colors.danger ?? colors.error) as string,
      warning: (colors.warning ?? "#FFB347") as string,
    },
    r: {
      sm: 12,
      md: 18,
      lg: 24,
      xl: 32,
      full: 999,
    },
  };
}

