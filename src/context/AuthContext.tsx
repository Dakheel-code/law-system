import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

type AuthState = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthState | undefined>(undefined);

// How often to proactively check the session is still good.
// JWT default lifetime is 1 hour; checking every 4 minutes catches expiry
// well before queries start silently returning empty arrays.
const SESSION_CHECK_INTERVAL_MS = 4 * 60 * 1000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const userRef = useRef<User | null>(null);

  // Keep a ref of the current user so the periodic check below can read
  // the latest value without re-binding the interval on every render.
  userRef.current = user;

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    const sb = supabase;

    sb.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: sub } = sb.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
    });

    // Layer 1 — when the user returns to the tab after being away,
    // proactively refresh the session. If the laptop slept past JWT expiry,
    // this is what wakes us up instead of waiting for the next query to
    // silently return [].
    const onVisibilityChange = async () => {
      if (document.visibilityState !== "visible") return;
      if (!userRef.current) return;
      const { data, error } = await sb.auth.refreshSession();
      if (error || !data.session) {
        // Refresh token rejected — force signed-out state, which sends the
        // user to /login via ProtectedRoute instead of leaving them on a
        // page that silently shows zero records.
        await sb.auth.signOut().catch(() => undefined);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    // Layer 2 — periodic background check. The supabase-js client has its
    // own autoRefreshToken loop, but it relies on the page being active
    // and the loop being healthy; this is belt-and-suspenders.
    const interval = window.setInterval(async () => {
      if (!userRef.current) return;
      const { data, error } = await sb.auth.getSession();
      if (error || !data.session) {
        await sb.auth.signOut().catch(() => undefined);
        return;
      }
      // Token expires within 5 min → refresh now.
      const expiresAt = (data.session.expires_at ?? 0) * 1000;
      if (expiresAt - Date.now() < 5 * 60 * 1000) {
        const { error: refreshErr } = await sb.auth.refreshSession();
        if (refreshErr) {
          await sb.auth.signOut().catch(() => undefined);
        }
      }
    }, SESSION_CHECK_INTERVAL_MS);

    return () => {
      sub.subscription.unsubscribe();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.clearInterval(interval);
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { error: "Supabase غير مهيّأ. تحقق من ملف .env.local" };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  return (
    <Ctx.Provider value={{ user, session, loading, signIn, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export { isSupabaseConfigured };
