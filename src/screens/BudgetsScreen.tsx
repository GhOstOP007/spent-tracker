import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Card, Text, TextInput } from "react-native-paper";
import { useBudgetStore } from "../store/budgetStore";
import { useExpenseStore } from "../store/expenseStore";
import { SpendwiseBackground } from "../ui/SpendwiseBackground";
import { useSpendwiseTheme } from "../ui/spendwiseTokens";

export default function BudgetsScreen() {
  const { overallLimit, loadOverallBudget, setOverallBudget, loading } =
    useBudgetStore();
  const { transactions, loadMonth } = useExpenseStore();
  const { c, r } = useSpendwiseTheme();

  const [limitText, setLimitText] = useState("");

  useEffect(() => {
    loadOverallBudget();
    loadMonth();
  }, []);

  useEffect(() => {
    if (overallLimit != null) setLimitText(String(overallLimit));
  }, [overallLimit]);

  const spent = useMemo(
    () => transactions.reduce((sum, t) => sum + Number(t.amount), 0),
    [transactions],
  );

  const limit = Number(limitText || 0);
  const progress = limit > 0 ? Math.min(spent / limit, 1) : 0;

  return (
    <SpendwiseBackground>
      <View style={{ flex: 1 }}>
        <View style={styles.headerRow}>
          <Text style={{ fontSize: 18, fontWeight: "600", color: c.text }}>
            Budget
          </Text>
          <View
            style={[
              styles.monthBadge,
              { borderRadius: r.full, backgroundColor: "rgba(255,255,255,0.08)" },
            ]}
          >
            <Text style={{ fontSize: 11, color: c.text2 }}>This month</Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 16 }}>
          <View style={[styles.heroCard, { borderRadius: r.xl }]}>
            <Text style={styles.heroEyebrow}>MONTHLY BUDGET</Text>
            <Text style={styles.heroAmount}>₹{spent.toFixed(0)}</Text>
            <Text style={styles.heroSub}>
              of ₹{(overallLimit ?? limit ?? 0).toFixed(0)} spent
            </Text>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress * 100}%` },
                ]}
              />
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
              <Text style={styles.heroMeta}>{(progress * 100).toFixed(0)}% used</Text>
              <Text style={[styles.heroMeta, { color: "#00D4AA" }]}>
                ₹{Math.max((overallLimit ?? limit) - spent, 0).toFixed(0)} left
              </Text>
            </View>
          </View>
        </View>

        <Text style={[styles.secTitle, { color: c.text2 }]}>Set limit</Text>
        <View style={{ paddingHorizontal: 16 }}>
          <Card style={[styles.glassCard, { borderRadius: r.lg }]}>
            <Card.Content>
              <TextInput
                mode="outlined"
                label="Budget limit"
                keyboardType="numeric"
                value={limitText}
                onChangeText={setLimitText}
              />
              <View style={{ height: 10 }} />
              <Button
                mode="contained"
                buttonColor={c.accent}
                textColor="#fff"
                loading={loading}
                disabled={loading || !(limit > 0)}
                onPress={() => setOverallBudget(limit)}
              >
                Save budget
              </Button>
            </Card.Content>
          </Card>
        </View>
      </View>
    </SpendwiseBackground>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  monthBadge: { paddingHorizontal: 14, paddingVertical: 4 },
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
  secTitle: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 1,
    textTransform: "uppercase",
    paddingHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
  },
  glassCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
});
