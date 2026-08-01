import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { RoomCard } from "@/components/site/RoomCard";
import { Button } from "@/components/ui/button";
import type { Hotel, Room } from "@/types/room";
import { listPublicHotels, listPublicRooms } from "@/lib/rooms.functions";
import { useAppDataRefresh } from "@/hooks/useAppDataRefresh";
import { findHotel } from "@/lib/local-store";

type Search = { q?: string; hotel?: string };

export const Route = createFileRoute("/rooms/")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s.q === "string" ? s.q : undefined,
    hotel: typeof s.hotel === "string" ? s.hotel : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Rooms - Haven Host" },
      {
        name: "description",
        content: "Explore premium hotel room types with live availability and transparent pricing.",
      },
    ],
  }),
  component: RoomsPage,
});

function RoomsPage() {
  const search = Route.useSearch();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "active">("active");
  const selectedHotel = search.hotel ? findHotel(search.hotel) : undefined;
  const dataRefreshVersion = useAppDataRefresh(5_000);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await listPublicRooms();
        const hotelData = await listPublicHotels();
        setRooms(data);
        setHotels(hotelData);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load rooms");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [dataRefreshVersion]);

  const filteredRooms = useMemo(() => {
    let list = rooms.slice();
    if (selectedFilter === "active") list = list.filter((r) => r.active);
    if (selectedHotel) list = list.filter((r) => r.hotelId === selectedHotel.id);
    if (search.q?.trim()) {
      const q = search.q.trim().toLowerCase();
      list = list.filter((r) =>
        (r.name + " " + r.description + " " + (r.hotelName ?? "") + " " + (r.hotelCity ?? ""))
          .toLowerCase()
          .includes(q),
      );
    }
    return list;
  }, [rooms, search.q, selectedFilter, selectedHotel]);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
            {selectedHotel ? selectedHotel.name : "Premium room types"}
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-black md:text-5xl">
            {selectedHotel ? "Room types under this hotel." : "Rooms for a royal stay."}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-700">
            Browse hotel-owned room types, compare prices and amenities, then book only dates that
            remain available in the inventory calendar.
          </p>
        </motion.div>

        <div className="mb-8 flex flex-wrap items-center gap-3">
          <Button
            variant={selectedFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter("all")}
            className="rounded-lg"
          >
            All rooms
          </Button>
          <Button
            variant={selectedFilter === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter("active")}
            className="rounded-lg"
          >
            Active only
          </Button>
          <span className="mx-1 hidden h-6 w-px bg-black/10 sm:block" />
          {hotels.map((hotel) => (
            <Button
              key={hotel.id}
              asChild
              variant={selectedHotel?.id === hotel.id ? "default" : "outline"}
              size="sm"
              className="rounded-lg"
            >
              <Link to="/rooms" search={{ hotel: hotel.slug } as never}>
                {hotel.city}
              </Link>
            </Button>
          ))}
          {selectedHotel ? (
            <Button asChild variant="ghost" size="sm" className="rounded-lg">
              <Link to="/rooms">Clear hotel</Link>
            </Button>
          ) : null}
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-700">Loading rooms...</div>
        ) : filteredRooms.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="grid gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3"
          >
            {filteredRooms.map((room, i) => (
              <RoomCard key={room.id} room={room} index={i} />
            ))}
          </motion.div>
        ) : (
          <div className="py-20 text-center text-gray-700">
            <p className="text-lg">No rooms found.</p>
            <Button asChild variant="outline" className="mt-6 rounded-lg">
              <Link to="/hotels">Browse hotels</Link>
            </Button>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
