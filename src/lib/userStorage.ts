import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabase";

let activeUserId: string | null = null;

export function setActiveStorageUser(userId: string | null) {
  activeUserId = userId;
}

function localKey(key: string) {
  return activeUserId ? `@butce_user_${activeUserId}_${key}` : null;
}

const userStorage = {
  async getItem(key: string) {
    const userId = activeUserId;
    const scopedKey = localKey(key);
    if (!scopedKey || !userId) return null;

    const cached = await AsyncStorage.getItem(scopedKey);
    if (activeUserId !== userId) return null;
    const { data, error } = await supabase
      .from("user_storage")
      .select("value")
      .eq("user_id", userId)
      .eq("storage_key", key)
      .maybeSingle();

    if (!error && data?.value) {
      await AsyncStorage.setItem(scopedKey, data.value);
      return data.value;
    }

    return cached;
  },

  async setItem(key: string, value: string) {
    const userId = activeUserId;
    const scopedKey = localKey(key);
    if (!scopedKey || !userId) return;

    await AsyncStorage.setItem(scopedKey, value);
    if (activeUserId !== userId) return;
    const { error } = await supabase.from("user_storage").upsert(
      { user_id: userId, storage_key: key, value, updated_at: new Date().toISOString() },
      { onConflict: "user_id,storage_key" }
    );
    if (error) throw error;
  },
};

export default userStorage;
