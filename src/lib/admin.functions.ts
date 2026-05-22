import { z } from "zod";
import type { Room } from "@/types/room";
import {
  cancelBooking,
  createBooking,
  deleteRoom,
  ensureSeeded,
  getInventoryAndBookings,
  listBookings,
  listRooms,
  setInventory,
  upsertRoom,
  updateSettings,
} from "@/lib/local-store";

const roomSchema = z.object({
  slug: z.string().trim().min(1).max(120).regex(/^[a-z0-9-]+$/, "lowercase letters, numbers and hyphens only"),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(4000).default(""),
  price_per_night_cents: z.number().int().min(0).max(100_000_000),
  max_adults: z.number().int().min(1).max(20),
  max_children: z.number().int().min(0).max(20),
  pets_allowed: z.boolean(),
  size: z.string().max(40).optional().nullable(),
  bed_type: z.string().max(60).optional().nullable(),
  amenities: z.array(z.string().min(1).max(80)).max(40).default([]),
  images: z.array(z.string().url().max(800)).max(20).default([]),
  cover_image: z.string().url().max(800).optional().nullable(),
  total_units: z.number().int().min(1).max(500),
  active: z.boolean().default(true),
  sort_order: z.number().int().min(0).max(10_000).default(0),
});

function fromRoomToDbInput(room: Room) {
  return {
    slug: room.slug,
    name: room.name,
    description: room.description ?? "",
    price_per_night_cents: room.pricePerNightCents ?? room.pricePerNight * 100,
    max_adults: room.maxAdults,
    max_children: room.maxChildren,
    pets_allowed: room.petsAllowed,
    size: room.size ?? null,
    bed_type: room.bedType ?? null,
    amenities: room.amenities ?? [],
    images: room.images ?? [],
    cover_image: room.coverImage ?? null,
    total_units: room.totalUnits,
    active: room.active,
    sort_order: room.sortOrder ?? 0,
  };
}

function fromDbToRoom(data: z.infer<typeof roomSchema> & { id?: string }): Room {
  const images = data.images ?? [];
  return {
    id: data.id ?? "",
    slug: data.slug,
    name: data.name,
    description: data.description ?? "",
    pricePerNightCents: data.price_per_night_cents,
    pricePerNight: Math.round(data.price_per_night_cents / 100),
    maxAdults: data.max_adults,
    maxChildren: data.max_children,
    petsAllowed: data.pets_allowed,
    size: data.size ?? null,
    bedType: data.bed_type ?? null,
    amenities: data.amenities ?? [],
    images,
    coverImage: data.cover_image ?? images[0] ?? "",
    totalUnits: data.total_units,
    active: data.active,
    sortOrder: data.sort_order,
  };
}

export async function adminListRooms(): Promise<Room[]> {
  ensureSeeded();
  return listRooms();
}

export async function adminCreateRoom(input: unknown): Promise<Room> {
  ensureSeeded();
  const validated = roomSchema.parse(input);
  const room = fromDbToRoom({ ...validated });
  return upsertRoom(room);
}

export async function adminUpdateRoom(input: unknown): Promise<Room> {
  ensureSeeded();
  const validated = z.object({ id: z.string().min(1), patch: roomSchema.partial() }).parse(input);
  const existing = listRooms().find((r) => r.id === validated.id);
  if (!existing) throw new Error("Room not found");

  const nextDb = roomSchema.partial().parse({
    ...fromRoomToDbInput(existing),
    ...validated.patch,
  });

  const nextRoom = fromDbToRoom({ ...(nextDb as z.infer<typeof roomSchema>), id: existing.id });
  return upsertRoom(nextRoom);
}

export async function adminDeleteRoom(input: unknown): Promise<{ ok: true }> {
  ensureSeeded();
  const validated = z.object({ id: z.string().min(1) }).parse(input);
  deleteRoom(validated.id);
  return { ok: true };
}

export async function adminListInventory(input: unknown): Promise<{ inventory: unknown[]; bookings: unknown[]; room: { name: string; total_units: number } }> {
  ensureSeeded();
  const validated = z
    .object({
      roomId: z.string().min(1),
      from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    })
    .parse(input);
  return getInventoryAndBookings({ roomId: validated.roomId, from: validated.from, to: validated.to });
}

