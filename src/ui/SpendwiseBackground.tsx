import React from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSpendwiseTheme } from "./spendwiseTokens";

export function SpendwiseBackground({
  children,
  blobs = true,
}: {
  children: React.ReactNode;
  blobs?: boolean;
}) {
  const { c } = useSpendwiseTheme();

  return (
    <View style={[styles.root, { backgroundColor: c.bg, pointerEvents: "auto" }]}>
      <LinearGradient
        colors={[c.bg, c.surface, c.bg]}
        style={StyleSheet.absoluteFill}
      />
      {blobs ? (
        <>
          <View
            style={[
              styles.blob,
              {
                width: 200,
                height: 200,
                backgroundColor: c.accent,
                top: -50,
                left: -30,
              },
            ]}
          />
          <View
            style={[
              styles.blob,
              {
                width: 150,
                height: 150,
                backgroundColor: c.accent2,
                bottom: 220,
                right: -30,
              },
            ]}
          />
        </>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  blob: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.08,
  },
});

