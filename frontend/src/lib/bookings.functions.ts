import { apiFetch, hasApiBase } from "@/lib/api-client";
import { getUserToken } from "@/lib/user-session";
import {
  createBooking as localCreateBooking,
  listBookingsByEmail as localListByEmail,
  type LocalBooking,
} from "@/lib/local-store";
import { emitAppDataChanged } from "@/lib/app-events";

export async function createBooking(
  input: Parameters<typeof localCreateBooking>[0],
): Promise<LocalBooking> {
  if (hasApiBase()) {
    const booking = await apiFetch<LocalBooking>("/public/bookings", {
      method: "POST",
      json: input,
      token: getUserToken(),
    });
    emitAppDataChanged("public:bookings:create");
    return booking;
  }
  const booking = localCreateBooking(input);
  emitAppDataChanged("public:bookings:create");
  return booking;
}

export async function listBookingsByEmail(email: string): Promise<LocalBooking[]> {
  if (hasApiBase()) {
    const qs = new URLSearchParams({ email: email.trim().toLowerCase() });
    return await apiFetch<LocalBooking[]>(`/public/bookings?${qs.toString()}`);
  }
  return localListByEmail(email);
}
