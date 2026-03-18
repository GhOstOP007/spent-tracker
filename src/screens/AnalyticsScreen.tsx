import React, { useEffect, useMemo } from "react";
import { Dimensions, Platform, StyleSheet, View } from "react-native";
import { Card, Text } from "react-native-paper";
import { VictoryPie } from "victory-native";
import { useExpenseStore } from "../store/expenseStore";
import { useCategoryStore } from "../store/categoryStore";
import { SpendwiseBackground } from "../ui/SpendwiseBackground";
import { useSpendwiseTheme } from "../ui/spendwiseTokens";

const screenWidth = Dimensions.get("window").width;

export default function AnalyticsScreen() {
  const { transactions, loadMonth } = useExpenseStore();
  const { categories, loadCategories } = useCategoryStore();
  const { c, r } = useSpendwiseTheme();

  useEffect(() => {
    loadCategories();
    loadMonth();
  }, []);

  const grouped = useMemo(() => {
    const catById = new Map(categories.map((c) => [c.id, c]));
    const map = new Map<string, number>();
    for (const t of transactions) {
      const cat = t.category_id ? catById.get(t.category_id) : undefined;
      const key = cat?.name ?? "Uncategorized";
      map.set(key, (map.get(key) ?? 0) + Number(t.amount));
    }
    return map;
  }, [transactions, categories]);

  const total = useMemo(() => {
    let s = 0;
    for (const v of grouped.values()) s += v;
    return s;
  }, [grouped]);

  const pieData = useMemo(
    () => Array.from(grouped.entries()).map(([x, y]) => ({ x, y })),
    [grouped],
  );

  return (
    <SpendwiseBackground blobs={false}>
      <View style={{ flex: 1 }}>
        <View style={styles.headerRow}>
          <Text style={{ fontSize: 18, fontWeight: "600", color: c.text }}>
            Spending
          </Text>
          <View
            style={[
              styles.monthBadge,
              { backgroundColor: "rgba(255,255,255,0.08)", borderRadius: r.full },
            ]}
          >
            <Text style={{ fontSize: 11, color: c.text2 }}>This month</Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 16 }}>
          <Card style={[styles.glassCard, { borderRadius: r.lg }]}>
            <Card.Content>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 11, color: c.text2 }}>Total Spent</Text>
                <Text style={{ fontSize: 11, color: c.text2 }}>vs Budget</Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
                <Text style={{ fontSize: 22, fontWeight: "700", color: c.text }}>
                  ₹{total.toFixed(0)}
                </Text>
                <Text style={{ fontSize: 13, fontWeight: "500", color: c.warning }}>
                  —
                </Text>
              </View>
            </Card.Content>
          </Card>
        </View>

        <View style={{ height: 190, marginTop: 8, justifyContent: "center" }}>
          {pieData.length ? (
            <View style={{ alignItems: "center" }}>
              {Platform.OS === "web" ? (
                <View style={styles.webChartFallback}>
                  <Text style={{ color: c.text2, fontSize: 12 }}>
                    Chart preview is disabled on web.
                  </Text>
                  <Text style={{ color: c.text3, fontSize: 10, marginTop: 6 }}>
                    Run on Android to see the donut chart.
                  </Text>
                </View>
              ) : (
                <VictoryPie
                  data={pieData}
                  width={screenWidth}
                  height={190}
                  innerRadius={55}
                  padAngle={2}
                  labels={() => ""}
                  colorScale={[
                    c.accent,
                    c.accent2,
                    c.danger,
                    c.warning,
                    "#A78BFA",
                    "#34D399",
                  ]}
                />
              )}
              <View style={styles.donutCenter}>
                <Text style={{ fontSize: 18, fontWeight: "700", color: c.text }}>
                  ₹{total.toFixed(0)}
                </Text>
                <Text style={{ fontSize: 10, color: c.text2 }}>Total</Text>
              </View>
            </View>
          ) : (
            <View style={{ paddingHorizontal: 16 }}>
              <Text style={{ color: c.text2 }}>Add expenses to see stats.</Text>
            </View>
          )}
        </View>

        {/* Legend */}
        <View style={styles.legendGrid}>
          {Array.from(grouped.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([name, amt], idx) => {
              const color = [
                c.accent,
                c.accent2,
                c.danger,
                c.warning,
                "#A78BFA",
                "#34D399",
              ][idx % 6];
              return (
                <View key={name} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: color }]} />
                  <Text style={{ fontSize: 11, color: c.text2 }}>
                    {name}{" "}
                    <Text style={{ color: c.text, fontWeight: "500" }}>
                      ₹{amt.toFixed(0)}
                    </Text>
                  </Text>
                </View>
              );
            })}
        </View>

        <Text style={[styles.secTitle, { color: c.text2 }]}>Trend</Text>
        <View style={{ paddingHorizontal: 16 }}>
          <View style={styles.trendRow}>
            {["Jan", "Feb", "Mar", "Apr", "May"].map((m, i) => {
              const h = [30, 42, 50, 20, 15][i];
              const active = m === "Mar";
              return (
                <View key={m} style={styles.trendCol}>
                  <View
                    style={[
                      styles.trendBar,
                      {
                        height: h,
                        backgroundColor: active ? c.accent : "rgba(108,99,255,0.25)",
                        borderColor: "rgba(108,99,255,0.3)",
                        borderWidth: active ? 0 : 1,
                      },
                    ]}
                  />
                  <Text style={{ fontSize: 9, color: active ? c.accent : c.text3 }}>
                    {m}
                  </Text>
                </View>
              );
            })}
          </View>
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
  glassCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  donutCenter: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -40 }, { translateY: -22 }],
    alignItems: "center",
    justifyContent: "center",
  },
  legendGrid: {
    paddingHorizontal: 16,
    marginTop: 4,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "50%",
    paddingRight: 12,
    marginBottom: 6,
  },
  legendDot: { width: 8, height: 8, borderRadius: 999 },
  secTitle: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 1,
    textTransform: "uppercase",
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  trendRow: { flexDirection: "row", alignItems: "flex-end", height: 60 },
  trendCol: { flex: 1, alignItems: "center" },
  trendBar: { width: "100%", borderRadius: 4 },
  webChartFallback: {
    width: Math.min(screenWidth - 48, 360),
    height: 160,
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(108,99,255,0.35)",
    backgroundColor: "rgba(108,99,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
});
