import { create } from "zustand";
import { supabase } from "../supabase";
import { v4 as uuidv4 } from "uuid"; // <-- import uuid

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
}

interface ExpenseState {
  expenses: Expense[];
  loadExpenses: () => Promise<void>;
  addExpense: (expense: Omit<Expense, "id" | "date">) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  expenses: [],

  loadExpenses: async () => {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      if (data) set({ expenses: data });
    } catch (err) {
      console.error("Failed to load expenses", err);
    }
  },

  addExpense: async (expense) => {
    try {
      const newExpense: Expense = {
        id: uuidv4(), // <-- generate proper UUID
        ...expense,
        date: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("expenses")
        .insert([newExpense])
        .select();

      if (error) throw error;
      if (data && data.length > 0) {
        set({ expenses: [data[0], ...get().expenses] });
      }
    } catch (err) {
      console.error("Failed to save expense", err);
    }
  },

  deleteExpense: async (id) => {
    try {
      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (error) throw error;
      set({ expenses: get().expenses.filter((e) => e.id !== id) });
    } catch (err) {
      console.error("Failed to delete expense", err);
    }
  },
}));
