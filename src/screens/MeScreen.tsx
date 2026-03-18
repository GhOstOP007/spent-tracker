import React from "react";
import { View } from "react-native";
import { Button, Card, Text } from "react-native-paper";
import { supabase } from "../supabase";
import { useThemeStore } from "../store/themeStore";
import { SpendwiseBackground } from "../ui/SpendwiseBackground";
import { useSpendwiseTheme } from "../ui/spendwiseTokens";

export default function MeScreen() {
  const { c, r } = useSpendwiseTheme();
  const { theme, setTheme } = useThemeStore();

  return (
    <SpendwiseBackground blobs={false}>
      <View style={{ flex: 1, padding: 16, paddingTop: 24 }}>
        <Text style={{ color: c.text2, fontSize: 11, letterSpacing: 1 }}>
          PROFILE
        </Text>
        <View style={{ height: 10 }} />
        <Card
          style={{
            backgroundColor: c.card,
            borderRadius: r.lg,
            borderWidth: 1,
            borderColor: c.border,
          }}
        >
          <Card.Content>
            <Text style={{ color: c.text, fontSize: 18, fontWeight: "600" }}>
              Me
            </Text>
            <Text style={{ color: c.text2, marginTop: 4 }}>
              Theme and account actions
            </Text>
            <View style={{ height: 12 }} />
            <Button mode="outlined" onPress={() => setTheme("light")}>
              Light {theme === "light" ? "✓" : ""}
            </Button>
            <View style={{ height: 8 }} />
            <Button mode="outlined" onPress={() => setTheme("dark")}>
              Dark {theme === "dark" ? "✓" : ""}
            </Button>
            <View style={{ height: 8 }} />
            <Button mode="outlined" onPress={() => setTheme("amoled")}>
              AMOLED {theme === "amoled" ? "✓" : ""}
            </Button>
            <View style={{ height: 12 }} />
            <Button
              mode="contained"
              buttonColor={c.accent}
              textColor="#fff"
              onPress={() => supabase.auth.signOut()}
            >
              Logout
            </Button>
          </Card.Content>
        </Card>
      </View>
    </SpendwiseBackground>
  );
}

