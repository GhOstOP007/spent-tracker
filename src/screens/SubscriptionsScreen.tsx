import React, { useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  Modal,
  Portal,
  Text,
  TextInput,
} from "react-native-paper";
import { useSubscriptionsStore, type Cadence } from "../store/subscriptionsStore";
import { SpendwiseBackground } from "../ui/SpendwiseBackground";
import { useSpendwiseTheme } from "../ui/spendwiseTokens";

export default function SubscriptionsScreen() {
  const { subscriptions, loadSubscriptions, loading, addSubscription } =
    useSubscriptionsStore();
  const { c, r } = useSpendwiseTheme();

  const [addVisible, setAddVisible] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [cadence, setCadence] = useState<Cadence>("monthly");
  const [billingDay, setBillingDay] = useState("");

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const reset = () => {
    setName("");
    setAmount("");
    setCadence("monthly");
    setBillingDay("");
  };

  const cadenceLabel = useMemo(() => {
    if (cadence === "weekly") return "Weekly";
    if (cadence === "yearly") return "Yearly";
    return "Monthly";
  }, [cadence]);

  const monthlyTotal = useMemo(() => {
    let sum = 0;
    for (const s of subscriptions) {
      if (s.cadence === "monthly") sum += Number(s.amount);
      if (s.cadence === "yearly") sum += Number(s.amount) / 12;
      if (s.cadence === "weekly") sum += (Number(s.amount) * 52) / 12;
    }
    return sum;
  }, [subscriptions]);

  const nextSub = useMemo(() => {
    return subscriptions[0] ?? null;
  }, [subscriptions]);

  return (
    <SpendwiseBackground>
      <View style={{ flex: 1 }}>
        <View style={styles.headerRow}>
          <Text style={{ fontSize: 18, fontWeight: "600", color: c.text }}>
            Subscriptions
          </Text>
          <View
            style={[
              styles.pill,
              {
                borderRadius: r.full,
                backgroundColor: "rgba(255,107,107,0.12)",
                borderColor: "rgba(255,107,107,0.25)",
              },
            ]}
          >
            <Text style={{ fontSize: 10, color: c.danger }}>
              ₹{monthlyTotal.toFixed(0)}/mo
            </Text>
          </View>
        </View>

        {nextSub ? (
          <View style={{ paddingHorizontal: 16 }}>
            <Card style={[styles.glassCard, { borderRadius: r.lg }]}>
              <Card.Content style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View
                  style={{
                    width: 6,
                    height: 36,
                    backgroundColor: c.warning,
                    borderRadius: 3,
                  }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 10, color: c.text2, marginBottom: 2 }}>
                    Next debit coming up
                  </Text>
                  <Text style={{ fontSize: 13, fontWeight: "500", color: c.text }}>
                    {nextSub.name} —{" "}
                    <Text style={{ color: c.warning }}>₹{Number(nextSub.amount).toFixed(0)}</Text>
                  </Text>
                </View>
              </Card.Content>
            </Card>
          </View>
        ) : null}

        <Text style={[styles.secTitle, { color: c.text2 }]}>Active</Text>

        <FlatList
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 140 }}
          data={subscriptions}
          keyExtractor={(s) => s.id}
          ListEmptyComponent={
            <Card style={[styles.card, { borderRadius: r.lg }]}>
              <Card.Content>
                <Text style={{ color: c.text }}>
                  No subscriptions yet. Add Spotify/Netflix-like recurring items here.
                </Text>
              </Card.Content>
            </Card>
          }
          renderItem={({ item }) => (
            <View
              style={[
                styles.subCard,
                { borderRadius: r.md, backgroundColor: c.card, borderColor: c.border },
              ]}
            >
              <View
                style={[
                  styles.subLogo,
                  { borderRadius: r.sm, backgroundColor: "rgba(108,99,255,0.12)" },
                ]}
              >
                <Text style={{ fontSize: 18, color: c.text }}>
                  {item.name.slice(0, 1).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: "500", color: c.text }}>
                  {item.name}
                </Text>
                <View
                  style={[
                    styles.autoBadge,
                    {
                      borderRadius: r.full,
                      backgroundColor: "rgba(255,179,71,0.12)",
                      borderColor: "rgba(255,179,71,0.3)",
                    },
                  ]}
                >
                  <Text style={{ fontSize: 9, color: c.warning }}>
                    Next {new Date(item.next_due_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: c.text }}>
                  ₹{Number(item.amount).toFixed(0)}
                </Text>
                <Text style={{ fontSize: 10, color: c.text2 }}>{item.cadence}</Text>
              </View>
            </View>
          )}
          ListFooterComponent={
            <View style={{ marginTop: 6 }}>
              <View
                style={[
                  styles.addDashed,
                  { borderRadius: r.md, borderColor: "rgba(108,99,255,0.25)" },
                ]}
              >
                <Text style={{ fontSize: 12, color: c.accent }} onPress={() => setAddVisible(true)}>
                  + Add Subscription
                </Text>
              </View>
            </View>
          }
        />
      </View>

      <Portal>
        <Modal
          visible={addVisible}
          onDismiss={() => {
            setAddVisible(false);
            reset();
          }}
          contentContainerStyle={{
            margin: 20,
            padding: 16,
            borderRadius: 18,
            backgroundColor: c.card,
          }}
        >
          <Text variant="titleLarge" style={{ color: c.text }}>
            New subscription
          </Text>
          <View style={{ height: 10 }} />
          <TextInput mode="outlined" label="Name" value={name} onChangeText={setName} />
          <View style={{ height: 10 }} />
          <TextInput
            mode="outlined"
            label="Amount"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
          <View style={{ height: 10 }} />
          <TextInput
            mode="outlined"
            label={`Cadence (tap to cycle): ${cadenceLabel}`}
            value={cadenceLabel}
            editable={false}
            right={
              <TextInput.Icon
                icon="swap-horizontal"
                onPress={() =>
                  setCadence((c) => (c === "monthly" ? "weekly" : c === "weekly" ? "yearly" : "monthly"))
                }
              />
            }
          />
          <View style={{ height: 10 }} />
          <TextInput
            mode="outlined"
            label="Billing day (1-31, monthly/yearly)"
            keyboardType="numeric"
            value={billingDay}
            onChangeText={setBillingDay}
          />
          <View style={{ height: 12 }} />
          <Button
            mode="contained"
            loading={loading}
            disabled={loading || !name.trim() || !(Number(amount) > 0)}
            onPress={async () => {
              await addSubscription({
                name: name.trim(),
                amount: Number(amount),
                cadence,
                billing_day: billingDay ? Number(billingDay) : null,
              });
              setAddVisible(false);
              reset();
            }}
            buttonColor={c.accent}
            textColor="#fff"
          >
            Create
          </Button>
        </Modal>
      </Portal>
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
  pill: { paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1 },
  secTitle: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 1,
    textTransform: "uppercase",
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  glassCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  card: { borderWidth: 1 },
  subCard: {
    padding: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  subLogo: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  autoBadge: { marginTop: 3, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1 },
  addDashed: {
    backgroundColor: "rgba(108,99,255,0.06)",
    borderWidth: 1,
    borderStyle: "dashed",
    padding: 14,
    alignItems: "center",
  },
});

