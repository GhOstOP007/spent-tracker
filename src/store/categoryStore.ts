import { create } from "zustand";
import { supabase } from "../supabase";

export interface CategoryRow {
  id: string;
  user_id: string;
  name: string;
  icon: string | null;
  color: string | null;
  is_archived: boolean;
  created_at: string;
}

interface CategoryState {
  categories: CategoryRow[];
  loading: boolean;
  loadCategories: () => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [],
  loading: false,
  loadCategories: async () => {
    try {
      set({ loading: true });
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_archived", false)
        .order("name");
      if (error) throw error;
      set({ categories: (data ?? []) as CategoryRow[] });
    } catch (e) {
      console.warn("Failed to load categories", e);
      set({ categories: [] });
    } finally {
      set({ loading: false });
    }
  },
}));

