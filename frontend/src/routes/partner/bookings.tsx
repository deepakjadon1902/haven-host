import { createFileRoute } from "@tanstack/react-router";
import { Eye, X } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { partnerBookings, partnerHotel } from "@/lib/partner.functions";
import type { LocalBooking } from "@/lib/local-store";

type BookingStatus = LocalBooking["status"];

export const Route = createFileRoute("/partner/bookings")({
  head: () => ({
    meta: [{ title: "Partner Bookings - Haven Host" }],
  }),
  component: PartnerBookings,
});

function PartnerBookings() {
  const hotel = partnerHotel();
  const [bookings] = useState(() => partnerBookings() as LocalBooking[]);
  const [filter, setFilter] = useState<BookingStatus | "all">("all");
  const [selected, setSelected] = useState<LocalBooking | null>(null);

  const filtered = useMemo(() => {
    if (filter === "all") return bookings;
    return bookings.filter((booking) => booking.status === filter);
  }, [bookings, filter]);

  const revenue = filtered
    .filter((booking) => booking.status !== "cancelled")
    .reduce((sum, booking) => sum + booking.total_cents, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
            Partner bookings
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold">Bookings</h1>
          <p className="mt-2 text-sm text-black/60">
            Showing reservations only for {hotel.name}. Other partner bookings are never exposed
            here.
          </p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white px-5 py-4 text-right">
          <p className="text-xs font-semibold uppercase tracking-widest text-black/50">
            Filtered revenue
          </p>
          <p className="font-display text-2xl font-semibold">
            ₹{(revenue / 100).toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {(["all", "pending", "confirmed", "completed", "cancelled"] as const).map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status)}
            className={`rounded-xl px-4 py-2 text-sm font-bold capitalize transition ${
              filter === status
                ? "bg-black text-white"
                : "bg-white text-black hover:bg-black/[0.04]"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <section className="overflow-x-auto rounded-3xl border border-black/10 bg-white p-6">
        <table className="w-full min-w-[850px] border-collapse">
          <thead>
            <tr className="border-b border-black/15">
              <th className="px-4 py-3 text-left text-sm font-bold text-black">Reference</th>
              <th className="px-4 py-3 text-left text-sm font-bold text-black">Guest</th>
              <th className="px-4 py-3 text-left text-sm font-bold text-black">Room</th>
              <th className="px-4 py-3 text-left text-sm font-bold text-black">Dates</th>
              <th className="px-4 py-3 text-left text-sm font-bold text-black">Amount</th>
              <th className="px-4 py-3 text-left text-sm font-bold text-black">Status</th>
              <th className="px-4 py-3 text-left text-sm font-bold text-black">Details</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((booking) => (
              <tr key={booking.id} className="border-b border-black/10">
                <td className="px-4 py-4 font-bold text-black">{booking.reference}</td>
                <td className="px-4 py-4 text-sm">
                  <p className="font-semibold">{booking.guest_full_name}</p>
                  <p className="text-black/55">{booking.guest_email}</p>
                </td>
                <td className="px-4 py-4 text-sm font-semibold">{booking.room_type_name}</td>
                <td className="px-4 py-4 text-sm">
                  {new Date(booking.check_in).toLocaleDateString()} →{" "}
                  {new Date(booking.check_out).toLocaleDateString()}
                </td>
                <td className="px-4 py-4 font-semibold">
                  ₹{(booking.total_cents / 100).toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-4">
                  <span className="rounded-full bg-black px-3 py-1 text-xs font-bold capitalize text-white">
                    {booking.status}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <Button variant="outline" size="sm" onClick={() => setSelected(booking)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-black/60">
            No {filter !== "all" ? filter : ""} bookings found for this partner.
          </div>
        ) : null}
      </section>

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-black/10 bg-white p-6 text-black">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-black/50">
                  Booking detail
                </p>
                <h2 className="mt-1 font-display text-3xl font-semibold">{selected.reference}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-xl border border-black/10 p-2 hover:bg-black/[0.04]"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Detail title="Guest">
                <p className="font-semibold">{selected.guest_full_name}</p>
                <p>{selected.guest_email}</p>
                <p>{selected.guest_phone}</p>
              </Detail>
              <Detail title="Stay">
                <p className="font-semibold">{selected.room_type_name}</p>
                <p>
                  {new Date(selected.check_in).toLocaleDateString()} →{" "}
                  {new Date(selected.check_out).toLocaleDateString()}
                </p>
                <p>
                  {selected.nights} night{selected.nights !== 1 ? "s" : ""} · {selected.adults}{" "}
                  adult{selected.adults !== 1 ? "s" : ""} · {selected.children} child
                  {selected.children !== 1 ? "ren" : ""}
                </p>
              </Detail>
            </div>
            <Detail title="Payment" className="mt-4">
              <p className="font-display text-2xl font-semibold">
                ₹{(selected.total_cents / 100).toLocaleString("en-IN")}
                <span className="ml-2 text-xs font-bold text-black/50">{selected.currency}</span>
              </p>
              <p className="capitalize">Status: {selected.status}</p>
            </Detail>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Detail({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-black/10 bg-[#fafafa] p-4 text-sm ${className}`}>
      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-black/50">{title}</p>
      <div className="space-y-1 text-black/70">{children}</div>
    </div>
  );
}
