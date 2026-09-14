import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error("Supabase bağlantı ayarları bulunamadı.");
}

export const supabase = createClient(url, key, {
  auth: {
    storage:
      Platform.OS === "web"
        ? typeof window === "undefined"
          ? undefined
          : window.localStorage
        : AsyncStorage,
    autoRefreshToken: true,
    persistSession: Platform.OS !== "web" || typeof window !== "undefined",
    detectSessionInUrl: Platform.OS === "web",
  },
});
