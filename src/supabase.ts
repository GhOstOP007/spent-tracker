import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";

const SUPABASE_STORAGE_KEY_PREFIX = "spent-tracker.supabase.";

const secureStorage = {
  getItem: async (key: string) => {
    return await SecureStore.getItemAsync(SUPABASE_STORAGE_KEY_PREFIX + key);
  },
  setItem: async (key: string, value: string) => {
    await SecureStore.setItemAsync(SUPABASE_STORAGE_KEY_PREFIX + key, value);
  },
  removeItem: async (key: string) => {
    await SecureStore.deleteItemAsync(SUPABASE_STORAGE_KEY_PREFIX + key);
  },
};

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: secureStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
