import React, { useState } from "react";
import { View, StyleSheet, StatusBar, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer, Theme } from "@react-navigation/native";
import { FAB, Menu } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import DashboardScreen from "../screens/DashboardScreen";
import BudgetsScreen from "../screens/BudgetsScreen";
import AnalyticsScreen from "../screens/AnalyticsScreen";
import SubscriptionsScreen from "../screens/SubscriptionsScreen";
import GoalsScreen from "../screens/GoalsScreen";
import MeScreen from "../screens/MeScreen";
import { useThemeStore } from "../store/themeStore";
import { LightTheme, DarkTheme, AmoledTheme } from "../theme/theme";
import AddExpenseModal from "../components/AddExpenseModal";
import { supabase } from "../supabase";
import { useSpendwiseTheme } from "../ui/spendwiseTokens";

// Tab Navigator
const Tab = createBottomTabNavigator();

/* -------------------- Global Header -------------------- */
function GlobalHeader() {
  const { theme } = useThemeStore();
  const selectedTheme =
    theme === "light" ? LightTheme : theme === "dark" ? DarkTheme : AmoledTheme;

  const statusBarHeight =
    Platform.OS === "android" ? StatusBar.currentHeight || 0 : 44;

  return (
    <View
      style={[
        styles.header,
        { backgroundColor: selectedTheme.colors.primary, height: statusBarHeight },
      ]}
    >
      <StatusBar
        translucent
        backgroundColor={selectedTheme.colors.primary}
        barStyle={theme === "light" ? "dark-content" : "light-content"}
      />
    </View>
  );
}

/* -------------------- App Navigator -------------------- */
export default function AppNavigator() {
  const { theme, setTheme } = useThemeStore();
  const paperTheme =
    theme === "light" ? LightTheme : theme === "dark" ? DarkTheme : AmoledTheme;
  const { c, r, mode } = useSpendwiseTheme();

  const navigationTheme: Theme = {
    dark: theme !== "light",
    colors: {
      primary: paperTheme.colors.primary,
      background: paperTheme.colors.background,
      card: paperTheme.colors.surface,
      text: paperTheme.colors.text,
      border: paperTheme.colors.outline,
      notification: paperTheme.colors.tertiary,
    },
    fonts: {
      regular: { fontFamily: "", fontWeight: "normal" },
      medium: { fontFamily: "", fontWeight: "normal" },
      bold: { fontFamily: "", fontWeight: "normal" },
      heavy: { fontFamily: "", fontWeight: "normal" },
    },
  };

  const [modalVisible, setModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <NavigationContainer theme={navigationTheme}>
      <View style={{ flex: 1 }}>
        {/* Global Accent Header */}
        <View>
          <GlobalHeader />
          <View style={styles.topRightMenu}>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <FAB
                  icon="dots-vertical"
                  size="small"
                  style={[
                    styles.menuFab,
                    { backgroundColor: paperTheme.colors.surface },
                  ]}
                  color={paperTheme.colors.text}
                  onPress={() => setMenuVisible(true)}
                />
              }
            >
              <Menu.Item
                onPress={() => {
                  setTheme("light");
                  setMenuVisible(false);
                }}
                title="Theme: Light"
                leadingIcon="white-balance-sunny"
              />
              <Menu.Item
                onPress={() => {
                  setTheme("dark");
                  setMenuVisible(false);
                }}
                title="Theme: Dark"
                leadingIcon="weather-night"
              />
              <Menu.Item
                onPress={() => {
                  setTheme("amoled");
                  setMenuVisible(false);
                }}
                title="Theme: AMOLED"
                leadingIcon="brightness-2"
              />
              <Menu.Item
                onPress={async () => {
                  setMenuVisible(false);
                  await supabase.auth.signOut();
                }}
                title="Logout"
                leadingIcon="logout"
              />
            </Menu>
          </View>
        </View>

        {/* Tab Navigator */}
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarShowLabel: true,
            tabBarActiveTintColor: c.accent,
            tabBarInactiveTintColor: c.text3,
            tabBarLabelStyle: {
              fontSize: 9,
              letterSpacing: 0.3,
              marginTop: -2,
              marginBottom: 6,
            },
            tabBarStyle: {
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 78,
              paddingTop: 10,
              borderTopWidth: 1,
              borderTopColor: c.border,
              backgroundColor: "transparent",
            },
            tabBarBackground: () => (
              <View style={StyleSheet.absoluteFill}>
                <BlurView
                  intensity={30}
                  tint={mode === "light" ? "light" : "dark"}
                  style={StyleSheet.absoluteFill}
                />
                <View
                  style={[
                    StyleSheet.absoluteFill,
                    {
                      backgroundColor:
                        mode === "light"
                          ? "rgba(245,245,247,0.65)"
                          : "rgba(14,14,14,0.55)",
                    },
                  ]}
                />
              </View>
            ),
            tabBarIcon: ({ focused }) => {
              let iconName: any;
              if (route.name === "Home") iconName = "view-dashboard";
              if (route.name === "Budget") iconName = "calendar-month";
              if (route.name === "Stats") iconName = "chart-donut";
              if (route.name === "Subs") iconName = "refresh-circle";
              if (route.name === "Goals") iconName = "star";
              if (route.name === "Me") iconName = "account-circle";

              return (
                <MaterialCommunityIcons
                  name={iconName}
                  size={22}
                  color={focused ? c.accent : c.text3}
                />
              );
            },
          })}
        >
          <Tab.Screen name="Home" component={DashboardScreen} />
          <Tab.Screen name="Budget" component={BudgetsScreen} />
          <Tab.Screen name="Stats" component={AnalyticsScreen} />
          <Tab.Screen name="Subs" component={SubscriptionsScreen} />
          <Tab.Screen name="Goals" component={GoalsScreen} />
          <Tab.Screen name="Me" component={MeScreen} />
        </Tab.Navigator>

        {/* Floating Add Button */}
        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: c.accent, borderRadius: r.full }]}
          color="#fff"
          onPress={() => setModalVisible(true)}
        />

        {/* Centered Add Expense Modal */}
        <AddExpenseModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
        />
      </View>
    </NavigationContainer>
  );
}

/* -------------------- Styles -------------------- */
const styles = StyleSheet.create({
  header: {
    width: "100%",
  },
  topRightMenu: {
    position: "absolute",
    right: 14,
    top: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 6 : 50,
  },
  menuFab: {
    borderRadius: 999,
    elevation: 2,
  },
  fab: {
    position: "absolute",
    bottom: 70,
    right: 20,
    borderRadius: 999,
    elevation: 10,
  },
});