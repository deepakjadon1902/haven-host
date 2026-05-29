const KEY = "haven.adminToken.v1";

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function setAdminToken(token: string) {
  if (!isBrowser()) return;
  window.localStorage.setItem(KEY, token);
}

export function getAdminToken(): string | null {
  if (!isBrowser()) return null;
  const t = window.localStorage.getItem(KEY);
  return t && t.trim() ? t : null;
}

export function clearAdminToken() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(KEY);
}
