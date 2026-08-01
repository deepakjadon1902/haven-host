import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Crown, MapPin, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import type { Hotel } from "@/types/room";
import { listPublicHotels, listPublicRooms } from "@/lib/rooms.functions";

export const Route = createFileRoute("/hotels")({
  head: () => ({
    meta: [
      { title: "Premium Hotels - Haven Host" },
      {
        name: "description",
        content: "Browse premium partner hotels and room types with live booking flows.",
      },
    ],
  }),
  component: HotelsPage,
});

function HotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [roomCounts, setRoomCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const load = async () => {
      const [hotelData, rooms] = await Promise.all([listPublicHotels(), listPublicRooms()]);
      setHotels(hotelData);
      setRoomCounts(
        rooms.reduce<Record<string, number>>((acc, room) => {
          if (room.hotelId) acc[room.hotelId] = (acc[room.hotelId] ?? 0) + 1;
          return acc;
        }, {}),
      );
    };
    load();
  }, []);
  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              Partner hotels
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-black md:text-6xl">
              Curated hotels with room types ready to book.
            </h1>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-gray-700 lg:justify-self-end">
            Each property belongs to a subscription tier, can manage its own inventory, and
            publishes room types with live availability logic. Guests see a polished marketplace;
            partners get a business-grade control surface.
          </p>
        </div>

        <div className="mt-12 grid gap-7 lg:grid-cols-3">
          {hotels.map((hotel, index) => {
            const roomCount = roomCounts[hotel.id] ?? 0;
            return (
              <motion.article
                key={hotel.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                className="premium-card overflow-hidden rounded-lg"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  <img src={hotel.image} alt={hotel.name} className="h-full w-full object-cover" />
                  <div className="absolute left-4 top-4 rounded-md border border-white/30 bg-black/55 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur">
                    {hotel.subscriptionTier} partner
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-display text-2xl font-semibold text-black">
                        {hotel.name}
                      </h2>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-700">
                        <MapPin className="h-4 w-4 text-gold" />
                        {hotel.city}, {hotel.country}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 rounded-md bg-black px-3 py-1 text-xs font-semibold text-white">
                      <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                      {hotel.rating}
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-gray-700">{hotel.tagline}</p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {hotel.featuredAmenities.slice(0, 3).map((amenity) => (
                      <span
                        key={amenity}
                        className="rounded-md border border-black/10 bg-surface px-3 py-1 text-xs font-medium text-black"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-black/10 pt-5">
                    <span className="flex items-center gap-2 text-sm font-semibold text-black">
                      <Crown className="h-4 w-4 text-gold" />
                      {roomCount} room types
                    </span>
                    <Button asChild className="rounded-lg">
                      <Link to="/rooms" search={{ hotel: hotel.slug } as never}>
                        View rooms <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>
    </SiteLayout>
  );
}
