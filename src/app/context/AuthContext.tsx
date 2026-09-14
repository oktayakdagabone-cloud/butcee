import { Session, User } from "@supabase/supabase-js";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { setActiveStorageUser } from "../../lib/userStorage";
import { supabase } from "../../lib/supabase";

type AuthContextValue = { session: Session | null; user: User | null; loading: boolean; signOut: () => Promise<void> };
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setActiveStorageUser(session?.user.id ?? null);
        setSession(session);
      })
      .catch((error) => {
        console.error("Oturum yüklenemedi:", error);
        setActiveStorageUser(null);
        setSession(null);
      })
      .finally(() => setLoading(false));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setActiveStorageUser(nextSession?.user.id ?? null);
      setSession(nextSession);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  return <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, signOut: async () => { await supabase.auth.signOut(); } }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
