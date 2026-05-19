import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin, Star, PawPrint, Wifi, Sparkles, Bed, Maximize, Users, ArrowRight, Check, X,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { AvailabilityCalendar } from "@/components/site/AvailabilityCalendar";
import { Button } from "@/components/ui/button";
import { findHotel, availableRoomCount } from "@/data/hotels";
import type { RoomType } from "@/types/hotel";

export const Route = createFileRoute("/hotels/$hotelId")({
  loader: ({ params }) => {
    const hotel = findHotel(params.hotelId);
    if (!hotel) throw notFound();
    return { hotel };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.hotel.name} — Maison Noir` },
          { name: "description", content: loaderData.hotel.tagline },
          { property: "og:title", content: loaderData.hotel.name },
          { property: "og:description", content: loaderData.hotel.tagline },
          { property: "og:image", content: loaderData.hotel.heroImage },
        ]
      : [],
  }),
  component: HotelDetailPage,
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-5 py-32 text-center">
        <h1 className="font-display text-4xl">Hotel not found</h1>
        <Link to="/hotels" className="mt-6 inline-block text-gold underline">
          Back to all hotels
        </Link>
      </div>
    </SiteLayout>
  ),
  errorComponent: ({ error }) => (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-5 py-32 text-center">
        <h1 className="font-display text-3xl">Something went wrong</h1>
        <p className="mt-3 text-white/60">{error.message}</p>
      </div>
    </SiteLayout>
  ),
});

function HotelDetailPage() {
  const { hotel } = Route.useLoaderData();
  const [activeRoom, setActiveRoom] = useState<RoomType>(hotel.roomTypes[0]);

  return (
    <SiteLayout>
      {/* Hero gallery */}
      <section className="mx-auto max-w-7xl px-5 lg:px-8 pt-8">
        <div className="grid grid-cols-4 grid-rows-2 gap-2 md:gap-3 rounded-3xl overflow-hidden h-[60vh] min-h-[420px]">
          <img src={hotel.heroImage} alt={hotel.name} className="col-span-4 md:col-span-2 row-span-2 h-full w-full object-cover" />
          {hotel.gallery.slice(0, 4).map((src: string, i: number) => (
            <img key={i} src={src} alt="" className="hidden md:block h-full w-full object-cover" />
          ))}
        </div>
      </section>

      {/* Header */}
      <section className="mx-auto max-w-7xl px-5 lg:px-8 mt-10 grid lg:grid-cols-[1.6fr_1fr] gap-10 items-start">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
            {hotel.country}
          </p>
          <h1 className="mt-3 font-display text-4xl md:text-5xl font-semibold leading-tight">
            {hotel.name}
          </h1>
          <p className="mt-3 text-white/75 text-lg max-w-2xl">{hotel.tagline}</p>

          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-white/70">
            <span className="flex items-center gap-1.5"><Star className="h-4 w-4 fill-gold text-gold" /> {hotel.rating} · {hotel.reviews} reviews</span>
            <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-gold" /> {hotel.address}</span>
            <span className="flex items-center gap-1.5">
              {hotel.petsAllowed ? <PawPrint className="h-4 w-4 text-gold" /> : <X className="h-4 w-4" />}
              {hotel.petsAllowed ? "Pets welcome" : "No pets"}
            </span>
          </div>

          <p className="mt-8 text-white/80 leading-relaxed max-w-2xl">{hotel.description}</p>

          <div className="mt-10 grid sm:grid-cols-2 gap-3">
            {hotel.highlights.map((h: string) => (
              <div key={h} className="flex items-start gap-3 rounded-2xl border border-white/10 p-4">
                <Sparkles className="h-5 w-5 text-gold mt-0.5 shrink-0" />
                <span className="font-medium">{h}</span>
              </div>
            ))}
          </div>

          <h3 className="mt-12 font-display text-xl font-semibold">Amenities</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {hotel.amenities.map((a: string) => (
              <span key={a} className="px-3.5 py-1.5 rounded-full text-sm border border-white/10 bg-white/[0.03] flex items-center gap-2">
                <Wifi className="h-3.5 w-3.5 text-gold" /> {a}
              </span>
            ))}
          </div>
        </div>

        <aside className="lg:sticky lg:top-28">
          <div className="glass-strong rounded-3xl p-6 shadow-elegant">
            <p className="text-xs uppercase tracking-widest text-white/55">From</p>
            <p className="mt-1 font-display text-4xl font-semibold gold-text">
              ₹{hotel.startingPrice.toLocaleString("en-IN")}
              <span className="text-sm font-medium text-white/55 ml-1">/ night</span>
            </p>
            <div className="mt-6 space-y-3 text-sm">
              {hotel.roomTypes.map((rt: RoomType) => (
                <button
                  key={rt.id}
                  onClick={() => setActiveRoom(rt)}
                  className={`w-full text-left rounded-2xl border px-4 py-3 transition ${
                    activeRoom.id === rt.id
                      ? "border-gold bg-gold/10"
                      : "border-white/10 hover:border-white/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{rt.name}</span>
                    <span className="text-gold font-semibold">₹{rt.pricePerNight.toLocaleString("en-IN")}</span>
                  </div>
                  <p className="mt-1 text-xs text-white/60">
                    {rt.rooms.length} rooms · up to {rt.maxAdults} adults
                  </p>
                </button>
              ))}
            </div>
            <Button asChild size="lg" className="mt-6 w-full rounded-full font-semibold h-12">
              <Link to="/booking" search={{ hotel: hotel.slug, room: activeRoom.id } as never}>
                Reserve <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <p className="mt-3 text-[11px] text-center text-white/50">
              You won't be charged yet · Free cancellation up to 48h
            </p>
          </div>
        </aside>
      </section>

      {/* Room types */}
      <section className="mx-auto max-w-7xl px-5 lg:px-8 mt-24">
        <p className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">Rooms</p>
        <h2 className="mt-3 font-display text-3xl md:text-4xl font-semibold">Pick your room.</h2>

        <div className="mt-8 flex gap-2 flex-wrap">
          {hotel.roomTypes.map((rt: RoomType) => (
            <button
              key={rt.id}
              onClick={() => setActiveRoom(rt)}
              className={`px-5 h-11 rounded-full text-sm font-semibold border transition ${
                activeRoom.id === rt.id
                  ? "bg-gold text-black border-gold"
                  : "border-white/15 hover:border-gold hover:text-gold"
              }`}
            >
              {rt.name}
            </button>
          ))}
        </div>

        <motion.div
          key={activeRoom.id}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 grid lg:grid-cols-[1.2fr_1fr] gap-8"
        >
          <div className="rounded-3xl overflow-hidden border border-white/10">
            <img src={activeRoom.image} alt={activeRoom.name} className="aspect-[4/3] w-full object-cover" />
            <div className="p-7">
              <h3 className="font-display text-2xl font-semibold">{activeRoom.name}</h3>
              <p className="mt-2 text-white/70">{activeRoom.description}</p>

              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Spec icon={<Maximize />} label="Size" value={activeRoom.size} />
                <Spec icon={<Bed />} label="Bed" value={activeRoom.bedType} />
                <Spec icon={<Users />} label="Adults" value={`Up to ${activeRoom.maxAdults}`} />
                <Spec icon={<PawPrint />} label="Pets" value={activeRoom.petsAllowed ? "Allowed" : "Not allowed"} />
              </div>

              <h4 className="mt-7 font-display text-sm uppercase tracking-widest text-gold">
                In this room
              </h4>
              <ul className="mt-3 grid sm:grid-cols-2 gap-2 text-sm">
                {activeRoom.amenities.map((a) => (
                  <li key={a} className="flex items-center gap-2 text-white/80">
                    <Check className="h-4 w-4 text-gold" /> {a}
                  </li>
                ))}
              </ul>

              <RoomInventory roomType={activeRoom} />
            </div>
          </div>

          <CalendarSide hotelSlug={hotel.slug} roomType={activeRoom} />
        </motion.div>
      </section>

      <div className="h-24" />
    </SiteLayout>
  );
}

