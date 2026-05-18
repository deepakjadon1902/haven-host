import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";
import { HotelCard } from "@/components/site/HotelCard";
import { hotels } from "@/data/hotels";

type Search = { city?: string };

export const Route = createFileRoute("/hotels/")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    city: typeof s.city === "string" ? s.city : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Hotels — Maison Noir" },
      { name: "description", content: "Browse our curated collection of design hotels with real-time availability." },
    ],
  }),
  component: HotelsListPage,
});

function HotelsListPage() {
  const { city } = Route.useSearch();
  const [q, setQ] = useState(city ?? "");
  const [pets, setPets] = useState(false);
  const [sort, setSort] = useState<"rating" | "price-asc" | "price-desc">("rating");

  const filtered = useMemo(() => {
    let list = hotels.filter((h) => {
      if (q && !`${h.name} ${h.city} ${h.country}`.toLowerCase().includes(q.toLowerCase()))
        return false;
      if (pets && !h.petsAllowed) return false;
      return true;
    });
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    if (sort === "price-asc") list = [...list].sort((a, b) => a.startingPrice - b.startingPrice);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.startingPrice - a.startingPrice);
    return list;
  }, [q, pets, sort]);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="The collection"
        title="Hotels with character."
        description="A small, hand-picked roster — every property visited, every room photographed in natural light."
      />

      <section className="mx-auto max-w-7xl px-5 lg:px-8 py-12">
        <div className="glass-strong rounded-2xl p-4 md:p-5 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <label className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 flex-1 max-w-md">
            <Search className="h-4 w-4 text-gold" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by city, country, or hotel"
              className="w-full bg-transparent outline-none text-sm font-medium placeholder:text-white/40"
            />
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setPets((v) => !v)}
              className={`px-4 h-10 rounded-full text-sm font-medium border transition ${
                pets
                  ? "bg-gold text-black border-gold"
                  : "border-white/15 text-white/80 hover:border-gold hover:text-gold"
              }`}
            >
              Pet-friendly
            </button>
            <div className="flex items-center gap-2 px-4 h-10 rounded-full border border-white/15 text-sm">
              <SlidersHorizontal className="h-4 w-4 text-gold" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="bg-transparent outline-none font-medium [color-scheme:dark]"
              >
                <option value="rating">Top rated</option>
                <option value="price-asc">Price: low → high</option>
                <option value="price-desc">Price: high → low</option>
              </select>
            </div>
          </div>
        </div>

        <p className="mt-6 text-sm text-white/55">
          {filtered.length} {filtered.length === 1 ? "hotel" : "hotels"} found
        </p>

        {filtered.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-dashed border-white/15 p-16 text-center">
            <p className="font-display text-2xl">Nothing matches that.</p>
            <p className="mt-2 text-white/60 text-sm">Try a different city or remove filters.</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((h, i) => (
              <HotelCard key={h.id} hotel={h} index={i} />
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
