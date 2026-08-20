import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CalendarCheck, Check, Home, ReceiptText, ShieldCheck, Users } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { findHotel, getRoomById, listBookings, type LocalBooking } from "@/lib/local-store";

type Search = { id?: string; ref?: string; hotel?: string; room?: string };

export const Route = createFileRoute("/booking/success")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    id: typeof s.id === "string" ? s.id : undefined,
    ref: typeof s.ref === "string" ? s.ref : undefined,
    hotel: typeof s.hotel === "string" ? s.hotel : undefined,
    room: typeof s.room === "string" ? s.room : undefined,
  }),
  head: () => ({ meta: [{ title: "Booking confirmed — Maison Noir" }] }),
  component: SuccessPage,
});

function SuccessPage() {
  const { id, ref, room: roomId } = Route.useSearch();
  const booking: LocalBooking | undefined = listBookings().find(
    (row) => row.id === id || row.reference === ref,
  );
  const room = getRoomById(booking?.room_id ?? roomId ?? "");
  const hotel = room?.hotelId ? findHotel(room.hotelId) : undefined;

  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-5 py-16 text-center lg:py-20">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          className="mx-auto grid h-24 w-24 place-items-center rounded-full gold-gradient border-4 border-yellow-400"
        >
          <Check className="h-12 w-12 text-black" strokeWidth={3} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 font-display text-4xl font-semibold text-black md:text-5xl"
        >
          Reservation confirmed.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4 text-lg text-gray-700"
        >
          Your payment was verified and your booking is confirmed. You can find it anytime under My
          bookings.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 rounded-3xl border border-black/10 bg-white p-6 text-left shadow-elegant"
        >
          {room?.coverImage ? (
            <img
              src={room.coverImage}
              alt={room.name}
              className="mb-5 aspect-[16/7] w-full rounded-2xl object-cover"
            />
          ) : null}
          <div className="flex items-center justify-between gap-4 border-b border-black/10 pb-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-700">
                Reference
              </span>
              <div className="mt-1 font-display text-2xl font-semibold gold-text">
                {booking?.reference ?? ref ?? "MN-XXXXXX"}
              </div>
              <div className="mt-2 text-sm font-semibold text-black">
                {room?.name ?? booking?.room_type_name ?? "Reserved room"}
              </div>
              <div className="text-xs text-gray-600">
                {hotel?.name ?? booking?.hotel_name ?? "Maison Noir"}
                {hotel?.city ? ` / ${hotel.city}` : ""}
              </div>
            </div>
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-black text-white">
              <ReceiptText className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <ConfirmationChip icon={<ShieldCheck />} label="Payment verified" />
            <ConfirmationChip icon={<CalendarCheck />} label="Reservation locked" />
          </div>
          {booking ? (
            <div className="mt-5 grid gap-3 rounded-2xl bg-gray-50 p-4 text-sm sm:grid-cols-2">
              <SummaryLine label="Check-in" value={booking.check_in} />
              <SummaryLine label="Check-out" value={booking.check_out} />
              <SummaryLine
                label="Guests"
                value={`${booking.adults + booking.children} total`}
                icon={<Users />}
              />
              <SummaryLine label="Total paid" value={formatInr(booking.total_cents)} />
            </div>
          ) : null}
        </motion.div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button asChild className="h-11 rounded-full px-6 font-semibold">
            {booking ? (
              <Link to="/my-bookings/$id" params={{ id: booking.id }}>
                View booking details
              </Link>
            ) : (
              <Link to="/my-bookings">View my bookings</Link>
            )}
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-11 rounded-full px-6 font-semibold border-black/15 text-black hover:bg-gray-50"
          >
            <Link to="/my-bookings">All bookings</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-11 rounded-full px-6 font-semibold border-black/15 text-black hover:bg-gray-50"
          >
            <Link to="/">
              <Home className="h-4 w-4" /> Back home
            </Link>
          </Button>
        </div>
      </div>
    </SiteLayout>
  );
}

function formatInr(cents: number) {
  const rupees = Math.round(cents / 100);
  return `Rs ${rupees.toLocaleString("en-IN")}`;
}

function ConfirmationChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex h-12 items-center gap-3 rounded-xl border border-black/10 bg-gray-50 px-4 text-sm font-semibold text-black">
      <span className="text-gold [&_svg]:h-4 [&_svg]:w-4">{icon}</span>
      <span>{label}</span>
    </div>
  );
}

function SummaryLine({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-gray-600">
        {icon ? <span className="text-gold [&_svg]:h-3.5 [&_svg]:w-3.5">{icon}</span> : null}
        {label}
      </div>
      <div className="mt-1 font-semibold text-black">{value}</div>
    </div>
  );
}
