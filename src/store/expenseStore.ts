import { create } from "zustand";
import { supabase } from "../supabase";

export type TransactionType = "expense" | "income";

export interface TransactionRow {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  category_id: string | null;
  account_id: string | null;
  occurred_at: string;
  note: string | null;
  created_at: string;
}

function monthRange(d: Date) {
  const start = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 1, 0, 0, 0, 0);
  return { start: start.toISOString(), end: end.toISOString() };
}

interface TransactionsState {
  month: Date;
  transactions: TransactionRow[];
  loading: boolean;
  setMonth: (month: Date) => void;
  loadMonth: () => Promise<void>;
  addExpense: (input: {
    amount: number;
    category_id: string | null;
    occurred_at: Date;
    note?: string;
  }) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

export const useExpenseStore = create<TransactionsState>((set, get) => ({
  month: new Date(),
  transactions: [],
  loading: false,

  setMonth: (month) => set({ month }),

  loadMonth: async () => {
    const { month } = get();
    const { start, end } = monthRange(month);
    try {
      set({ loading: true });
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("type", "expense")
        .gte("occurred_at", start)
        .lt("occurred_at", end)
        .order("occurred_at", { ascending: false });
      if (error) throw error;
      set({ transactions: (data ?? []) as TransactionRow[] });
    } catch (err) {
      console.error("Failed to load transactions", err);
      set({ transactions: [] });
    } finally {
      set({ loading: false });
    }
  },

  addExpense: async ({ amount, category_id, occurred_at, note }) => {
    try {
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      const userId = userData.user?.id;
      if (!userId) throw new Error("Not logged in");

      const { data, error } = await supabase
        .from("transactions")
        .insert([
          {
            user_id: userId,
            type: "expense",
            amount,
            category_id,
            occurred_at: occurred_at.toISOString(),
            note: note?.trim() ? note.trim() : null,
          },
        ])
        .select("*")
        .single();
      if (error) throw error;
      set({ transactions: [data as TransactionRow, ...get().transactions] });
    } catch (err) {
      console.error("Failed to add expense", err);
    }
  },

  deleteTransaction: async (id) => {
    try {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) throw error;
      set({ transactions: get().transactions.filter((t) => t.id !== id) });
    } catch (err) {
      console.error("Failed to delete transaction", err);
    }
  },
}));
