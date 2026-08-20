import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BadgeCheck,
  BedDouble,
  Building2,
  CalendarDays,
  CreditCard,
  Mail,
  MapPin,
  Phone,
  User,
  Users,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { findHotel, getRoomById, listBookings, type LocalBooking } from "@/lib/local-store";

export const Route = createFileRoute("/my-bookings/$id")({
  head: () => ({
    meta: [{ title: "Booking details - Maison Noir" }],
  }),
  component: BookingDetailPage,
});

function formatInr(cents: number) {
  const rupees = Math.round(cents / 100);
  return `Rs ${rupees.toLocaleString("en-IN")}`;
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 py-3 text-sm">
      <div className="text-gray-700">{k}</div>
      <div className="font-semibold text-black">{v}</div>
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gray-600">
        <span className="text-gold [&_svg]:h-4 [&_svg]:w-4">{icon}</span>
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold text-black">{value}</div>
    </div>
  );
}

function IconLine({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-2 text-gray-700">
      <span className="text-gold [&_svg]:h-4 [&_svg]:w-4">{icon}</span>
      <span className="font-medium text-black">{value}</span>
    </div>
  );
}

function BookingDetailPage() {
  const { id } = Route.useParams();
  const b: LocalBooking | undefined = listBookings().find((x) => x.id === id);
  if (!b) throw notFound();
  const room = getRoomById(b.room_id ?? "");
  const hotel = room?.hotelId ? findHotel(room.hotelId) : undefined;
  const amenities = room?.amenities?.slice(0, 8) ?? [];

  return (
    <SiteLayout>
      <div className="mx-auto max-w-5xl px-5 py-10 lg:px-8 lg:py-14">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Link
            to="/my-bookings"
            className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-black"
          >
            <ArrowLeft className="h-4 w-4" /> Back to my bookings
          </Link>
          <h1 className="mt-4 font-display text-4xl font-semibold text-black">Booking details</h1>
          <p className="mt-2 text-sm text-gray-700">
            Reference <span className="font-semibold text-black">{b.reference}</span>
          </p>
        </motion.div>

        <div className="mt-8 overflow-hidden rounded-3xl border border-black/10 bg-white">
          {room?.coverImage ? (
            <img
              src={room.coverImage}
              alt={room.name}
              className="aspect-[16/6] w-full object-cover"
            />
          ) : null}
          <div className="grid gap-8 p-6 lg:grid-cols-[1.15fr_0.85fr] lg:p-8">
            <section>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
                {hotel?.name ?? b.hotel_name}
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-black">
                {room?.name ?? b.room_type_name}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-700">
                {room?.description ?? "Your confirmed premium stay with Haven Host."}
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <InfoCard icon={<Building2 />} label="Hotel" value={hotel?.name ?? b.hotel_name} />
                <InfoCard
                  icon={<MapPin />}
                  label="Location"
                  value={
                    hotel
                      ? `${hotel.city}, ${hotel.country}`
                      : room?.hotelCity
                        ? room.hotelCity
                        : "Configured by hotel"
                  }
                />
                <InfoCard icon={<CalendarDays />} label="Check-in" value={b.check_in} />
                <InfoCard icon={<CalendarDays />} label="Check-out" value={b.check_out} />
                <InfoCard icon={<BedDouble />} label="Nights" value={`${b.nights}`} />
                <InfoCard
                  icon={<Users />}
                  label="Guests"
                  value={`${b.adults + b.children} total (${b.adults} adults, ${b.children} children)`}
                />
              </div>

              {amenities.length ? (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-black">Room amenities</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {amenities.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-black/10 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>

            <aside className="rounded-2xl border border-black/10 bg-gray-50 p-5">
              <h3 className="font-display text-xl font-semibold text-black">Receipt</h3>
              <div className="mt-4 space-y-1">
                <Row k="Reference" v={b.reference} />
                <Row k="Status" v={b.status} />
                <Row k="Payment" v={b.payment_status ?? "paid"} />
                <Row k="Payment ref" v={b.payment_reference ?? "Demo payment"} />
                <Row k="Total" v={`${formatInr(b.total_cents)} ${b.currency}`} />
                <Row k="Created" v={new Date(b.created_at).toLocaleString()} />
              </div>

              <div className="mt-6 border-t border-black/10 pt-5">
                <h3 className="font-display text-xl font-semibold text-black">Guest details</h3>
                <div className="mt-4 space-y-3 text-sm">
                  <IconLine icon={<User />} value={b.guest_full_name} />
                  <IconLine icon={<Mail />} value={b.guest_email} />
                  <IconLine icon={<Phone />} value={b.guest_phone} />
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                <div className="flex items-center gap-2 font-semibold">
                  <BadgeCheck className="h-4 w-4" />
                  Confirmed and paid
                </div>
                <p className="mt-2 text-xs leading-relaxed">
                  Your demo booking is saved locally and will appear under My bookings.
                </p>
              </div>
            </aside>
          </div>
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
