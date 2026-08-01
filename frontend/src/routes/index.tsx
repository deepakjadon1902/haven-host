import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Calendar,
  Crown,
  Hotel,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { RoomCard } from "@/components/site/RoomCard";
import { Button } from "@/components/ui/button";
import type { Hotel as HotelRecord, Room } from "@/types/room";
import { listPublicHotels, listPublicRooms } from "@/lib/rooms.functions";
import { useAppDataRefresh } from "@/hooks/useAppDataRefresh";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Haven Host - Premium hotel room marketplace" },
      {
        name: "description",
        content:
          "A subscription-based premium hotel marketplace with room-type listings, partner tools, admin controls, and live availability.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const dataRefreshVersion = useAppDataRefresh(5_000);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await listPublicRooms();
        setRooms(data.filter((r) => r.active));
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load rooms");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [dataRefreshVersion]);

  return (
    <SiteLayout>
      <Hero />
      <HotelStrip />
      <Featured rooms={rooms} loading={loading} />
      <Subscription />
      <Stats />
      <CTA />
    </SiteLayout>
  );
}

function Hero() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [hotel, setHotel] = useState("");
  const [hotels, setHotels] = useState<HotelRecord[]>([]);

  useEffect(() => {
    listPublicHotels()
      .then(setHotels)
      .catch(() => setHotels([]));
  }, []);
  const [guests, setGuests] = useState(2);

  return (
    <section className="relative -mt-16 flex min-h-[92vh] items-center overflow-hidden pt-16 lg:-mt-20 lg:pt-20">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=2400&q=80"
          alt=""
          className="h-full w-full object-cover brightness-[0.58] saturate-90 contrast-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/65 to-black/95" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-5 py-20 lg:px-8">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-gold"
        >
          <ShieldCheck className="h-3.5 w-3.5" /> Premium hotels / Room types / Partner
          subscriptions
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6 max-w-5xl font-display text-5xl font-semibold leading-[0.95] text-white md:text-7xl lg:text-[5.5rem]"
        >
          Haven Host, <span className="gold-text italic font-serif">built for premium stays.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="mt-6 max-w-2xl text-lg leading-relaxed text-white/82 md:text-xl"
        >
          Guests discover curated hotels and room types. Partners subscribe for visibility,
          inventory controls, and a refined booking operation.
        </motion.p>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26 }}
          onSubmit={(e) => {
            e.preventDefault();
            const search: Record<string, string> = {};
            if (q.trim()) search.q = q.trim();
            if (hotel) search.hotel = hotel;
            navigate({ to: "/rooms", search: search as never });
          }}
          className="mt-10 grid max-w-4xl grid-cols-1 gap-2 rounded-lg border border-white/20 bg-white/10 p-3 backdrop-blur md:grid-cols-[1.25fr_1fr_1fr_auto] md:p-4"
        >
          <Field icon={<Search className="h-4 w-4" />} label="Find a room">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Suite, onsen, palace..."
              className="w-full bg-transparent text-sm font-medium text-white outline-none placeholder:text-white/40"
            />
          </Field>
          <Field icon={<Hotel className="h-4 w-4" />} label="Hotel">
            <select
              value={hotel}
              onChange={(e) => setHotel(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-white outline-none [color-scheme:dark]"
            >
              <option value="">All hotels</option>
              {hotels.map((h) => (
                <option key={h.id} value={h.slug}>
                  {h.city}
                </option>
              ))}
            </select>
          </Field>
          <Field icon={<Users className="h-4 w-4" />} label="Guests">
            <select
              value={String(guests)}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full bg-transparent text-sm font-medium text-white outline-none [color-scheme:dark]"
            >
              <option value="1">1 guest</option>
              <option value="2">2 guests</option>
              <option value="3">3 guests</option>
              <option value="4">4 guests</option>
            </select>
          </Field>
          <Button type="submit" size="lg" className="h-full rounded-lg font-semibold md:px-6">
            Browse <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.form>
      </div>
    </section>
  );
}

function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-center gap-3 rounded-lg border border-white/15 bg-black/15 px-4 py-3">
      <span className="text-gold">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-semibold uppercase tracking-widest text-white/55">
          {label}
        </span>
        {children}
      </span>
    </label>
  );
}

