import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { RoomCard } from "@/components/site/RoomCard";
import { Button } from "@/components/ui/button";
import type { Room } from "@/types/room";
import { listPublicRooms } from "@/lib/rooms.functions";

type Search = { q?: string };

export const Route = createFileRoute("/rooms/")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s.q === "string" ? s.q : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Rooms â€” Maison Noir" },
      {
        name: "description",
        content: "Explore our rooms with live availability and transparent pricing.",
      },
    ],
  }),
  component: RoomsPage,
});

function RoomsPage() {
  const search = Route.useSearch();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "active">("all");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await listPublicRooms();
        setRooms(data);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load rooms");
      } finally {
        setLoading(false);
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    load();
  }, []);

  const filteredRooms = useMemo(() => {
    let list = rooms.slice();
    if (selectedFilter === "active") list = list.filter((r) => r.active);
    if (search.q?.trim()) {
      const q = search.q.trim().toLowerCase();
      list = list.filter((r) => (r.name + " " + r.description).toLowerCase().includes(q));
    }
    return list;
  }, [rooms, search.q, selectedFilter]);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Maison Noir</p>
          <h1 className="mt-2 text-4xl font-display font-semibold text-black md:text-5xl">
            Rooms for a <span className="gold-text italic">royal stay.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-gray-700">
            A single hotel, run by one owner â€” manage inventory in the admin panel and book with
            live availability.
          </p>
        </motion.div>

        <div className="mb-8 flex flex-wrap items-center gap-3">
          <Button
            variant={selectedFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter("all")}
            className="rounded-full"
          >
            All rooms
          </Button>
          <Button
            variant={selectedFilter === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter("active")}
            className="rounded-full"
          >
            Active only
          </Button>
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
            <Button
              asChild
              variant="outline"
              className="mt-6 rounded-full border-black/15 text-black hover:bg-gray-50"
            >
              <Link to="/">Back home</Link>
            </Button>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
