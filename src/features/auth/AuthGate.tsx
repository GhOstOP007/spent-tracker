import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { supabase } from "../../supabase";
import { LoginScreen, SignupScreen, ForgotPasswordScreen } from "./AuthScreens";
import { useAuthStore } from "../../store/authStore";

type AuthRoute = "login" | "signup" | "forgot";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [initializing, setInitializing] = useState(true);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [route, setRoute] = useState<AuthRoute>("login");
  const setSession = useAuthStore((s) => s.setSession);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) {
        setSessionUserId(null);
        setSession(null);
      } else {
        setSessionUserId(data.session?.user?.id ?? null);
        setSession(data.session ?? null);
      }
      setInitializing(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSessionUserId(sess?.user?.id ?? null);
      setSession(sess ?? null);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const authUi = useMemo(() => {
    const go = (r: AuthRoute) => setRoute(r);
    if (route === "signup") return <SignupScreen go={go} />;
    if (route === "forgot") return <ForgotPasswordScreen go={go} />;
    return <LoginScreen go={go} />;
  }, [route]);

  if (initializing) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!sessionUserId) return authUi;
  return <>{children}</>;
}

