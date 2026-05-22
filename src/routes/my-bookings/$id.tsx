import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { listBookings, type LocalBooking } from "@/lib/local-store";

export const Route = createFileRoute("/my-bookings/$id")({
  head: () => ({
    meta: [{ title: "Booking details â€” Maison Noir" }],
  }),
  component: BookingDetailPage,
});

function formatInr(cents: number) {
  const rupees = Math.round(cents / 100);
  return `â‚¹${rupees.toLocaleString("en-IN")}`;
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 py-3 text-sm">
      <div className="text-gray-700">{k}</div>
      <div className="font-semibold text-black">{v}</div>
    </div>
  );
}

function BookingDetailPage() {
  const { id } = Route.useParams();
  const b: LocalBooking | undefined = listBookings().find((x) => x.id === id);
  if (!b) throw notFound();

  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-5 py-10 lg:px-8 lg:py-14">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/my-bookings" className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-black">
            <ArrowLeft className="h-4 w-4" /> Back to my bookings
          </Link>
          <h1 className="mt-4 font-display text-4xl font-semibold text-black">Booking details</h1>
          <p className="mt-2 text-sm text-gray-700">
            Reference <span className="font-semibold text-black">{b.reference}</span>
          </p>
        </motion.div>

        <div className="mt-8 rounded-3xl border border-black/10 bg-white p-8">
          <Row k="Room" v={b.room_type_name} />
          <Row k="Check-in" v={b.check_in} />
          <Row k="Check-out" v={b.check_out} />
          <Row k="Nights" v={`${b.nights}`} />
          <Row k="Guests" v={`${b.adults + b.children} (${b.adults} adults, ${b.children} children)`} />
          <Row k="Guest name" v={b.guest_full_name} />
          <Row k="Guest email" v={b.guest_email} />
          <Row k="Guest phone" v={b.guest_phone} />
          <Row k="Total" v={`${formatInr(b.total_cents)} ${b.currency}`} />
          <Row k="Status" v={`${b.status}${b.payment_status ? ` â€¢ ${b.payment_status}` : ""}`} />
          <Row k="Created" v={new Date(b.created_at).toLocaleString()} />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild className="rounded-full font-semibold">
            <Link to="/rooms">Book another room</Link>
          </Button>
        </div>
      </div>
    </SiteLayout>
  );
}

