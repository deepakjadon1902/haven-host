import { apiFetch, hasApiBase } from "@/lib/api-client";
import { getStoredUser, getUserToken, setStoredUser, type AppUser } from "@/lib/user-session";
import { listBookingsByEmail, type LocalBooking } from "@/lib/local-store";

export type ProfileInput = {
  fullName: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
};

export async function getCurrentProfile(): Promise<AppUser | null> {
  const token = getUserToken();
  if (hasApiBase() && token) {
    const result = await apiFetch<{ user: AppUser }>("/auth/me", { token });
    setStoredUser(result.user);
    return result.user;
  }
  return getStoredUser();
}

export async function updateCurrentProfile(input: ProfileInput): Promise<AppUser> {
  const token = getUserToken();
  if (!hasApiBase() || !token) {
    const existing = getStoredUser();
    if (!existing) throw new Error("Please sign in again");
    const updated = { ...existing, ...input };
    setStoredUser(updated);
    return updated;
  }

  const result = await apiFetch<{ user: AppUser }>("/auth/me", {
    method: "PUT",
    json: input,
    token,
  });
  setStoredUser(result.user);
  return result.user;
}

export async function listCurrentUserBookings(email: string): Promise<LocalBooking[]> {
  const token = getUserToken();
  if (hasApiBase() && token) {
    const result = await apiFetch<{ bookings: LocalBooking[] }>("/auth/me/bookings", { token });
    return result.bookings;
  }
  return listBookingsByEmail(email);
}
