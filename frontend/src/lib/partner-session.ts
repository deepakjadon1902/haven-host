import type { PartnerAccount } from "@/lib/local-store";
import { findPartnerByCredentials, listPartners } from "@/lib/local-store";

const KEY = "haven.partnerSession.v1";

export type PartnerSession = {
  partnerId: string;
  hotelId: string;
  hotelName: string;
  ownerName: string;
  email: string;
  subscriptionTier: PartnerAccount["subscriptionTier"];
};

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getPartnerSession(): PartnerSession | null {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw) as PartnerSession;
    const account = listPartners().find((p) => p.id === session.partnerId && p.active);
    if (!account) {
      window.localStorage.removeItem(KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function signInPartner(input: { email: string; password: string }): {
  session: PartnerSession | null;
  error: string | null;
} {
  const account = findPartnerByCredentials(input);
  if (!account) return { session: null, error: "Invalid partner credentials" };
  const session: PartnerSession = {
    partnerId: account.id,
    hotelId: account.hotelId,
    hotelName: account.hotelName,
    ownerName: account.ownerName,
    email: account.email,
    subscriptionTier: account.subscriptionTier,
  };
  if (isBrowser()) window.localStorage.setItem(KEY, JSON.stringify(session));
  return { session, error: null };
}

export function signOutPartner() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(KEY);
}

export function updatePartnerSession(patch: Partial<PartnerSession>) {
  if (!isBrowser()) return;
  const session = getPartnerSession();
  if (!session) return;
  window.localStorage.setItem(KEY, JSON.stringify({ ...session, ...patch }));
}

export function clearPartnerSessionFor(partnerId: string) {
  if (!isBrowser()) return;
  const session = getPartnerSession();
  if (session?.partnerId === partnerId) window.localStorage.removeItem(KEY);
}
