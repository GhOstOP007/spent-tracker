import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Modal, Button, Chip } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useExpenseStore } from "../store/expenseStore";
import { useThemeStore } from "../store/themeStore";
import { LightTheme, DarkTheme, AmoledTheme } from "../theme/theme";

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
}

const categories = ["Food", "Transport", "Shopping", "Bills", "Others"];

export default function AddExpenseModal({
  visible,
  onClose,
}: AddExpenseModalProps) {
  const { addExpense } = useExpenseStore();
  const { theme } = useThemeStore();

  const selectedTheme =
    theme === "light" ? LightTheme : theme === "dark" ? DarkTheme : AmoledTheme;

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSave = () => {
    if (!title || !amount || !category) {
      alert("Please fill all fields");
      return;
    }

    addExpense({
      title,
      amount: parseFloat(amount),
      category,
    });

    // Reset fields
    setTitle("");
    setAmount("");
    setCategory("");
    setDate(new Date());

    onClose();
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios"); // Keep open on iOS
    if (selectedDate) setDate(selectedDate);
  };

  return (
    <Modal
      visible={visible}
      onDismiss={onClose}
      contentContainerStyle={[
        styles.modal,
        { backgroundColor: selectedTheme.colors.surface },
      ]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Text style={[styles.label, { color: selectedTheme.colors.text }]}>
          Title
        </Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Enter expense title"
          placeholderTextColor={selectedTheme.colors.outline}
          style={[
            styles.input,
            {
              color: selectedTheme.colors.text,
              borderColor: selectedTheme.colors.outline,
            },
          ]}
        />

        <Text style={[styles.label, { color: selectedTheme.colors.text }]}>
          Amount
        </Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          placeholder="Enter amount"
          placeholderTextColor={selectedTheme.colors.outline}
          keyboardType="numeric"
          style={[
            styles.input,
            {
              color: selectedTheme.colors.text,
              borderColor: selectedTheme.colors.outline,
            },
          ]}
        />

        <Text style={[styles.label, { color: selectedTheme.colors.text }]}>
          Category
        </Text>
        <View style={styles.categoryContainer}>
          {categories.map((cat) => (
            <Chip
              key={cat}
              selected={category === cat}
              onPress={() => setCategory(cat)}
              style={[
                styles.chip,
                {
                  backgroundColor:
                    category === cat
                      ? selectedTheme.colors.primary
                      : selectedTheme.colors.surface,
                },
              ]}
              textStyle={{
                color: category === cat ? "#fff" : selectedTheme.colors.text,
              }}
            >
              {cat}
            </Chip>
          ))}
        </View>

        <Text
          style={[
            styles.label,
            { color: selectedTheme.colors.text, marginTop: 10 },
          ]}
        >
          Date
        </Text>
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={[
            styles.dateButton,
            { borderColor: selectedTheme.colors.outline },
          ]}
        >
          <Text style={{ color: selectedTheme.colors.text }}>
            {date.toDateString()}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}

        <Button
          mode="contained"
          onPress={handleSave}
          style={{
            marginTop: 20,
            backgroundColor: selectedTheme.colors.primary,
          }}
        >
          Add Expense
        </Button>

        <Button
          mode="text"
          onPress={onClose}
          style={{ marginTop: 10 }}
          textColor={selectedTheme.colors.text}
        >
          Cancel
        </Button>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 20,
    borderRadius: 15,
    padding: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  dateButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
});