export async function adminSetInventory(input: unknown): Promise<{ ok: true }> {
  ensureSeeded();
  const validated = z
    .object({
      roomId: z.string().min(1),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      status: z.enum(["closed", "maintenance", "open"]),
      note: z.string().max(280).optional(),
    })
    .parse(input);
  setInventory(validated);
  return { ok: true };
}

export async function adminListBookings(): Promise<unknown[]> {
  ensureSeeded();
  return listBookings();
}

export async function adminCancelBooking(input: unknown): Promise<{ ok: true }> {
  ensureSeeded();
  const validated = z.object({ id: z.string().min(1) }).parse(input);
  cancelBooking(validated.id);
  return { ok: true };
}

export async function adminDashboardStats(): Promise<{
  totalRooms: number;
  totalUnits: number;
  totalBookings30d: number;
  occupancyPct: number;
  revenue30dCents: number;
  upcoming: Array<{
    id: string;
    reference: string;
    guest_full_name: string;
    room_type_name: string;
    check_in: string;
    check_out: string;
    status: string;
  }>;
  chart: Array<{ date: string; count: number }>;
}> {
  ensureSeeded();
  const todayIso = new Date().toISOString().slice(0, 10);
  const since30 = new Date(Date.now() - 30 * 86400000).toISOString();

  const allBookings = listBookings();
  const rooms = listRooms();

  const activeRooms = rooms.filter((r) => r.active);
  const totalRooms = rooms.length;
  const totalUnits = activeRooms.reduce((sum, r) => sum + (r.totalUnits ?? 0), 0);

  const last30 = allBookings.filter((b) => b.created_at >= since30);
  const revenue30dCents = last30
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + (b.total_cents ?? 0), 0);
  const totalBookings30d = last30.length;

  // Occupancy today = booked units / total units (active)
  const bookedToday = allBookings
    .filter((b) => b.status !== "cancelled" && b.check_in <= todayIso && todayIso < b.check_out)
    .length;
  const occupancyPct = totalUnits > 0 ? Math.min(100, Math.round((bookedToday / totalUnits) * 100)) : 0;

  const upcoming = allBookings
    .filter((b) => b.check_in >= todayIso && b.status !== "cancelled")
    .sort((a, b) => (a.check_in < b.check_in ? -1 : 1))
    .slice(0, 10)
    .map((b) => ({
      id: b.id,
      reference: b.reference,
      guest_full_name: b.guest_full_name,
      room_type_name: b.room_type_name,
      check_in: b.check_in,
      check_out: b.check_out,
      status: b.status,
    }));

  // Chart = bookings created per day (last 14 days)
  const toDayStart = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayIso = (d: Date) => toDayStart(d).toISOString().slice(0, 10);
  const now = new Date();
  const chartDays: string[] = [];
  for (let i = 13; i >= 0; i--) {
    chartDays.push(dayIso(new Date(now.getTime() - i * 86400000)));
  }

  const counts = new Map<string, number>();
  for (const k of chartDays) counts.set(k, 0);
  for (const b of allBookings) {
    const d = (b.created_at ?? "").slice(0, 10);
    if (counts.has(d)) counts.set(d, (counts.get(d) ?? 0) + 1);
  }
  const chart = chartDays.map((date) => ({ date, count: counts.get(date) ?? 0 }));

  return {
    totalRooms,
    totalUnits,
    totalBookings30d,
    occupancyPct,
    revenue30dCents,
    upcoming,
    chart,
  };
}

export async function adminUpdateHotelSettings(input: unknown) {
  ensureSeeded();
  const validated = z
    .object({
      name: z.string().max(120).optional(),
      tagline: z.string().max(200).optional(),
      city: z.string().max(120).optional(),
      country: z.string().max(120).optional(),
      address: z.string().max(300).optional(),
      description: z.string().max(5000).optional(),
      heroImage: z.string().url().max(800).optional(),
      contactEmail: z.string().email().max(255).optional(),
      contactPhone: z.string().max(60).optional(),
    })
    .parse(input);
  return updateSettings(validated);
}

// Exported for booking flow (client-only, no backend)
export { createBooking };