function Spec({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 p-4">
      <span className="text-gold [&_svg]:h-4 [&_svg]:w-4">{icon}</span>
      <p className="mt-2 text-[10px] uppercase tracking-widest text-white/50">{label}</p>
      <p className="mt-0.5 font-medium text-sm">{value}</p>
    </div>
  );
}

function RoomInventory({ roomType }: { roomType: RoomType }) {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div className="mt-7">
      <h4 className="font-display text-sm uppercase tracking-widest text-gold">
        Live inventory · today
      </h4>
      <div className="mt-3 flex flex-wrap gap-2">
        {roomType.rooms.map((r) => {
          const s = r.calendar[today] ?? "available";
          const style =
            s === "available"
              ? "border-gold/60 text-gold bg-gold/5"
              : s === "booked"
                ? "border-destructive/40 text-destructive/90 bg-destructive/5"
                : "border-white/10 text-white/40 bg-white/[0.02]";
          return (
            <span
              key={r.number}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${style}`}
            >
              #{r.number} · {s}
            </span>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-white/55">
        {availableRoomCount(roomType, today)} of {roomType.rooms.length} rooms available today
      </p>
    </div>
  );
}

function CalendarSide({ hotelSlug, roomType }: { hotelSlug: string; roomType: RoomType }) {
  const [date, setDate] = useState<string>();
  const navigate = useNavigate();
  return (
    <div className="lg:sticky lg:top-28 self-start space-y-4">
      <AvailabilityCalendar roomType={roomType} value={date} onSelect={setDate} />
      <Button
        size="lg"
        disabled={!date}
        onClick={() =>
          navigate({
            to: "/booking",
            search: { hotel: hotelSlug, room: roomType.id, date } as never,
          })
        }
        className="w-full rounded-full font-semibold h-12"
      >
        {date ? `Reserve for ${date}` : "Pick a date to continue"}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
