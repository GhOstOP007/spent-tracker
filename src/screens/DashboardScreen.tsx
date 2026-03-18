import React, { useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
} from "react-native";
import { Card } from "react-native-paper";
import { useExpenseStore } from "../store/expenseStore";
import { useCategoryStore } from "../store/categoryStore";
import {
  SafeAreaView,
} from "react-native-safe-area-context";
import { SpendwiseBackground } from "../ui/SpendwiseBackground";
import { useSpendwiseTheme } from "../ui/spendwiseTokens";

const screenWidth = Dimensions.get("window").width;

export default function DashboardScreen() {
  const { transactions, loadMonth } = useExpenseStore();
  const { categories, loadCategories } = useCategoryStore();
  const { c, r } = useSpendwiseTheme();

  useEffect(() => {
    loadCategories();
    loadMonth();
  }, []);

  const totalSpent = useMemo(
    () => transactions.reduce((sum, e) => sum + Number(e.amount), 0),
    [transactions],
  );

  const monthlyBudget = 30000; // will be wired to budgets screen value later

  const budgetProgress = monthlyBudget > 0 ? totalSpent / monthlyBudget : 0;
  const left = Math.max(monthlyBudget - totalSpent, 0);

  const catById = useMemo(
    () => new Map(categories.map((cc) => [cc.id, cc])),
    [categories],
  );

  const ListHeader = () => (
    <>
      {/* Header */}
      <View style={{ paddingHorizontal: 18, paddingTop: 6, paddingBottom: 8 }}>
        <Text style={{ fontSize: 11, color: c.text2 }}>Good morning,</Text>
        <Text style={{ fontSize: 18, fontWeight: "600", color: c.text }}>
          Rahul
        </Text>
      </View>

      {/* Hero budget card */}
      <View style={{ paddingHorizontal: 16 }}>
        <View style={[styles.heroCard, { borderRadius: r.xl }]}>
          <Text style={styles.heroEyebrow}>MARCH BUDGET</Text>
          <Text style={styles.heroAmount}>₹{totalSpent.toFixed(0)}</Text>
          <Text style={styles.heroSub}>of ₹{monthlyBudget.toFixed(0)} spent</Text>
          <View style={[styles.progressTrack]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(Math.max(budgetProgress, 0), 1) * 100}%`,
                },
              ]}
            />
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
            <Text style={styles.heroMeta}>{(budgetProgress * 100).toFixed(0)}% used</Text>
            <Text style={[styles.heroMeta, { color: "#00D4AA" }]}>
              ₹{left.toFixed(0)} left
            </Text>
          </View>
        </View>
      </View>

      {/* Quick stats (placeholder values for now) */}
      <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 16, marginTop: 10 }}>
        <Card style={[styles.glassCard, { borderRadius: r.lg, flex: 1 }]}>
          <Card.Content style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 10, color: c.text2, marginBottom: 4 }}>Today</Text>
            <Text style={{ fontSize: 15, fontWeight: "600", color: c.accent }}>₹0</Text>
          </Card.Content>
        </Card>
        <Card style={[styles.glassCard, { borderRadius: r.lg, flex: 1 }]}>
          <Card.Content style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 10, color: c.text2, marginBottom: 4 }}>Subs</Text>
            <Text style={{ fontSize: 15, fontWeight: "600", color: c.warning }}>₹0</Text>
          </Card.Content>
        </Card>
        <Card style={[styles.glassCard, { borderRadius: r.lg, flex: 1 }]}>
          <Card.Content style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 10, color: c.text2, marginBottom: 4 }}>Goals</Text>
            <Text style={{ fontSize: 15, fontWeight: "600", color: c.accent2 }}>0</Text>
          </Card.Content>
        </Card>
      </View>

      <Text style={[styles.secTitle, { color: c.text2 }]}>Recent</Text>
    </>
  );

  return (
    <SpendwiseBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <FlatList
          style={{ flex: 1 }}
          data={transactions.slice(0, 5)}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={{ paddingBottom: 140 }}
          renderItem={({ item }) => {
            const cat = item.category_id ? catById.get(item.category_id) : undefined;
            const title = item.note?.trim() || cat?.name || "Expense";
            const amount = Number(item.amount);
            return (
              <View style={[styles.txRow, { borderBottomColor: c.border }]}>
                <View
                  style={[
                    styles.txIcon,
                    { backgroundColor: "rgba(255,107,107,0.12)" },
                  ]}
                >
                  <Text style={{ fontSize: 16 }}>💳</Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ fontSize: 13, fontWeight: "500", color: c.text }}>
                    {title}
                  </Text>
                  <Text style={{ fontSize: 11, color: c.text2, marginTop: 2 }}>
                    {cat?.name ?? "Uncategorized"}
                  </Text>
                </View>
                <Text style={{ fontSize: 13, fontWeight: "600", color: c.danger }}>
                  -₹{amount.toFixed(0)}
                </Text>
              </View>
            );
          }}
        />
      </SafeAreaView>
    </SpendwiseBackground>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: "#0d0d0d",
    borderWidth: 1,
    borderColor: "rgba(108,99,255,0.25)",
    padding: 20,
    overflow: "hidden",
  },
  heroEyebrow: {
    fontSize: 10,
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 1,
    marginBottom: 4,
  },
  heroAmount: { fontSize: 28, fontWeight: "700", color: "#fff", marginBottom: 2 },
  heroSub: { fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 14 },
  progressTrack: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    height: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#6C63FF",
  },
  heroMeta: { fontSize: 10, color: "rgba(255,255,255,0.4)" },
  glassCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  secTitle: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 1,
    textTransform: "uppercase",
    paddingHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
  },
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  txIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  transaction: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
});
