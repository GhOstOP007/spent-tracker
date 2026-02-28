import React, { useState } from "react";
import { View, StyleSheet, StatusBar, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer, Theme } from "@react-navigation/native";
import { FAB } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DashboardScreen from "../screens/DashboardScreen";
import { useThemeStore } from "../store/themeStore";
import { LightTheme, DarkTheme, AmoledTheme } from "../theme/theme";
import AddExpenseModal from "../components/AddExpenseModal";

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
  const { theme } = useThemeStore();
  const paperTheme =
    theme === "light" ? LightTheme : theme === "dark" ? DarkTheme : AmoledTheme;

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

  return (
    <NavigationContainer theme={navigationTheme}>
      <View style={{ flex: 1 }}>
        {/* Global Accent Header */}
        <GlobalHeader />

        {/* Tab Navigator */}
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarShowLabel: false,
            tabBarStyle: {
              position: "absolute",
              bottom: 20,
              left: 20,
              right: 20,
              borderRadius: 25,
              height: 70,
              elevation: 10,
              backgroundColor: paperTheme.colors.surface,
              borderTopWidth: 0,
            },
            tabBarIcon: ({ focused }) => {
              let iconName: any;
              if (route.name === "Home") iconName = "view-dashboard";
              if (route.name === "Expenses") iconName = "cash-multiple";
              if (route.name === "Goals") iconName = "target";
              if (route.name === "Subscriptions") iconName = "refresh-circle";

              return (
                <MaterialCommunityIcons
                  name={iconName}
                  size={26}
                  color={
                    focused ? paperTheme.colors.primary : paperTheme.colors.text
                  }
                />
              );
            },
          })}
        >
          <Tab.Screen name="Home" component={DashboardScreen} />
          <Tab.Screen name="Expenses" component={DashboardScreen} />
          <Tab.Screen name="Goals" component={DashboardScreen} />
          <Tab.Screen name="Subscriptions" component={DashboardScreen} />
        </Tab.Navigator>

        {/* Floating Add Button */}
        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: paperTheme.colors.primary }]}
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
  fab: {
    position: "absolute",
    bottom: 50,
    alignSelf: "center",
    borderRadius: 30,
  },
});