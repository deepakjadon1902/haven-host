const AUTH_KEY = "haven.auth.v1";

export type LocalUser = {
  email: string;
  fullName?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  role: string;
};

const ADMIN_EMAIL = "deepakjadon1907@gmail.com";
const ADMIN_PASSWORD = "deepakjadon1907@";

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getLocalUser(): LocalUser | null {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LocalUser;
  } catch {
    return null;
  }
}

export function setLocalUser(user: LocalUser) {
  if (!isBrowser()) return;
  window.localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

export function signInWithPassword(input: { email: string; password: string }): {
  user: LocalUser | null;
  error: string | null;
} {
  if (!isBrowser()) return { user: null, error: "Auth is only available in the browser" };
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (email === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
    const user: LocalUser = { email: ADMIN_EMAIL, role: "admin" };
    setLocalUser(user);
    return { user, error: null };
  }
  return { user: null, error: "Invalid admin credentials" };
}

export function signOut() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(AUTH_KEY);
}
