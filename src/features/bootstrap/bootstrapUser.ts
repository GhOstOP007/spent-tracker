import { supabase } from "../../supabase";

const DEFAULT_CATEGORIES: Array<{ name: string; icon: string; color: string }> = [
  { name: "Food", icon: "food", color: "#FF6384" },
  { name: "Transport", icon: "train-car", color: "#36A2EB" },
  { name: "Shopping", icon: "shopping", color: "#9966FF" },
  { name: "Bills", icon: "file-document", color: "#FFCE56" },
  { name: "Entertainment", icon: "movie-open", color: "#4BC0C0" },
  { name: "Others", icon: "dots-horizontal", color: "#9E9E9E" },
];

export async function bootstrapUser() {
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;
  const userId = userData.user?.id;
  if (!userId) return;

  // Ensure profile exists
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();
  if (!profile) {
    const { error } = await supabase.from("profiles").insert([{ id: userId }]);
    if (error) throw error;
  }

  // Seed categories (idempotent via unique (user_id,name))
  const { data: existing } = await supabase
    .from("categories")
    .select("name")
    .eq("user_id", userId);

  const existingNames = new Set((existing ?? []).map((c) => c.name));
  const missing = DEFAULT_CATEGORIES.filter((c) => !existingNames.has(c.name));
  if (missing.length) {
    const { error } = await supabase
      .from("categories")
      .insert(missing.map((c) => ({ user_id: userId, ...c })));
    if (error) throw error;
  }
}

