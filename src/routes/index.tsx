import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Search, Sparkles, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { RoomCard } from "@/components/site/RoomCard";
import { Button } from "@/components/ui/button";
import type { Room } from "@/types/room";
import { listPublicRooms } from "@/lib/rooms.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Maison Noir — Royal rooms with live availability" },
      {
        name: "description",
        content: "A single hotel with room showcase, live inventory, and a clean, royal booking experience.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

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
  }, []);

  return (
    <SiteLayout>
      <Hero />
      <Featured rooms={rooms} loading={loading} />
      <Why />
      <Stats />
      <CTA />
    </SiteLayout>
  );
}

function Hero() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [checkIn, setCheckIn] = useState<string>("");
  const [guests, setGuests] = useState(2);

  return (
    <section className="relative -mt-16 flex min-h-[92vh] items-center overflow-hidden pt-16 lg:-mt-20 lg:pt-20">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2400&q=80"
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/70 to-black/95" />
        <div className="absolute inset-0 hero-radial opacity-35" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-5 py-20 lg:px-8">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-gold"
        >
          <Sparkles className="h-3.5 w-3.5" /> Single hotel · Live inventory · Royal stay
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6 max-w-5xl font-display text-5xl font-semibold leading-[0.95] text-white md:text-7xl lg:text-[5.5rem]"
        >
          Maison Noir,{" "}
          <span className="gold-text italic font-serif">crafted for calm.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80 md:text-xl"
        >
          Rooms are managed by the owner in the admin panel — guests book only what’s truly available.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26 }}
          className="mt-10 max-w-3xl rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur md:p-4"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const search: Record<string, string> = {};
              if (q.trim()) search.q = q.trim();
              navigate({ to: "/rooms", search: search as never });
            }}
            className="grid grid-cols-1 gap-2 md:grid-cols-[1.4fr_1fr_1fr_auto]"
          >
            <Field icon={<Search className="h-4 w-4" />} label="Search rooms">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Suite, villa, garden..."
                className="w-full bg-transparent text-sm font-medium text-white outline-none placeholder:text-white/40"
              />
            </Field>
            <Field icon={<Calendar className="h-4 w-4" />} label="Check-in">
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full bg-transparent text-sm font-medium text-white outline-none [color-scheme:dark]"
              />
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
            <Button type="submit" size="lg" className="h-full rounded-xl font-semibold md:px-6">
              Browse <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <label className="flex items-center gap-3 rounded-xl border border-white/15 bg-black/15 px-4 py-3">
      <span className="text-gold">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-semibold uppercase tracking-widest text-white/55">{label}</span>
        {children}
      </span>
    </label>
  );
}

function Featured({ rooms, loading }: { rooms: Room[]; loading: boolean }) {
  const featured = useMemo(() => rooms.slice().sort((a, b) => a.sortOrder - b.sortOrder).slice(0, 3), [rooms]);

  return (
    <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Rooms</p>
          <h2 className="mt-3 max-w-xl font-display text-4xl font-semibold leading-tight text-black md:text-5xl">
            Designed for a{" "}
            <span className="gold-text italic">royal rest.</span>
          </h2>
        </div>
        <Button asChild variant="outline" className="rounded-full border-black/15 text-black hover:border-gold hover:text-gold">
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

function Why() {
  const items = [
    { title: "Owner-controlled inventory", body: "Rooms, units, and maintenance blocks are managed in the admin panel." },
    { title: "Calendar-aligned booking", body: "Bookings reduce availability per day. Full days become read-only booked." },
    { title: "Transparent totals", body: "Clear pricing with taxes shown before confirmation." },
  ];

  return (
    <section className="border-t border-black/10 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-[1fr_1.4fr] lg:gap-16 lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Why Maison Noir</p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-black md:text-5xl">
            Calm, clean,{" "}
            <span className="gold-text italic">royal</span>.
          </h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-gray-700">
            A single-property system: the hotel owner controls rooms, availability, and bookings — guests get a smooth experience.
          </p>
        </div>
        <div className="grid gap-4">
          {items.map((it, i) => (
            <motion.div
              key={it.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="rounded-2xl border border-black/10 bg-white p-7"
            >
              <div className="flex items-baseline gap-4">
                <span className="gold-text font-display text-2xl">0{i + 1}</span>
                <div>
                  <h3 className="font-display text-xl font-semibold text-black">{it.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-700">{it.body}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const stats = [
    { v: "1", l: "Hotel" },
    { v: "Live", l: "Inventory" },
    { v: "0", l: "Overbooks" },
    { v: "Royal", l: "Experience" },
  ];
  return (
    <section className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-5 py-16 md:grid-cols-4 lg:px-8">
      {stats.map((s) => (
        <div key={s.l} className="rounded-2xl border border-black/10 bg-white p-8 text-center">
          <p className="gold-text font-display text-4xl font-semibold md:text-5xl">{s.v}</p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-gray-700">{s.l}</p>
        </div>
      ))}
    </section>
  );
}

function CTA() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-gold/30 bg-white p-10 md:p-16">
        <div className="max-w-2xl">
          <h2 className="font-display text-4xl font-semibold leading-tight text-black md:text-5xl">
            Ready to book?
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-gray-700">
            Browse rooms, pick dates, and confirm only what’s available.
          </p>
          <Button asChild size="lg" className="mt-8 h-12 rounded-full px-7 font-semibold">
            <Link to="/rooms">
              Browse rooms <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
