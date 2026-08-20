const AUTH_KEY = "haven.auth.v1";
const ACCOUNTS_KEY = "haven.localAccounts.v1";

export type LocalUser = {
  email: string;
  fullName?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  role: string;
};

type LocalAccount = LocalUser & {
  password?: string;
  provider: "email" | "google" | "admin";
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

function getAccounts(): LocalAccount[] {
  if (!isBrowser()) return [];
  const raw = window.localStorage.getItem(ACCOUNTS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LocalAccount[]) : [];
  } catch {
    return [];
  }
}

function setAccounts(accounts: LocalAccount[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function withoutPassword(account: LocalAccount): LocalUser {
  const { password: _password, provider: _provider, ...user } = account;
  return user;
}

export function createLocalAccount(input: { fullName: string; email: string; password: string }): {
  user: LocalUser | null;
  error: string | null;
} {
  if (!isBrowser()) return { user: null, error: "Auth is only available in the browser" };
  const email = input.email.trim().toLowerCase();
  const fullName = input.fullName.trim();
  const password = input.password;

  if (!fullName) return { user: null, error: "Please enter your full name" };
  if (!email.includes("@")) return { user: null, error: "Please enter a valid email" };
  if (password.length < 6) return { user: null, error: "Password must be at least 6 characters" };

  const accounts = getAccounts();
  const existingIndex = accounts.findIndex((account) => account.email.toLowerCase() === email);
  const nextAccount: LocalAccount = {
    email,
    fullName,
    password,
    role: "guest",
    provider: "email",
  };

  if (existingIndex >= 0) {
    accounts[existingIndex] = { ...accounts[existingIndex], ...nextAccount };
  } else {
    accounts.push(nextAccount);
  }

  setAccounts(accounts);
  const user = withoutPassword(nextAccount);
  setLocalUser(user);
  return { user, error: null };
}

export function upsertGoogleLocalUser(input: { email: string; fullName?: string }): {
  user: LocalUser | null;
  error: string | null;
} {
  if (!isBrowser()) return { user: null, error: "Auth is only available in the browser" };
  const email = input.email.trim().toLowerCase();
  if (!email.includes("@")) return { user: null, error: "Google account email is missing" };

  const accounts = getAccounts();
  const existingIndex = accounts.findIndex((account) => account.email.toLowerCase() === email);
  const existing = existingIndex >= 0 ? accounts[existingIndex] : null;
  const nextAccount: LocalAccount = {
    ...existing,
    email,
    fullName: input.fullName?.trim() || existing?.fullName || email.split("@")[0],
    role: existing?.role ?? "guest",
    provider: "google",
  };

  if (existingIndex >= 0) {
    accounts[existingIndex] = nextAccount;
  } else {
    accounts.push(nextAccount);
  }

  setAccounts(accounts);
  const user = withoutPassword(nextAccount);
  setLocalUser(user);
  return { user, error: null };
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

  const account = getAccounts().find((item) => item.email.toLowerCase() === email);
  if (!account || account.provider !== "email" || account.password !== password) {
    return { user: null, error: "Invalid email or password" };
  }

  const user = withoutPassword(account);
  setLocalUser(user);
  return { user, error: null };
}

export function signOut() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(AUTH_KEY);
}
