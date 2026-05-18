import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, MapPin, Sparkles, Users } from "lucide-react";
import { useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { HotelCard } from "@/components/site/HotelCard";
import { Button } from "@/components/ui/button";
import { hotels } from "@/data/hotels";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Maison Noir — Curated luxury hotels with live inventory" },
      { name: "description", content: "Book hand-picked design hotels with real-time room availability, transparent rates, and elegant booking." },
      { property: "og:title", content: "Maison Noir — Curated luxury hotels" },
      { property: "og:description", content: "Hand-picked design hotels with live inventory." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <SiteLayout>
      <Hero />
      <Featured />
      <Experience />
      <Stats />
      <CTA />
    </SiteLayout>
  );
}

function Hero() {
  const navigate = useNavigate();
  const [city, setCity] = useState("");

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden -mt-16 lg:-mt-20 pt-16 lg:pt-20">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2400&q=80"
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/65 to-black/85" />
        <div className="absolute inset-0 hero-radial opacity-40" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8 w-full py-20">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs uppercase tracking-[0.3em] text-gold font-semibold flex items-center gap-2"
        >
          <Sparkles className="h-3.5 w-3.5" /> Curated · Live inventory · Zero noise
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6 font-display font-semibold text-5xl md:text-7xl lg:text-[5.5rem] leading-[0.95] max-w-5xl"
        >
          Stay somewhere<br />
          <span className="gold-text italic font-serif">extraordinary.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="mt-6 text-lg md:text-xl text-white/80 max-w-2xl leading-relaxed"
        >
          A private collection of design-led hotels across India, Morocco, Japan and Italy —
          bookable with real-time room availability and no hidden fees.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26 }}
          className="mt-10 glass-strong rounded-2xl p-3 md:p-4 max-w-3xl shadow-elegant"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              navigate({ to: "/hotels", search: { city: city || undefined } as never });
            }}
            className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr_auto] gap-2"
          >
            <Field icon={<MapPin className="h-4 w-4" />} label="Destination">
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Vrindavan, Kyoto…"
                className="w-full bg-transparent outline-none text-sm font-medium placeholder:text-white/40"
              />
            </Field>
            <Field icon={<Calendar className="h-4 w-4" />} label="Check-in">
              <input type="date" className="w-full bg-transparent outline-none text-sm font-medium [color-scheme:dark]" />
            </Field>
            <Field icon={<Users className="h-4 w-4" />} label="Guests">
              <select className="w-full bg-transparent outline-none text-sm font-medium [color-scheme:dark]">
                <option>2 adults</option>
                <option>1 adult</option>
                <option>2 adults, 1 child</option>
                <option>3 adults</option>
              </select>
            </Field>
            <Button type="submit" size="lg" className="rounded-xl font-semibold h-full md:px-6">
              Search <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </motion.div>
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
    <label className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 hover:border-gold/40 transition">
      <span className="text-gold">{icon}</span>
      <span className="flex-1 min-w-0">
        <span className="block text-[10px] uppercase tracking-widest text-white/50 font-semibold">
          {label}
        </span>
        {children}
      </span>
    </label>
  );
}

function Featured() {
  return (
    <section className="mx-auto max-w-7xl px-5 lg:px-8 py-24">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
            The collection
          </p>
          <h2 className="mt-3 text-4xl md:text-5xl font-display font-semibold max-w-xl leading-tight">
            Hotels you'd <span className="gold-text italic">return to.</span>
          </h2>
        </div>
        <Button asChild variant="outline" className="rounded-full border-white/20 hover:border-gold hover:bg-transparent hover:text-gold">
          <Link to="/hotels">View all <ArrowRight className="h-4 w-4" /></Link>
        </Button>
      </div>

      <div className="grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {hotels.slice(0, 3).map((h, i) => (
          <HotelCard key={h.id} hotel={h} index={i} />
        ))}
      </div>
    </section>
  );
}

function Experience() {
  const items = [
    { title: "Live inventory", body: "Every room number is tracked individually. What you see is genuinely available — never overbooked." },
    { title: "Transparent pricing", body: "No bait rates. Taxes, fees and offers are calculated upfront, in your currency." },
    { title: "Concierge-grade support", body: "A real human, reachable in under 60 seconds — before, during, and after your stay." },
  ];
  return (
    <section className="border-y border-white/10 bg-[color-mix(in_oklab,var(--surface)_50%,black)]">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-24 grid lg:grid-cols-[1fr_1.4fr] gap-16 items-start">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">Why MaisonNoir</p>
          <h2 className="mt-3 text-4xl md:text-5xl font-display font-semibold leading-tight">
            A booking experience that <span className="gold-text italic">respects you.</span>
          </h2>
          <p className="mt-5 text-white/70 leading-relaxed max-w-md">
            Built from the ground up to feel like the kind of hotel you actually want to stay in —
            quiet, considered, and immaculately run.
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
              className="rounded-2xl border border-white/10 p-7 hover:border-gold/60 hover:bg-white/[0.02] transition-all"
            >
              <div className="flex items-baseline gap-4">
                <span className="font-display text-2xl gold-text">0{i + 1}</span>
                <div>
                  <h3 className="font-display text-xl font-semibold">{it.title}</h3>
                  <p className="mt-2 text-white/70 text-sm leading-relaxed">{it.body}</p>
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
    { v: "42", l: "Hotels" },
    { v: "18", l: "Countries" },
    { v: "120K+", l: "Nights booked" },
    { v: "4.9", l: "Guest rating" },
  ];
  return (
    <section className="mx-auto max-w-7xl px-5 lg:px-8 py-20 grid grid-cols-2 md:grid-cols-4 gap-6">
      {stats.map((s) => (
        <div key={s.l} className="rounded-2xl border border-white/10 p-8 text-center">
          <p className="font-display text-4xl md:text-5xl font-semibold gold-text">{s.v}</p>
          <p className="mt-2 text-xs uppercase tracking-widest text-white/60">{s.l}</p>
        </div>
      ))}
    </section>
  );
}

function CTA() {
  return (
    <section className="mx-auto max-w-7xl px-5 lg:px-8 py-24">
      <div className="relative overflow-hidden rounded-3xl border border-gold/30 p-10 md:p-16 hero-radial">
        <div className="max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-display font-semibold leading-tight">
            Reserve your next chapter.
          </h2>
          <p className="mt-4 text-white/75 text-lg">
            From the riverside ghats of Vrindavan to a moonlit riad in Marrakech.
          </p>
          <Button asChild size="lg" className="mt-8 rounded-full font-semibold h-12 px-7">
            <Link to="/hotels">Browse hotels <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
