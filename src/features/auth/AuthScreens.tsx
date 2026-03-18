import React, { useMemo, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { supabase } from "../../supabase";
import { useThemeStore } from "../../store/themeStore";
import { AmoledTheme, DarkTheme, LightTheme } from "../../theme/theme";
import { AuthScreenLayout } from "./AuthScreenLayout";

type AuthRoute = "login" | "signup" | "forgot";

function usePaperTheme() {
  const { theme } = useThemeStore();
  return theme === "light" ? LightTheme : theme === "dark" ? DarkTheme : AmoledTheme;
}

function showError(title: string, err: unknown) {
  const msg = err instanceof Error ? err.message : "Something went wrong.";
  Alert.alert(title, msg);
}

export function LoginScreen({ go }: { go: (r: AuthRoute) => void }) {
  const paperTheme = usePaperTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(
    () => email.trim().length > 3 && password.length >= 6,
    [email, password],
  );

  const onLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
    } catch (e) {
      showError("Login failed", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenLayout title="Welcome back">
      <Text style={{ color: paperTheme.colors.text }}>
        Login to sync your expenses, budgets, subscriptions, and goals.
      </Text>
      <View style={{ height: 16 }} />
      <TextInput
        mode="outlined"
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        textContentType="emailAddress"
        style={styles.input}
      />
      <TextInput
        mode="outlined"
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        textContentType="password"
        style={styles.input}
      />
      <Button
        mode="contained"
        onPress={onLogin}
        loading={loading}
        disabled={!canSubmit || loading}
        style={styles.primaryBtn}
      >
        Login
      </Button>
      <Button mode="text" onPress={() => go("forgot")}>
        Forgot password?
      </Button>
      <View style={styles.row}>
        <Text style={{ color: paperTheme.colors.text }}>New here?</Text>
        <Button mode="text" onPress={() => go("signup")}>
          Create account
        </Button>
      </View>
    </AuthScreenLayout>
  );
}

export function SignupScreen({ go }: { go: (r: AuthRoute) => void }) {
  const paperTheme = usePaperTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    if (email.trim().length <= 3) return false;
    if (password.length < 6) return false;
    if (password !== confirm) return false;
    return true;
  }, [email, password, confirm]);

  const onSignup = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      Alert.alert(
        "Check your email",
        "We sent a confirmation link. After confirming, you can log in.",
      );
      go("login");
    } catch (e) {
      showError("Sign up failed", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenLayout title="Create account">
      <Text style={{ color: paperTheme.colors.text }}>
        Email/password account with Supabase.
      </Text>
      <View style={{ height: 16 }} />
      <TextInput
        mode="outlined"
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        textContentType="emailAddress"
        style={styles.input}
      />
      <TextInput
        mode="outlined"
        label="Password (min 6 chars)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        textContentType="newPassword"
        style={styles.input}
      />
      <TextInput
        mode="outlined"
        label="Confirm password"
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
        textContentType="password"
        style={styles.input}
      />
      <Button
        mode="contained"
        onPress={onSignup}
        loading={loading}
        disabled={!canSubmit || loading}
        style={styles.primaryBtn}
      >
        Sign up
      </Button>
      <Button mode="text" onPress={() => go("login")}>
        Back to login
      </Button>
    </AuthScreenLayout>
  );
}

export function ForgotPasswordScreen({ go }: { go: (r: AuthRoute) => void }) {
  const paperTheme = usePaperTheme();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => email.trim().length > 3, [email]);

  const onReset = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) throw error;
      Alert.alert("Email sent", "Check your inbox for the password reset link.");
      go("login");
    } catch (e) {
      showError("Reset failed", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenLayout title="Reset password">
      <Text style={{ color: paperTheme.colors.text }}>
        Enter your email to receive a reset link.
      </Text>
      <View style={{ height: 16 }} />
      <TextInput
        mode="outlined"
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        textContentType="emailAddress"
        style={styles.input}
      />
      <Button
        mode="contained"
        onPress={onReset}
        loading={loading}
        disabled={!canSubmit || loading}
        style={styles.primaryBtn}
      >
        Send reset email
      </Button>
      <Button mode="text" onPress={() => go("login")}>
        Back to login
      </Button>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  input: { marginBottom: 12 },
  primaryBtn: { marginTop: 8, borderRadius: 14 },
  row: { flexDirection: "row", alignItems: "center", marginTop: 8 },
});

