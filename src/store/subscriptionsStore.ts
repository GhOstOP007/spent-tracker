import { create } from "zustand";
import { supabase } from "../supabase";

export type Cadence = "weekly" | "monthly" | "yearly";

export interface SubscriptionRow {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  category_id: string | null;
  cadence: Cadence;
  billing_day: number | null;
  next_due_at: string;
  autopay: boolean;
  is_active: boolean;
  created_at: string;
}

export interface SubscriptionOccurrenceRow {
  id: string;
  user_id: string;
  subscription_id: string;
  due_at: string;
  paid_at: string | null;
  amount: number;
}

function computeNextDue({
  cadence,
  billing_day,
  from,
}: {
  cadence: Cadence;
  billing_day: number | null;
  from: Date;
}) {
  const d = new Date(from);
  if (cadence === "weekly") {
    d.setDate(d.getDate() + 7);
    return d;
  }
  if (cadence === "yearly") {
    d.setFullYear(d.getFullYear() + 1);
    return d;
  }
  // monthly
  const year = d.getFullYear();
  const month = d.getMonth();
  const day = billing_day ?? d.getDate();
  const next = new Date(year, month + 1, 1);
  const maxDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
  next.setDate(Math.min(day, maxDay));
  return next;
}

interface SubscriptionsState {
  subscriptions: SubscriptionRow[];
  occurrences: Record<string, SubscriptionOccurrenceRow[]>;
  loading: boolean;
  loadSubscriptions: () => Promise<void>;
  loadOccurrences: (subscriptionId: string) => Promise<void>;
  addSubscription: (input: {
    name: string;
    amount: number;
    cadence: Cadence;
    billing_day?: number | null;
    category_id?: string | null;
  }) => Promise<void>;
  markPaid: (input: { occurrenceId: string; subscriptionId: string }) => Promise<void>;
}

export const useSubscriptionsStore = create<SubscriptionsState>((set, get) => ({
  subscriptions: [],
  occurrences: {},
  loading: false,

  loadSubscriptions: async () => {
    try {
      set({ loading: true });
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("is_active", true)
        .order("next_due_at", { ascending: true });
      if (error) throw error;
      set({ subscriptions: (data ?? []) as SubscriptionRow[] });
    } catch (e) {
      console.warn("Failed to load subscriptions", e);
      set({ subscriptions: [] });
    } finally {
      set({ loading: false });
    }
  },

  loadOccurrences: async (subscriptionId) => {
    try {
      const { data, error } = await supabase
        .from("subscription_occurrences")
        .select("*")
        .eq("subscription_id", subscriptionId)
        .order("due_at", { ascending: false })
        .limit(24);
      if (error) throw error;
      set({
        occurrences: {
          ...get().occurrences,
          [subscriptionId]: (data ?? []) as SubscriptionOccurrenceRow[],
        },
      });
    } catch (e) {
      console.warn("Failed to load occurrences", e);
    }
  },

  addSubscription: async ({ name, amount, cadence, billing_day, category_id }) => {
    try {
      set({ loading: true });
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      const userId = userData.user?.id;
      if (!userId) throw new Error("Not logged in");

      const now = new Date();
      const next_due_at = computeNextDue({ cadence, billing_day: billing_day ?? null, from: now });

      const { data, error } = await supabase
        .from("subscriptions")
        .insert([
          {
            user_id: userId,
            name,
            amount,
            cadence,
            billing_day: billing_day ?? null,
            category_id: category_id ?? null,
            next_due_at: next_due_at.toISOString(),
            autopay: false,
            is_active: true,
          },
        ])
        .select("*")
        .single();
      if (error) throw error;
      set({ subscriptions: [...get().subscriptions, data as SubscriptionRow] });
    } catch (e) {
      console.warn("Failed to add subscription", e);
    } finally {
      set({ loading: false });
    }
  },

  markPaid: async ({ occurrenceId, subscriptionId }) => {
    try {
      const paid_at = new Date().toISOString();
      const { error } = await supabase
        .from("subscription_occurrences")
        .update({ paid_at })
        .eq("id", occurrenceId);
      if (error) throw error;

      // Refresh occurrences for that subscription
      await get().loadOccurrences(subscriptionId);
    } catch (e) {
      console.warn("Failed to mark paid", e);
    }
  },
}));

