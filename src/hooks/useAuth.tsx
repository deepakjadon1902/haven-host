import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { getLocalUser, signInWithPassword as localSignInWithPassword, signOut as localSignOut, type LocalUser } from "@/lib/local-auth";

type AuthContextValue = {
  user: LocalUser | null;
  loading: boolean;
  signInWithPassword: (input: { email: string; password: string }) => Promise<{ user: LocalUser | null; error: string | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    setUser(getLocalUser());
    setLoading(false);
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    signInWithPassword: async (input) => {
      const res = localSignInWithPassword(input);
      setUser(res.user);
      router.invalidate();
      queryClient.invalidateQueries();
      return res;
    },
    signOut: async () => {
      localSignOut();
      setUser(null);
      router.invalidate();
      queryClient.invalidateQueries();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
