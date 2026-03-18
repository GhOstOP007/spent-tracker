import { create } from "zustand";
import { supabase } from "../supabase";

export interface GoalRow {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  target_date: string | null;
  current_amount: number;
  is_archived: boolean;
  created_at: string;
}

export interface GoalContributionRow {
  id: string;
  user_id: string;
  goal_id: string;
  amount: number;
  contributed_at: string;
  note: string | null;
}

interface GoalsState {
  goals: GoalRow[];
  loading: boolean;
  loadGoals: () => Promise<void>;
  addGoal: (input: { name: string; target_amount: number; target_date?: Date }) => Promise<void>;
  addContribution: (input: { goal_id: string; amount: number; note?: string }) => Promise<void>;
}

export const useGoalsStore = create<GoalsState>((set, get) => ({
  goals: [],
  loading: false,

  loadGoals: async () => {
    try {
      set({ loading: true });
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("is_archived", false)
        .order("created_at", { ascending: false });
      if (error) throw error;
      set({ goals: (data ?? []) as GoalRow[] });
    } catch (e) {
      console.warn("Failed to load goals", e);
      set({ goals: [] });
    } finally {
      set({ loading: false });
    }
  },

  addGoal: async ({ name, target_amount, target_date }) => {
    try {
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      const userId = userData.user?.id;
      if (!userId) throw new Error("Not logged in");

      const { data, error } = await supabase
        .from("goals")
        .insert([
          {
            user_id: userId,
            name,
            target_amount,
            target_date: target_date ? target_date.toISOString().slice(0, 10) : null,
          },
        ])
        .select("*")
        .single();
      if (error) throw error;
      set({ goals: [data as GoalRow, ...get().goals] });
    } catch (e) {
      console.warn("Failed to add goal", e);
    }
  },

  addContribution: async ({ goal_id, amount, note }) => {
    try {
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      const userId = userData.user?.id;
      if (!userId) throw new Error("Not logged in");

      const contributed_at = new Date().toISOString();
      const { error } = await supabase.from("goal_contributions").insert([
        { user_id: userId, goal_id, amount, contributed_at, note: note ?? null },
      ]);
      if (error) throw error;

      const goal = get().goals.find((g) => g.id === goal_id);
      const nextAmount = Number(goal?.current_amount ?? 0) + amount;

      set({
        goals: get().goals.map((g) =>
          g.id === goal_id ? { ...g, current_amount: nextAmount } : g,
        ),
      });

      const { error: upErr } = await supabase
        .from("goals")
        .update({ current_amount: nextAmount })
        .eq("id", goal_id);
      if (upErr) throw upErr;
    } catch (e) {
      console.warn("Failed to add contribution", e);
    }
  },
}));

