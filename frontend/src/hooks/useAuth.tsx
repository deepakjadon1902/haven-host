import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  getLocalUser,
  setLocalUser,
  signInWithPassword as localSignInWithPassword,
  signOut as localSignOut,
  type LocalUser,
} from "@/lib/local-auth";
import { apiFetch, hasApiBase } from "@/lib/api-client";
import { clearAdminToken, setAdminToken } from "@/lib/admin-session";
import {
  clearUserToken,
  getUserToken,
  getStoredUser,
  setStoredUser,
  USER_SESSION_CHANGED_EVENT,
  type AppUser,
} from "@/lib/user-session";
import type { ProfileInput } from "@/lib/profile.functions";

type AuthContextValue = {
  user: AppUser | null;
  loading: boolean;
  signInWithPassword: (input: {
    email: string;
    password: string;
  }) => Promise<{ user: AppUser | null; error: string | null }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<AppUser | null>;
  updateProfile: (input: ProfileInput) => Promise<{ user: AppUser | null; error: string | null }>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function toAppUser(user: LocalUser | AppUser | null): AppUser | null {
  if (!user) return null;
  return {
    id: "id" in user ? user.id : user.email,
    email: user.email,
    fullName: user.fullName,
    phone: user.phone,
    address: user.address,
    city: user.city,
    country: user.country,
    role: user.role,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    const syncUser = () => setUser(getStoredUser() ?? toAppUser(getLocalUser()));
    syncUser();
    setLoading(false);
    window.addEventListener(USER_SESSION_CHANGED_EVENT, syncUser);
    window.addEventListener("storage", syncUser);
    return () => {
      window.removeEventListener(USER_SESSION_CHANGED_EVENT, syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  const refreshUser = useCallback(async () => {
    const token = getUserToken();
    if (hasApiBase() && token) {
      const result = await apiFetch<{ user: AppUser }>("/auth/me", { token });
      setStoredUser(result.user);
      setUser(result.user);
      return result.user;
    }
    const local = getStoredUser() ?? toAppUser(getLocalUser());
    setUser(local);
    return local;
  }, []);

  const updateProfile = useCallback(
    async (input: ProfileInput) => {
      const token = getUserToken();
      try {
        if (hasApiBase() && token) {
          const result = await apiFetch<{ user: AppUser }>("/auth/me", {
            method: "PUT",
            json: input,
            token,
          });
          setStoredUser(result.user);
          setUser(result.user);
          router.invalidate();
          queryClient.invalidateQueries();
          return { user: result.user, error: null };
        }
        const existing = getStoredUser();
        if (!existing) return { user: null, error: "Please sign in again" };
        const updated = { ...existing, ...input };
        setStoredUser(updated);
        setUser(updated);
        router.invalidate();
        queryClient.invalidateQueries();
        return { user: updated, error: null };
      } catch (e) {
        return { user: null, error: e instanceof Error ? e.message : "Failed to update profile" };
      }
    },
    [queryClient, router],
  );

  const value: AuthContextValue = {
    user,
    loading,
    refreshUser,
    updateProfile,
    signInWithPassword: async (input) => {
      if (hasApiBase()) {
        try {
          const apiRes = await apiFetch<{ token: string; user: LocalUser }>("/auth/admin/login", {
            method: "POST",
            json: input,
          });
          const adminUser: AppUser = {
            id: apiRes.user.email,
            email: apiRes.user.email,
            fullName: apiRes.user.fullName,
            role: "admin",
          };
          setAdminToken(apiRes.token);
          setLocalUser(adminUser);
          setStoredUser(adminUser);
          setUser(adminUser);
          router.invalidate();
          queryClient.invalidateQueries();
          return { user: adminUser, error: null };
        } catch {
          // Keep the local fallback below available for offline/demo use.
        }
      }

      const res = localSignInWithPassword(input);
      if (res.user && hasApiBase()) {
        try {
          const apiRes = await apiFetch<{ token: string }>("/auth/admin/login", {
            method: "POST",
            json: input,
          });
          setAdminToken(apiRes.token);
        } catch {
          // Backend auth is optional; keep local-only auth working.
        }
      }
      const localUser = toAppUser(res.user);
      if (localUser) setStoredUser(localUser);
      setUser(localUser);
      router.invalidate();
      queryClient.invalidateQueries();
      return { user: localUser, error: res.error };
    },
    signOut: async () => {
      localSignOut();
      clearAdminToken();
      clearUserToken();
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
