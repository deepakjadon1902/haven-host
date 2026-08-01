import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, CalendarDays, Crown, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { partnerBookings, partnerHotel, partnerRooms } from "@/lib/partner.functions";

export const Route = createFileRoute("/partner/")({
  component: PartnerDashboard,
});

function PartnerDashboard() {
  const hotel = partnerHotel();
  const rooms = partnerRooms();
  const bookings = partnerBookings();
  const activeRooms = rooms.filter((room) => room.active);
  const revenue = bookings
    .filter((booking) => booking.status !== "cancelled")
    .reduce((sum, booking) => sum + booking.total_cents, 0);

  const stats = [
    { label: "Subscription", value: hotel.subscriptionTier, icon: Crown },
    { label: "Published rooms", value: activeRooms.length, icon: Package },
    { label: "Bookings", value: bookings.length, icon: CalendarDays },
    { label: "Revenue", value: `₹${(revenue / 100).toLocaleString("en-IN")}`, icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
            Partner dashboard
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold">{hotel.name}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-black/60">
            This panel controls only this hotel. Your rooms and inventory publish into the main
            Haven Host marketplace under your hotel listing.
          </p>
        </div>
        <img src={hotel.image} alt={hotel.name} className="h-48 w-full rounded-3xl object-cover" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-3xl border border-black/10 bg-white p-6">
              <Icon className="h-5 w-5 text-gold" />
              <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-black/50">
                {stat.label}
              </p>
              <p className="mt-2 font-display text-3xl font-semibold capitalize">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <section className="rounded-3xl border border-black/10 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-display text-2xl font-semibold">Your room types</h2>
          <Button asChild className="rounded-full">
            <Link to="/partner/rooms">Manage rooms</Link>
          </Button>
        </div>
        <div className="mt-5 grid gap-3">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="grid gap-4 rounded-2xl border border-black/10 bg-[#fafafa] p-4 md:grid-cols-[80px_1fr_auto] md:items-center"
            >
              <img
                src={room.coverImage}
                alt={room.name}
                className="h-20 w-20 rounded-xl object-cover"
              />
              <div>
                <p className="font-display text-lg font-semibold">{room.name}</p>
                <p className="text-sm text-black/60">{room.description}</p>
              </div>
              <p className="font-display text-2xl font-semibold">
                ₹{room.pricePerNight.toLocaleString("en-IN")}
              </p>
            </div>
          ))}
          {rooms.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-black/15 p-6 text-sm text-black/60">
              No rooms yet. Create your first room type from My rooms.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
