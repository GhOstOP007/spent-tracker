import { create } from "zustand";
import { supabase } from "../supabase";

export interface MonthlyBudgetRow {
  id: string;
  user_id: string;
  month: string; // date (YYYY-MM-01)
  category_id: string | null;
  limit_amount: number;
}

function monthKey(d: Date) {
  const m = new Date(d.getFullYear(), d.getMonth(), 1);
  return m.toISOString().slice(0, 10);
}

interface BudgetState {
  month: Date;
  overallLimit: number | null;
  loading: boolean;
  setMonth: (m: Date) => void;
  loadOverallBudget: () => Promise<void>;
  setOverallBudget: (limitAmount: number) => Promise<void>;
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  month: new Date(),
  overallLimit: null,
  loading: false,
  setMonth: (month) => set({ month }),

  loadOverallBudget: async () => {
    const month = monthKey(get().month);
    try {
      set({ loading: true });
      const { data, error } = await supabase
        .from("monthly_budgets")
        .select("*")
        .eq("month", month)
        .is("category_id", null)
        .maybeSingle();
      if (error) throw error;
      set({ overallLimit: data ? Number((data as any).limit_amount) : null });
    } catch (e) {
      console.warn("Failed to load overall budget", e);
      set({ overallLimit: null });
    } finally {
      set({ loading: false });
    }
  },

  setOverallBudget: async (limitAmount) => {
    const month = monthKey(get().month);
    try {
      set({ loading: true });
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      const userId = userData.user?.id;
      if (!userId) throw new Error("Not logged in");

      // Upsert by unique (user_id, month, category_id)
      const { error } = await supabase.from("monthly_budgets").upsert(
        [
          {
            user_id: userId,
            month,
            category_id: null,
            limit_amount: limitAmount,
          },
        ],
        { onConflict: "user_id,month,category_id" },
      );
      if (error) throw error;
      set({ overallLimit: limitAmount });
    } catch (e) {
      console.warn("Failed to set budget", e);
    } finally {
      set({ loading: false });
    }
  },
}));

