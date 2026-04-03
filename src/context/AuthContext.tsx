import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AuthContextType {
  /** The authenticated Supabase user, or null if logged out. */
  user: User | null;

  /** The current Supabase session (contains access_token, etc.), or null. */
  session: Session | null;

  /**
   * True while Supabase is resolving the initial auth state on first load.
   * Show <AppLoadingScreen /> while this is true — never redirect yet.
   */
  loading: boolean;

  /** Signs the user out and clears local session state. */
  signOut: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // START as true — critical

  useEffect(() => {
    // ── 1. Resolve session on first mount ────────────────────────────────────
    // getSession() reads from localStorage synchronously (fast).
    // This is what eliminates the "flash of unauthenticated content".
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // ── 2. Subscribe to auth state changes ───────────────────────────────────
    // Fires on: login, logout, token refresh, OAuth callback, magic link.
    // This keeps user/session in sync with the Supabase SDK at all times.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe();
  }, []);

  // ── Sign out ────────────────────────────────────────────────────────────────
  // Clears the Supabase session from localStorage and fires onAuthStateChange
  // with a null session — which will update user/session state automatically.
  // Navigation to '/' is handled by the component calling signOut
  // (Sidebar, MobileNav) via useNavigate(), not here.
  const signOut = useCallback(async (): Promise<void> => {
    await supabase.auth.signOut();
    // onAuthStateChange fires after this and sets user/session to null.
    // No need to setUser(null) manually here.
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
/**
 * Access auth state anywhere in the app.
 *
 * @example
 *   const { user, loading, signOut } = useAuth();
 *
 * Must be used inside <AuthProvider> (wraps the whole app in main.tsx).
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
};
