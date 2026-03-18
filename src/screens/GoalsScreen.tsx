import React, { useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Button, Card, Modal, Portal, Text, TextInput } from "react-native-paper";
import { useGoalsStore } from "../store/goalsStore";
import { SpendwiseBackground } from "../ui/SpendwiseBackground";
import { useSpendwiseTheme } from "../ui/spendwiseTokens";

export default function GoalsScreen() {
  const { goals, loadGoals, addGoal, addContribution, loading } = useGoalsStore();
  const { c, r } = useSpendwiseTheme();

  const [addVisible, setAddVisible] = useState(false);
  const [contribGoalId, setContribGoalId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [contribAmount, setContribAmount] = useState("");
  const [contribNote, setContribNote] = useState("");

  useEffect(() => {
    loadGoals();
  }, []);

  const goalById = useMemo(() => new Map(goals.map((g) => [g.id, g])), [goals]);

  const resetAdd = () => {
    setName("");
    setTarget("");
  };

  return (
    <SpendwiseBackground>
      <View style={{ flex: 1 }}>
        <View style={styles.headerRow}>
          <Text style={{ fontSize: 18, fontWeight: "600", color: c.text }}>
            My Goals
          </Text>
          <View
            style={[
              styles.pill,
              {
                borderRadius: r.full,
                backgroundColor: "rgba(0,212,170,0.12)",
                borderColor: "rgba(0,212,170,0.25)",
              },
            ]}
          >
            <Text style={{ fontSize: 10, color: c.accent2 }}>
              {goals.length} Active
            </Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 16, marginBottom: 10 }}>
          <Button mode="contained" buttonColor={c.accent} textColor="#fff" onPress={() => setAddVisible(true)}>
            + Create New Goal
          </Button>
        </View>
      <FlatList
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 140 }}
        data={goals}
        keyExtractor={(g) => g.id}
        ListEmptyComponent={
          <Card style={{ backgroundColor: c.card, borderRadius: r.lg, borderWidth: 1, borderColor: c.border }}>
            <Card.Content>
              <Text style={{ color: c.text }}>
                No goals yet. Create one to start saving.
              </Text>
            </Card.Content>
          </Card>
        }
        renderItem={({ item }) => {
          const progress =
            item.target_amount > 0 ? item.current_amount / item.target_amount : 0;
          const borderColor = c.accent;
          return (
            <View
              style={[
                styles.goalCard,
                {
                  borderRadius: r.lg,
                  backgroundColor: c.card,
                  borderColor: c.border,
                  borderLeftColor: borderColor,
                },
              ]}
            >
              <Card.Content>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <Text style={{ fontSize: 24 }}>🎯</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: "500", color: c.text }}>
                      {item.name}
                    </Text>
                    <Text style={{ fontSize: 10, color: c.text2, marginTop: 2 }}>
                      Target: ₹{item.target_amount.toFixed(0)}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={{ fontSize: 13, fontWeight: "600", color: c.accent }}>
                      ₹{item.current_amount.toFixed(0)}
                    </Text>
                    <Text style={{ fontSize: 10, color: c.text2 }}>saved</Text>
                  </View>
                </View>
                <View style={{ height: 10 }} />
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min(Math.max(progress, 0), 1) * 100}%`,
                        backgroundColor: c.accent,
                      },
                    ]}
                  />
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
                  <Text style={{ fontSize: 10, color: c.text2 }}>
                    {(progress * 100).toFixed(0)}% done
                  </Text>
                  <Button
                    compact
                    mode="text"
                    onPress={() => {
                      setContribGoalId(item.id);
                      setContribAmount("");
                      setContribNote("");
                    }}
                    textColor={c.accent}
                  >
                    + Add
                  </Button>
                </View>
              </Card.Content>
            </View>
          );
        }}
        ListFooterComponent={
          <View style={{ marginTop: 4 }}>
            <Card style={[styles.glassCard, { borderRadius: r.lg }]}>
              <Card.Content>
                <Text style={{ fontSize: 11, color: c.text2, marginBottom: 8 }}>
                  Monthly savings allocation
                </Text>
                {goals.slice(0, 3).map((g, idx) => (
                  <View key={g.id} style={styles.allocRow}>
                    <View
                      style={[
                        styles.allocDot,
                        {
                          backgroundColor:
                            [c.accent, c.accent2, c.warning][idx % 3],
                        },
                      ]}
                    />
                    <Text style={{ flex: 1, fontSize: 11, color: c.text }}>
                      {g.name}
                    </Text>
                    <Text style={{ fontSize: 11, fontWeight: "500", color: c.text }}>
                      ₹0
                    </Text>
                  </View>
                ))}
              </Card.Content>
            </Card>
          </View>
        }
      />

      <Portal>
        <Modal
          visible={addVisible}
          onDismiss={() => {
            setAddVisible(false);
            resetAdd();
          }}
          contentContainerStyle={{
            margin: 20,
            padding: 16,
            borderRadius: 18,
            backgroundColor: c.card,
          }}
        >
          <Text variant="titleLarge" style={{ color: c.text }}>
            New goal
          </Text>
          <View style={{ height: 10 }} />
          <TextInput mode="outlined" label="Name" value={name} onChangeText={setName} />
          <View style={{ height: 10 }} />
          <TextInput
            mode="outlined"
            label="Target amount"
            keyboardType="numeric"
            value={target}
            onChangeText={setTarget}
          />
          <View style={{ height: 12 }} />
          <Button
            mode="contained"
            loading={loading}
            disabled={loading || !name.trim() || !(Number(target) > 0)}
            onPress={async () => {
              await addGoal({ name: name.trim(), target_amount: Number(target) });
              setAddVisible(false);
              resetAdd();
            }}
            buttonColor={c.accent}
            textColor="#fff"
          >
            Create
          </Button>
        </Modal>

        <Modal
          visible={!!contribGoalId}
          onDismiss={() => setContribGoalId(null)}
          contentContainerStyle={{
            margin: 20,
            padding: 16,
            borderRadius: 18,
            backgroundColor: c.card,
          }}
        >
          <Text variant="titleLarge" style={{ color: c.text }}>
            Add contribution
          </Text>
          <Text style={{ color: c.text2, marginTop: 4 }}>
            {contribGoalId ? goalById.get(contribGoalId)?.name : ""}
          </Text>
          <View style={{ height: 10 }} />
          <TextInput
            mode="outlined"
            label="Amount"
            keyboardType="numeric"
            value={contribAmount}
            onChangeText={setContribAmount}
          />
          <View style={{ height: 10 }} />
          <TextInput
            mode="outlined"
            label="Note (optional)"
            value={contribNote}
            onChangeText={setContribNote}
          />
          <View style={{ height: 12 }} />
          <Button
            mode="contained"
            loading={loading}
            disabled={loading || !(Number(contribAmount) > 0) || !contribGoalId}
            onPress={async () => {
              if (!contribGoalId) return;
              await addContribution({
                goal_id: contribGoalId,
                amount: Number(contribAmount),
                note: contribNote.trim() ? contribNote.trim() : undefined,
              });
              setContribGoalId(null);
            }}
            buttonColor={c.accent}
            textColor="#fff"
          >
            Save
          </Button>
        </Modal>
      </Portal>
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
  pill: { paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1 },
  goalCard: {
    borderWidth: 1,
    borderLeftWidth: 3,
    marginBottom: 10,
  },
  progressTrack: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    height: 6,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 999 },
  glassCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  allocRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  allocDot: { width: 6, height: 6, borderRadius: 999 },
});

