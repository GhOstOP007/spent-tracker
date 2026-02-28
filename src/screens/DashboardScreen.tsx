import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  StatusBar,
} from "react-native";
import { Card, ProgressBar } from "react-native-paper";
import { PieChart } from "react-native-chart-kit";
import { useExpenseStore } from "../store/expenseStore";
import { useThemeStore } from "../store/themeStore";
import { LightTheme, DarkTheme, AmoledTheme } from "../theme/theme";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const screenWidth = Dimensions.get("window").width;

export default function DashboardScreen() {
  const { expenses } = useExpenseStore();
  const { theme } = useThemeStore();
  const insets = useSafeAreaInsets(); // get device safe area

  const selectedTheme =
    theme === "light" ? LightTheme : theme === "dark" ? DarkTheme : AmoledTheme;

  const totalSpent = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses],
  );

  const monthlyBudget = 30000;

  const pieData = useMemo(() => {
    const grouped: any = {};
    expenses.forEach((e) => {
      if (!grouped[e.category]) grouped[e.category] = 0;
      grouped[e.category] += e.amount;
    });

    const colors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"];

    return Object.keys(grouped).map((key, index) => ({
      name: key,
      amount: grouped[key],
      color: colors[index % colors.length],
      legendFontColor: selectedTheme.colors.text,
      legendFontSize: 12,
    }));
  }, [expenses, theme]);

  const ListHeader = () => (
    <>
      {/* Total Spent */}
      <Card
        style={[styles.card, { backgroundColor: selectedTheme.colors.surface }]}
      >
        <Card.Content>
          <Text style={[styles.label, { color: selectedTheme.colors.text }]}>
            Total Spent
          </Text>
          <Text
            style={[styles.amount, { color: selectedTheme.colors.primary }]}
          >
            ₹ {totalSpent}
          </Text>
        </Card.Content>
      </Card>

      {/* Monthly Budget */}
      <Card
        style={[styles.card, { backgroundColor: selectedTheme.colors.surface }]}
      >
        <Card.Content>
          <Text style={[styles.label, { color: selectedTheme.colors.text }]}>
            Monthly Budget
          </Text>
          <ProgressBar
            progress={totalSpent / monthlyBudget}
            color={selectedTheme.colors.primary}
            style={{ height: 10, borderRadius: 10, marginVertical: 10 }}
          />
          <Text style={{ color: selectedTheme.colors.text }}>
            ₹ {totalSpent} of ₹ {monthlyBudget}
          </Text>
        </Card.Content>
      </Card>

      {/* Pie Chart */}
      {pieData.length > 0 && (
        <Card
          style={[
            styles.card,
            { backgroundColor: selectedTheme.colors.surface },
          ]}
        >
          <Card.Content>
            <Text style={[styles.label, { color: selectedTheme.colors.text }]}>
              Spending by Category
            </Text>
            <PieChart
              data={pieData}
              width={screenWidth - 40}
              height={220}
              chartConfig={{
                backgroundColor: selectedTheme.colors.surface,
                backgroundGradientFrom: selectedTheme.colors.surface,
                backgroundGradientTo: selectedTheme.colors.surface,
                color: () => selectedTheme.colors.primary,
                labelColor: () => selectedTheme.colors.text,
              }}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </Card.Content>
        </Card>
      )}

      <Text
        style={[
          styles.label,
          { color: selectedTheme.colors.text, marginBottom: 10, marginTop: 10 },
        ]}
      >
        Recent Transactions
      </Text>
    </>
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: selectedTheme.colors.background }}
    >
      <FlatList
        style={{ flex: 1 }}
        data={[...expenses].reverse().slice(0, 5)}
        keyExtractor={(item) => item.id || item.title}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
        renderItem={({ item }) => (
          <View style={styles.transaction} key={item.id}>
            <Text style={{ color: selectedTheme.colors.text }}>
              {item.title}
            </Text>
            <Text style={{ color: selectedTheme.colors.primary }}>
              ₹ {item.amount}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 20,
    borderRadius: 20,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  amount: {
    fontSize: 28,
    fontWeight: "bold",
  },
  transaction: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
});
