import React from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "react-native-paper";
import { useThemeStore } from "../../store/themeStore";
import { AmoledTheme, DarkTheme, LightTheme } from "../../theme/theme";

export function AuthScreenLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { theme } = useThemeStore();
  const paperTheme =
    theme === "light" ? LightTheme : theme === "dark" ? DarkTheme : AmoledTheme;

  const bg1 =
    theme === "amoled"
      ? "#000000"
      : (paperTheme.colors.background as string);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: bg1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <LinearGradient
        colors={[
          bg1,
          paperTheme.colors.surface as string,
          bg1,
        ]}
        style={styles.gradient}
      >
        <View style={styles.container}>
          <Text variant="headlineMedium" style={{ color: paperTheme.colors.text }}>
            {title}
          </Text>
          <View style={{ height: 16 }} />
          {children}
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
});

