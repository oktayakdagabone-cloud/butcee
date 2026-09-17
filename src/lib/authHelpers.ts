import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import { Platform } from "react-native";

export const REMEMBERED_EMAIL_KEY = "@butcee_remembered_email";
export const MIN_PASSWORD_LENGTH = 8;
export const normalizeEmail = (email: string) => email.trim().toLowerCase();
export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export function authRedirectUrl(path: "auth" | "reset-password") {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    // Expo Linking can fall back to its dev server when no native scheme is
    // available. Auth callbacks must always return to the origin serving the
    // deployed web app (Cloudflare Pages, Sites, or a local dev server).
    const basePath = process.env.EXPO_BASE_URL ?? "";
    return `${window.location.origin}${basePath.replace(/\/$/, "")}/${path}`;
  }
  if (Platform.OS === "web" && process.env.NODE_ENV !== "development") {
    const basePath = process.env.EXPO_BASE_URL ?? "";
    return Linking.createURL(`${basePath.replace(/\/$/, "")}/${path}`);
  }
  return Linking.createURL(`/${path}`);
}

export async function readRememberedEmail() {
  return (await AsyncStorage.getItem(REMEMBERED_EMAIL_KEY)) ?? "";
}

export async function rememberEmail(email: string, remember: boolean) {
  if (remember) await AsyncStorage.setItem(REMEMBERED_EMAIL_KEY, normalizeEmail(email));
  else await AsyncStorage.removeItem(REMEMBERED_EMAIL_KEY);
}

export async function removeLegacySession() {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  if (!url) return;
  const key = `sb-${new URL(url).hostname.split(".")[0]}-auth-token`;
  await AsyncStorage.multiRemove([key, `${key}-code-verifier`, `${key}-user`]);
}

export type AuthCallback =
  | { kind: "recovery"; access_token: string; refresh_token: string }
  | { kind: "confirmed" }
  | { kind: "invalid" };

export function parseAuthCallback(url: string): AuthCallback | null {
  try {
    const parsed = new URL(url);
    const params = new URLSearchParams(parsed.hash.slice(1));
    parsed.searchParams.forEach((value, key) => params.set(key, value));
    const isReset = /(?:^|\/)reset-password\/?$/.test(parsed.pathname) || parsed.hostname === "reset-password";
    if (params.has("error") || params.has("error_code")) return { kind: "invalid" };
    const type = params.get("type");
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    if (type === "recovery" && access_token && refresh_token) return { kind: "recovery", access_token, refresh_token };
    if (type === "signup" && access_token && refresh_token) return { kind: "confirmed" };
    if (isReset || type || access_token || params.has("code")) return { kind: "invalid" };
    return null;
  } catch { return null; }
}

export function clearAuthCallbackUrl() {
  if (Platform.OS !== "web" || typeof window === "undefined") return;
  const url = new URL(window.location.href);
  for (const key of ["access_token", "refresh_token", "expires_in", "expires_at", "token_type", "type", "code", "error", "error_code", "error_description"]) url.searchParams.delete(key);
  window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}`);
}

export function authErrorMessage(error: unknown) {
  switch ((error as { code?: string })?.code) {
    case "invalid_credentials": return "E-posta adresi veya şifre yanlış.";
    case "email_not_confirmed": return "Giriş yapmadan önce e-postana gelen doğrulama bağlantısını aç.";
    case "user_already_exists": return "Bu e-posta ile bir hesap zaten var. Giriş yapabilir veya şifreni sıfırlayabilirsin.";
    case "weak_password": return "Daha güçlü bir şifre seç. En az 8 karakter, harf ve rakam kullan.";
    case "same_password": return "Yeni şifren eski şifrenden farklı olmalı.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit": return "Çok fazla deneme yapıldı. Bir süre bekleyip tekrar dene.";
    case "signup_disabled": return "Kayıt şu anda kapalı. Lütfen daha sonra tekrar dene.";
    default: return "İşlem tamamlanamadı. Bağlantını kontrol edip tekrar dene.";
  }
}
