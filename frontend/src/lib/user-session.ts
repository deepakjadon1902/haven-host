const TOKEN_KEY = "haven.userToken.v1";
const USER_KEY = "haven.user.v1";
export const USER_SESSION_CHANGED_EVENT = "haven:user-session-changed";

export type AppUser = {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  role: string;
};

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function emitUserSessionChanged() {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent(USER_SESSION_CHANGED_EVENT));
}

export function setUserToken(token: string) {
  if (!isBrowser()) return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function setStoredUser(user: AppUser) {
  if (!isBrowser()) return;
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  emitUserSessionChanged();
}

export function getUserToken(): string | null {
  if (!isBrowser()) return null;
  const t = window.localStorage.getItem(TOKEN_KEY);
  return t && t.trim() ? t : null;
}

export function getStoredUser(): AppUser | null {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AppUser;
  } catch {
    return null;
  }
}

export function clearUserToken() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  emitUserSessionChanged();
}