function HotelStrip() {
  const [hotels, setHotels] = useState<HotelRecord[]>([]);

  useEffect(() => {
    listPublicHotels()
      .then(setHotels)
      .catch(() => setHotels([]));
  }, []);

  return (
    <section className="border-b border-black/10 bg-white">
      <div className="mx-auto grid max-w-7xl gap-4 px-5 py-8 md:grid-cols-3 lg:px-8">
        {hotels.map((hotel) => (
          <Link
            key={hotel.id}
            to="/rooms"
            search={{ hotel: hotel.slug } as never}
            className="premium-card group flex items-center gap-4 rounded-lg p-3 transition hover:border-gold"
          >
            <img
              src={hotel.image}
              alt={hotel.name}
              className="h-20 w-24 rounded-md object-cover"
              loading="lazy"
            />
            <span className="min-w-0">
              <span className="block truncate font-display text-lg font-semibold text-black group-hover:text-gold">
                {hotel.name}
              </span>
              <span className="mt-1 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                {hotel.subscriptionTier} partner / {hotel.city}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Featured({ rooms, loading }: { rooms: Room[]; loading: boolean }) {
  const featured = useMemo(
    () =>
      rooms
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .slice(0, 3),
    [rooms],
  );

  return (
    <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Featured</p>
          <h2 className="mt-3 max-w-xl font-display text-4xl font-semibold leading-tight text-black md:text-5xl">
            Room types guests can trust before they book.
          </h2>
        </div>
        <Button asChild variant="outline" className="rounded-lg border-black/15">
          <Link to="/rooms">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="py-14 text-center text-gray-700">Loading rooms...</div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3">
          {featured.map((room, i) => (
            <RoomCard key={room.id} room={room} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}

function Subscription() {
  const plans = [
    { name: "Starter", price: "₹9,999", body: "Room listings, booking calendar, guest records." },
    {
      name: "Signature",
      price: "₹24,999",
      body: "Priority discovery, offers, analytics, partner support.",
    },
    {
      name: "Black",
      price: "₹49,999",
      body: "Top placement, concierge routing, premium campaign slots.",
    },
  ];

  return (
    <section className="border-y border-black/10 bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
            Subscription engine
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold text-black md:text-5xl">
            A premium business model for hotel partners.
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-gray-700">
            Partners pay for platform access, visibility, and operational tools. The admin panel
            controls the marketplace; the partner panel helps each hotel understand its pipeline.
          </p>
          <Button asChild className="mt-8 rounded-lg">
            <Link to="/partner">
              Open partner panel <Crown className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.name} className="premium-card rounded-lg p-6">
              <span className="premium-icon h-10 w-10 rounded-lg">
                <BadgeCheck className="h-5 w-5" />
              </span>
              <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-gold">
                {plan.name}
              </p>
              <p className="mt-3 font-display text-3xl font-semibold text-black">{plan.price}</p>
              <p className="mt-3 text-sm leading-relaxed text-gray-700">{plan.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const stats = [
    { v: "3", l: "Partner hotels" },
    { v: "5", l: "Room types" },
    { v: "Live", l: "Inventory" },
    { v: "Premium", l: "Subscriptions" },
  ];
  return (
    <section className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-5 py-16 md:grid-cols-4 lg:px-8">
      {stats.map((s) => (
        <div key={s.l} className="premium-card rounded-lg p-8 text-center">
          <p className="gold-text font-display text-4xl font-semibold md:text-5xl">{s.v}</p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-gray-700">
            {s.l}
          </p>
        </div>
      ))}
    </section>
  );
}

function CTA() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
      <div className="relative overflow-hidden rounded-lg border border-gold/30 bg-black p-10 text-white shadow-elegant md:p-16">
        <div className="max-w-2xl">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
            <Calendar className="h-4 w-4" />
            Book with confidence
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-tight md:text-5xl">
            Choose a hotel, select a room type, and reserve available dates.
          </h2>
          <Button
            asChild
            size="lg"
            className="mt-8 h-12 rounded-lg bg-white px-7 font-semibold text-black hover:bg-white/90"
          >
            <Link to="/hotels">
              Browse hotels <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
