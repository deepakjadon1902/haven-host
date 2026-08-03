import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Bed, MapPin, PawPrint, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import type { RoomAvailabilityMap, Room } from "@/types/room";
import { getPublicRoom, getRoomAvailability } from "@/lib/rooms.functions";
import { useAppDataRefresh } from "@/hooks/useAppDataRefresh";

export const Route = createFileRoute("/rooms/$slug")({
  head: ({ params }) => ({
    meta: [{ title: `Room — ${params.slug} — Maison Noir` }],
  }),
  component: RoomDetailPage,
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-5 py-32 text-center">
        <h1 className="font-display text-4xl text-black">Room not found</h1>
        <p className="mt-3 text-gray-700">The room you’re looking for doesn’t exist.</p>
        <Button asChild className="mt-6 rounded-full font-semibold">
          <Link to="/rooms">Browse rooms</Link>
        </Button>
      </div>
    </SiteLayout>
  ),
});

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function addDaysIso(fromIso: string, days: number) {
  const d = new Date(fromIso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function RoomDetailPage() {
  const { slug } = Route.useParams();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState<RoomAvailabilityMap | null>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const dataRefreshVersion = useAppDataRefresh(5_000);
  const roomId = room?.id;

  const isNotFoundError = (err: unknown): err is { isNotFound: true } =>
    !!err && typeof err === "object" && "isNotFound" in err;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const r = await getPublicRoom({ slug });
        if (!r) throw notFound();
        setRoom(r);
      } catch (error) {
        if (isNotFoundError(error)) throw error;
        toast.error(error instanceof Error ? error.message : "Failed to load room");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug, dataRefreshVersion]);

  useEffect(() => {
    if (!roomId) return;
    const load = async () => {
      setAvailabilityLoading(true);
      try {
        const from = todayIso();
        const data = await getRoomAvailability({ roomId, from, days: 60 });
        setAvailability(data);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load availability");
      } finally {
        setAvailabilityLoading(false);
      }
    };
    load();
  }, [roomId, dataRefreshVersion]);

  const previewDays = useMemo(() => {
    const from = todayIso();
    return Array.from({ length: 30 }, (_, i) => addDaysIso(from, i));
  }, []);

  if (loading) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-5 py-32 text-center text-gray-700">Loading room…</div>
      </SiteLayout>
    );
  }

  if (!room) {
    throw notFound();
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Link
            to="/rooms"
            className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-black"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to rooms
          </Link>
        </motion.div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="relative mb-6 aspect-[4/3] overflow-hidden rounded-3xl border border-black/10 bg-gray-50">
              {room.coverImage ? (
                <img src={room.coverImage} alt={room.name} className="h-full w-full object-cover" />
              ) : null}
            </div>

            {room.images.length > 1 ? (
              <div className="mb-8 grid grid-cols-3 gap-4">
                {room.images.slice(0, 3).map((img, i) => (
                  <div
                    key={i}
                    className="aspect-square overflow-hidden rounded-xl border border-black/10 bg-gray-50"
                  >
                    <img
                      src={img}
                      alt={`${room.name} ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : null}

            <div className="space-y-6">
              <div>
                <h1 className="font-display text-4xl font-semibold text-black md:text-5xl">
                  {room.name}
                </h1>
                {room.hotelName ? (
                  <p className="mt-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gold">
                    <MapPin className="h-4 w-4" />
                    {room.hotelName}
                    {room.hotelCity ? ` · ${room.hotelCity}` : ""}
                  </p>
                ) : null}
                <p className="mt-3 text-sm text-gray-700">{room.description}</p>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white p-8">
                <h3 className="font-display text-xl font-semibold text-black">Room Features</h3>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-black">
                  {room.bedType ? (
                    <div className="flex items-center gap-3">
                      <Bed className="h-5 w-5 text-gold" />
                      <span>{room.bedType}</span>
                    </div>
                  ) : null}
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-gold" />
                    <span>
                      Up to {room.maxAdults} adult{room.maxAdults !== 1 ? "s" : ""}{" "}
                      {room.maxChildren ? `+ ${room.maxChildren} child` : ""}
                    </span>
                  </div>
                  {room.petsAllowed ? (
                    <div className="flex items-center gap-3">
                      <PawPrint className="h-5 w-5 text-gold" />
                      <span>Pets allowed</span>
                    </div>
                  ) : null}
                  {room.size ? (
                    <div className="flex items-center gap-3">
                      <span className="text-gold">{"\uD83D\uDCCF"}</span>
                      <span>{room.size}</span>
                    </div>
                  ) : null}
                </div>
              </div>

              {room.amenities.length > 0 ? (
                <div className="rounded-2xl border border-black/10 bg-white p-8">
                  <h3 className="mb-4 font-display text-xl font-semibold text-black">Amenities</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {room.amenities.map((amenity) => (
                      <div key={amenity} className="flex items-center gap-2 text-sm text-black">
                        <span className="h-2 w-2 rounded-full bg-gold" />
                        {amenity}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            className="h-fit lg:sticky lg:top-24"
          >
            <div className="rounded-3xl border border-black/10 bg-white p-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-700">
                  Per night
                </p>
                <p className="mt-2 font-display text-4xl font-semibold text-black">
                  {"\u20B9"}
                  {room.pricePerNight.toLocaleString("en-IN")}
                </p>
              </div>

              <div className="mt-6 rounded-2xl border border-black/10 bg-gray-50 p-4">
                <p className="text-sm font-semibold text-black">Availability (next 30 days)</p>
                {availabilityLoading ? (
                  <p className="mt-2 text-sm text-gray-700">Loading availability…</p>
                ) : availability ? (
                  <div className="mt-3 grid grid-cols-10 gap-2">
                    {previewDays.map((d) => {
                      const blocked = availability.blocked[d];
                      const available = availability.available[d] ?? 0;
                      const state: "open" | "booked" | "closed" | "maintenance" =
                        blocked ?? (available <= 0 ? "booked" : "open");
                      const cls =
                        state === "open"
                          ? "bg-green-600"
                          : state === "booked"
                            ? "bg-yellow-500"
                            : "bg-red-600";
                      return (
                        <div
                          key={d}
                          title={`${d} — ${state}`}
                          className={`h-2 rounded-full ${cls}`}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-gray-700">Availability unavailable.</p>
                )}
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-700">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-600" /> Open
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-yellow-500" /> Booked
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-600" /> Closed/Maintenance
                  </span>
                </div>
              </div>

              <Button asChild size="lg" className="mt-6 h-12 w-full rounded-xl font-semibold">
                <Link to="/booking" search={{ room: room.id, date: todayIso() } as never}>
                  Book Now <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <div className="mt-6 space-y-2 border-t border-black/10 pt-4 text-xs text-gray-700">
                <p>{"\u2713"} Calendar-aligned availability</p>
                <p>{"\u2713"} Maintenance/closed blocks applied</p>
                <p>{"\u2713"} Transparent pricing</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </SiteLayout>
  );
}
