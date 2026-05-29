const TOKEN_KEY = "haven.userToken.v1";

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function setUserToken(token: string) {
  if (!isBrowser()) return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function getUserToken(): string | null {
  if (!isBrowser()) return null;
  const t = window.localStorage.getItem(TOKEN_KEY);
  return t && t.trim() ? t : null;
}

export function clearUserToken() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(TOKEN_KEY);
}
