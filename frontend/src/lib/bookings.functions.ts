import { apiFetch, hasApiBase } from "@/lib/api-client";
import {
  createBooking as localCreateBooking,
  listBookingsByEmail as localListByEmail,
  type LocalBooking,
} from "@/lib/local-store";

export async function createBooking(
  input: Parameters<typeof localCreateBooking>[0],
): Promise<LocalBooking> {
  if (hasApiBase()) {
    return await apiFetch<LocalBooking>("/public/bookings", { method: "POST", json: input });
  }
  return localCreateBooking(input);
}

export async function listBookingsByEmail(email: string): Promise<LocalBooking[]> {
  if (hasApiBase()) {
    const qs = new URLSearchParams({ email: email.trim().toLowerCase() });
    return await apiFetch<LocalBooking[]>(`/public/bookings?${qs.toString()}`);
  }
  return localListByEmail(email);
}
