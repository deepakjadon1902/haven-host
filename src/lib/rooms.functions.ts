import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseServer } from "@/integrations/supabase/client.server";
import type { HotelSettings, Room, RoomAvailabilityMap } from "@/types/room";

type DBRoom = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price_per_night_cents: number;
  max_adults: number;
  max_children: number;
  pets_allowed: boolean;
  size: string | null;
  bed_type: string | null;
  amenities: string[] | null;
  images: string[] | null;
  cover_image: string | null;
  total_units: number;
  active: boolean;
  sort_order: number;
};

function mapRoom(r: DBRoom): Room {
  const images = r.images ?? [];
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description ?? "",
    pricePerNightCents: Number(r.price_per_night_cents ?? 0),
    pricePerNight: Math.round(Number(r.price_per_night_cents ?? 0) / 100),
    maxAdults: r.max_adults,
    maxChildren: r.max_children,
    petsAllowed: r.pets_allowed,
    size: r.size,
    bedType: r.bed_type,
    amenities: r.amenities ?? [],
    images,
    coverImage: r.cover_image ?? images[0] ?? "",
    totalUnits: r.total_units,
    active: r.active,
    sortOrder: r.sort_order,
  };
}

export const listPublicRooms = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseServer
    .from("rooms")
    .select(
      "id, slug, name, description, price_per_night_cents, max_adults, max_children, pets_allowed, size, bed_type, amenities, images, cover_image, total_units, active, sort_order",
    )
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => mapRoom(r as DBRoom));
});

export const getPublicRoom = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ slug: z.string().min(1).max(120) }).parse(input))
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseServer
      .from("rooms")
      .select(
        "id, slug, name, description, price_per_night_cents, max_adults, max_children, pets_allowed, size, bed_type, amenities, images, cover_image, total_units, active, sort_order",
      )
      .eq("slug", data.slug)
      .eq("active", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;
    return mapRoom(row as DBRoom);
  });

export const getPublicRoomById = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseServer
      .from("rooms")
      .select(
        "id, slug, name, description, price_per_night_cents, max_adults, max_children, pets_allowed, size, bed_type, amenities, images, cover_image, total_units, active, sort_order",
      )
      .eq("id", data.id)
      .eq("active", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;
    return mapRoom(row as DBRoom);
  });

export const getHotelSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseServer
    .from("hotel_settings")
    .select("name, tagline, city, country, address, description, hero_image, contact_email, contact_phone")
    .eq("id", true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const s: HotelSettings = {
    name: data.name,
    tagline: data.tagline,
    city: data.city,
    country: data.country,
    address: data.address,
    description: data.description,
    heroImage: data.hero_image,
    contactEmail: data.contact_email,
    contactPhone: data.contact_phone,
  };
  return s;
});

function addDays(iso: string, n: number) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export const getRoomAvailability = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z
      .object({
        roomId: z.string().uuid(),
        from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        days: z.number().int().min(1).max(120),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<RoomAvailabilityMap> => {
    const to = addDays(data.from, data.days);

    const [{ data: room }, { data: inv }, { data: bks }] = await Promise.all([
      supabaseServer.from("rooms").select("total_units").eq("id", data.roomId).maybeSingle(),
      supabaseServer
        .from("room_inventory")
        .select("date, status")
        .eq("room_id", data.roomId)
        .gte("date", data.from)
        .lte("date", to),
      supabaseServer
        .from("bookings")
        .select("check_in, check_out, status")
        .eq("room_id", data.roomId)
        .neq("status", "cancelled"),
    ]);

    const totalUnits = room?.total_units ?? 1;

    const bookedCount: Record<string, number> = {};
    for (const b of bks ?? []) {
      let cur = b.check_in as string;
      const end = b.check_out as string;
      while (cur < end) {
        bookedCount[cur] = (bookedCount[cur] ?? 0) + 1;
        cur = addDays(cur, 1);
      }
    }

    const invMap: Record<string, "closed" | "maintenance"> = {};
    for (const r of inv ?? []) invMap[r.date as string] = (r.status as "closed" | "maintenance");

    const available: Record<string, number> = {};
    const blocked: Record<string, "closed" | "maintenance" | "booked"> = {};
    for (let i = 0; i < data.days; i++) {
      const day = addDays(data.from, i);
      const inventoryBlock = invMap[day];
      const booked = bookedCount[day] ?? 0;
      if (inventoryBlock) {
        available[day] = 0;
        blocked[day] = inventoryBlock;
      } else {
        const avail = Math.max(0, totalUnits - booked);
        available[day] = avail;
        if (avail === 0) blocked[day] = "booked";
      }
    }
    return { available, blocked };
  });
