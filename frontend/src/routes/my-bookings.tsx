import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CalendarDays, Eye, Hotel, IndianRupee, Search, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import {
  getLastBookingEmail,
  getRoomById,
  listBookingsByEmail as listLocalBookingsByEmail,
  type LocalBooking,
} from "@/lib/local-store";
import { listBookingsByEmail } from "@/lib/bookings.functions";
import { useAuth } from "@/hooks/useAuth";
import { listCurrentUserBookings } from "@/lib/profile.functions";

export const Route = createFileRoute("/my-bookings")({
  head: () => ({
    meta: [{ title: "My bookings - Maison Noir" }],
  }),
  component: MyBookingsPage,
});

function formatInr(cents: number) {
  const rupees = Math.round(cents / 100);
  return `₹${rupees.toLocaleString("en-IN")}`;
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusClass(status: string) {
  if (status === "confirmed" || status === "paid") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (status === "cancelled" || status === "failed") {
    return "border-red-200 bg-red-50 text-red-700";
  }
  if (status === "completed") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }
  return "border-amber-200 bg-amber-50 text-amber-700";
}

function StatusPill({ value }: { value: string }) {
  return (
    <span
      className={`inline-flex h-7 items-center rounded-full border px-3 text-xs font-semibold capitalize ${statusClass(
        value,
      )}`}
    >
      {value}
    </span>
  );
}

function getBookingRoomSlug(booking: LocalBooking) {
  if (!booking.room_id) return null;
  return getRoomById(booking.room_id)?.slug ?? null;
}

