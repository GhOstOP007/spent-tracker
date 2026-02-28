import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Button } from "react-native-paper";
import { useExpenseStore } from "../store/expenseStore";

interface Props {
  bottomSheetRef: React.RefObject<BottomSheetModal>;
  snapPoints: string[];
}

export default function AddExpenseSheet({ bottomSheetRef, snapPoints }: Props) {
  const addExpense = useExpenseStore((state) => state.addExpense);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");

  const handleAdd = () => {
    if (!title || !amount) return;

    addExpense({
      title,
      amount: Number(amount),
      category: "Other",
    });

    setTitle("");
    setAmount("");
    bottomSheetRef.current?.dismiss();
  };

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
    >
      <View style={styles.container}>
        <Text style={styles.heading}>Add Expense</Text>

        <TextInput
          placeholder="Expense Title"
          style={styles.input}
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          placeholder="Amount"
          style={styles.input}
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        <Button mode="contained" onPress={handleAdd}>
          Save Expense
        </Button>
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  heading: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
  },
});
