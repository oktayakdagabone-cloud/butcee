import type { Session, User } from "@supabase/supabase-js";
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";
import * as Linking from "expo-linking";
import { setActiveStorageUser } from "../../lib/userStorage";
import { supabase } from "../../lib/supabase";
import { clearAuthCallbackUrl, parseAuthCallback, removeLegacySession } from "../../lib/authHelpers";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  recovering: boolean;
  notice: string;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  finishRecovery: (password: string) => Promise<void>;
};
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [recovering, setRecovering] = useState(false);
  const [notice, setNotice] = useState("");
  const generation = useRef(0);

  useEffect(() => {
    let active = true;
    let lastUrl: string | null = null;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!active) return;
      // Admit users only after password login, never from saved sessions or email links.
      if (event === "SIGNED_OUT") {
        setActiveStorageUser(null);
        setSession(null);
        setRecovering(false);
      } else if (event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        setSession(current => current ? nextSession : null);
      }
    });

    async function handleUrl(url: string | null) {
      if (!url || url === lastUrl) return;
      const callback = parseAuthCallback(url);
      if (!callback) return;
      lastUrl = url;
      const current = ++generation.current;
      setLoading(true);
      setSession(null);
      setActiveStorageUser(null);
      setRecovering(false);
      try {
        if (callback.kind === "recovery") {
          const { data, error } = await supabase.auth.setSession(callback);
          if (error || !data.session) throw error ?? new Error("Invalid recovery session");
          if (active && current === generation.current) {
            setRecovering(true);
            setNotice("");
          }
        } else if (active && current === generation.current) {
          setNotice(callback.kind === "confirmed"
            ? "E-posta adresin doğrulandı. Şifrenle giriş yapabilirsin."
            : "Bağlantı geçersiz veya süresi dolmuş. Şifremi unuttum bölümünden yeni bağlantı iste.");
        }
      } catch {
        if (active && current === generation.current) {
          setNotice("Bağlantı doğrulanamadı veya süresi dolmuş. Şifremi unuttum bölümünden yeni bağlantı iste.");
        }
      } finally {
        if (active && current === generation.current) {
          clearAuthCallbackUrl();
          setLoading(false);
        }
      }
    }

    const listener = Linking.addEventListener("url", ({ url }) => { void handleUrl(url); });
    void (async () => {
      const initialGeneration = generation.current;
      await removeLegacySession().catch(() => undefined);
      const url = await Linking.getInitialURL().catch(() => null);
      if (!active || generation.current !== initialGeneration) return;
      await handleUrl(url);
      if (active && generation.current === initialGeneration) setLoading(false);
    })();
    return () => { active = false; subscription.unsubscribe(); listener.remove(); };
  }, []);

  async function signIn(email: string, password: string) {
    const current = generation.current;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.session || current !== generation.current) throw new Error("Login interrupted");
    setActiveStorageUser(data.session.user.id);
    setRecovering(false);
    setNotice("");
    setSession(data.session);
  }

  async function signOut() {
    ++generation.current;
    setLoading(true);
    setActiveStorageUser(null);
    setSession(null);
    setRecovering(false);
    setNotice("");
    try {
      await supabase.auth.signOut({ scope: "local" });
    } finally {
      setLoading(false);
    }
  }

  async function finishRecovery(password: string) {
    if (!recovering) throw new Error("No recovery session");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    await signOut();
    setNotice("Şifren güncellendi. Yeni şifrenle giriş yapabilirsin.");
  }

  return <AuthContext.Provider value={{ user: session?.user ?? null, loading, recovering, notice, signIn, signOut, finishRecovery }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
