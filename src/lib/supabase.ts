import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error("Supabase bağlantı ayarları bulunamadı.");
}

export const supabase = createClient(url, key, {
  auth: {
    autoRefreshToken: true,
    // Remember only the email address. A fresh app launch requires a password.
    persistSession: false,
    detectSessionInUrl: false,
    flowType: "implicit",
  },
});