function MyBookingsPage() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [rows, setRows] = useState<LocalBooking[]>([]);

  useEffect(() => {
    setEmail(user?.email ?? getLastBookingEmail());
  }, [user?.email]);

  useEffect(() => {
    if (!email.trim()) {
      setRows([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const lookupEmail = user?.email ?? email;
      const localRows = listLocalBookingsByEmail(lookupEmail);
      const remoteRows = await (user
        ? listCurrentUserBookings(user.email).catch(() => [])
        : listBookingsByEmail(email).catch(() => []));
      const byId = new Map<string, LocalBooking>();
      [...remoteRows, ...localRows].forEach((row) => byId.set(row.id, row));
      const next = Array.from(byId.values());
      if (!cancelled) setRows(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [email, user]);

  const sorted = useMemo(() => {
    return rows.slice().sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  }, [rows]);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-5 py-10 lg:px-8 lg:py-14">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              Maison Noir
            </p>
            <h1 className="mt-2 font-display text-4xl font-semibold text-black md:text-5xl">
              My bookings
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-gray-700">
              View your reservation history, payment status, stay dates, and room details in one
              clean workspace.
            </p>
          </motion.div>

          <Button asChild className="h-11 rounded-lg bg-black px-5 font-semibold text-white">
            <Link to="/rooms">Book a room</Link>
          </Button>
        </div>

        <div className="mt-8 rounded-2xl border border-black/10 bg-white p-4 shadow-[0_18px_50px_-42px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="flex-1">
              <label className="block text-xs font-semibold uppercase tracking-widest text-gray-600">
                Booking email
              </label>
              <div className="relative mt-2">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="h-12 w-full rounded-xl border border-black/10 bg-[#fbfbfb] pl-11 pr-4 text-sm font-medium text-black outline-none transition focus:border-gold focus:bg-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 md:w-[360px]">
              <Metric label="Total" value={sorted.length} />
              <Metric
                label="Paid"
                value={sorted.filter((item) => item.payment_status === "paid").length}
              />
              <Metric
                label="Upcoming"
                value={sorted.filter((item) => item.status === "confirmed").length}
              />
            </div>
          </div>
        </div>

        <div className="mt-8">
          {email.trim() && sorted.length === 0 ? (
            <div className="rounded-2xl border border-black/10 bg-white p-12 text-center shadow-[0_18px_50px_-42px_rgba(0,0,0,0.5)]">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-black text-white">
                <Hotel className="h-5 w-5" />
              </div>
              <h2 className="mt-5 font-display text-2xl font-semibold text-black">
                No bookings found
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-gray-600">
                We could not find a reservation for{" "}
                <span className="font-semibold text-black">{email.trim()}</span>. Try another email
                or make a new booking.
              </p>
            </div>
          ) : null}

          {sorted.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_18px_50px_-42px_rgba(0,0,0,0.55)]">
              <div className="hidden lg:block">
                <table className="w-full border-collapse text-left">
                  <thead className="bg-[#f7f5f1]">
                    <tr className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                      <th className="px-6 py-4">Reference</th>
                      <th className="px-6 py-4">Stay</th>
                      <th className="px-6 py-4">Guests</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/10">
                    {sorted.map((booking) => (
                      <BookingTableRow key={booking.id} booking={booking} />
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-black/10 lg:hidden">
                {sorted.map((booking) => (
                  <BookingMobileCard key={booking.id} booking={booking} />
                ))}
              </div>
            </div>
          ) : null}

          {sorted.length > 0 ? (
            <div className="mt-4 flex flex-col gap-2 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Showing {sorted.length} booking{sorted.length !== 1 ? "s" : ""} for{" "}
                <span className="font-semibold text-gray-700">{email.trim()}</span>
              </span>
              <span>Click View to open the booked room details.</span>
            </div>
          ) : null}
        </div>
      </div>
    </SiteLayout>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-black/10 bg-[#fbfbfb] p-3">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold text-black">{value}</div>
    </div>
  );
}

function BookingTableRow({ booking }: { booking: LocalBooking }) {
  const roomSlug = getBookingRoomSlug(booking);

  return (
    <tr className="group transition hover:bg-[#fbfaf7]">
      <td className="px-6 py-5 align-top">
        <div className="font-display text-xl font-semibold text-black">{booking.reference}</div>
        <div className="mt-1 text-sm font-medium text-gray-700">{booking.hotel_name}</div>
        <div className="mt-0.5 text-xs text-gray-500">{booking.room_type_name}</div>
      </td>
      <td className="px-6 py-5 align-top">
        <div className="flex items-start gap-2 text-sm font-semibold text-black">
          <CalendarDays className="mt-0.5 h-4 w-4 text-gold" />
          <span>
            {formatDate(booking.check_in)} - {formatDate(booking.check_out)}
          </span>
        </div>
        <div className="mt-1 pl-6 text-xs text-gray-500">
          {booking.nights} night{booking.nights !== 1 ? "s" : ""}
        </div>
      </td>
      <td className="px-6 py-5 align-top">
        <div className="flex items-center gap-2 text-sm font-semibold text-black">
          <Users className="h-4 w-4 text-gold" />
          <span>
            {booking.adults + booking.children} guest
            {booking.adults + booking.children !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="mt-1 text-xs text-gray-500">
          {booking.adults} adult{booking.adults !== 1 ? "s" : ""}
          {booking.children ? `, ${booking.children} children` : ""}
        </div>
      </td>
      <td className="px-6 py-5 align-top">
        <div className="flex items-center gap-1 text-lg font-semibold text-black">
          <IndianRupee className="h-4 w-4 text-gold" />
          {formatInr(booking.total_cents).replace("₹", "")}
        </div>
        <div className="mt-1 text-xs uppercase tracking-wider text-gray-500">
          {booking.currency}
        </div>
      </td>
      <td className="px-6 py-5 align-top">
        <div className="flex flex-col items-start gap-2">
          <StatusPill value={booking.status} />
          {booking.payment_status ? <StatusPill value={booking.payment_status} /> : null}
        </div>
      </td>
      <td className="px-6 py-5 text-right align-top">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-9 rounded-lg border-black/10 bg-white px-3 text-black transition group-hover:border-gold"
        >
          {roomSlug ? (
            <Link to="/rooms/$slug" params={{ slug: roomSlug }}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </Link>
          ) : (
            <Link to="/my-bookings/$id" params={{ id: booking.id }}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </Link>
          )}
        </Button>
      </td>
    </tr>
  );
}

function BookingMobileCard({ booking }: { booking: LocalBooking }) {
  const roomSlug = getBookingRoomSlug(booking);
  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-gray-500">
            Reference
          </div>
          <div className="mt-1 font-display text-xl font-semibold text-black">
            {booking.reference}
          </div>
        </div>
        <StatusPill value={booking.status} />
      </div>
      <div className="mt-4 space-y-3 text-sm">
        <div>
          <div className="font-semibold text-black">{booking.hotel_name}</div>
          <div className="text-gray-600">{booking.room_type_name}</div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-[#f7f5f1] p-3">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
              Stay
            </div>
            <div className="mt-1 font-semibold text-black">{formatDate(booking.check_in)}</div>
            <div className="text-xs text-gray-500">to {formatDate(booking.check_out)}</div>
          </div>
          <div className="rounded-xl bg-[#f7f5f1] p-3">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
              Total
            </div>
            <div className="mt-1 font-semibold text-black">{formatInr(booking.total_cents)}</div>
            <div className="text-xs capitalize text-gray-500">
              {booking.payment_status ?? "unpaid"}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  if (roomSlug) {
    return (
      <Link
        to="/rooms/$slug"
        params={{ slug: roomSlug }}
        className="block p-5 transition hover:bg-[#fbfaf7]"
      >
        {content}
      </Link>
    );
  }

  return (
    <Link
      to="/my-bookings/$id"
      params={{ id: booking.id }}
      className="block p-5 transition hover:bg-[#fbfaf7]"
    >
      {content}
    </Link>
  );
}
