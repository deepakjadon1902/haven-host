import type { Room, RoomAvailabilityMap, HotelSettings } from "@/types/room";
import { MAIN_HOTEL, mockRooms } from "@/data/hotels";

const ROOMS_KEY = "haven.rooms.v1";
const INVENTORY_KEY = "haven.inventory.v1";
const BOOKINGS_KEY = "haven.bookings.v1";
const SETTINGS_KEY = "haven.settings.v1";
const LAST_EMAIL_KEY = "haven.lastBookingEmail.v1";
const PAYMENT_DRAFT_KEY = "haven.paymentDraft.v1";

type InventoryStatus = "closed" | "maintenance";
type InventoryRow = { room_id: string; date: string; status: InventoryStatus; note: string | null };

type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";
export type LocalBooking = {
  id: string;
  reference: string;
  hotel_name: string;
  room_type_name: string;
  room_id: string | null;
  check_in: string;
  check_out: string;
  nights: number;
  adults: number;
  children: number;
  guest_full_name: string;
  guest_email: string;
  guest_phone: string;
  total_cents: number;
  currency: string;
  status: BookingStatus;
  created_at: string;
  payment_status?: "unpaid" | "paid" | "failed";
  payment_reference?: string;
};

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readJson<T>(key: string): T | null {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function addDays(iso: string, n: number) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function normalizeRoom(r: Room): Room {
  return {
    ...r,
    pricePerNightCents: Number(r.pricePerNightCents ?? 0),
    pricePerNight: Math.round(Number(r.pricePerNightCents ?? 0) / 100),
    amenities: r.amenities ?? [],
    images: r.images ?? [],
    coverImage: r.coverImage ?? r.images?.[0] ?? "",
    sortOrder: Number(r.sortOrder ?? 0),
    totalUnits: Number(r.totalUnits ?? 1),
    active: Boolean(r.active ?? true),
  };
}

function seedRooms(): Room[] {
  const extra: Room[] = [
    {
      id: "room-4",
      slug: "heritage-haveli-suite",
      name: "Heritage Haveli Suite",
      description: "Handcrafted interiors with courtyard view and artisan details.",
      pricePerNightCents: 62000,
      pricePerNight: 620,
      maxAdults: 2,
      maxChildren: 2,
      petsAllowed: false,
      size: "55 sqm",
      bedType: "King Bed",
      amenities: ["WiFi", "AC", "Hot Water", "Courtyard View", "Tea & Coffee"],
      images: ["https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"],
      coverImage: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      totalUnits: 4,
      active: true,
      sortOrder: 4,
    },
    {
      id: "room-5",
      slug: "panoramic-skyline-suite",
      name: "Panoramic Skyline Suite",
      description: "Floor-to-ceiling windows, sunset views, and a plush lounge.",
      pricePerNightCents: 88000,
      pricePerNight: 880,
      maxAdults: 3,
      maxChildren: 1,
      petsAllowed: true,
      size: "68 sqm",
      bedType: "King Bed",
      amenities: ["WiFi", "AC", "Hot Water", "Lounge", "City View", "Mini Bar"],
      images: ["https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1200&q=80"],
      coverImage: "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1200&q=80",
      totalUnits: 2,
      active: true,
      sortOrder: 5,
    },
  ];

  const merged = [...mockRooms, ...extra].map(normalizeRoom);
  const seen = new Set<string>();
  return merged.filter((r) => {
    if (seen.has(r.slug)) return false;
    seen.add(r.slug);
    return true;
  });
}

export function ensureSeeded() {
  if (!isBrowser()) return;
  const existing = readJson<Room[]>(ROOMS_KEY);
  if (!existing || !Array.isArray(existing) || existing.length === 0) {
    writeJson(ROOMS_KEY, seedRooms());
  }

  const settings = readJson<HotelSettings>(SETTINGS_KEY);
  if (!settings) {
    const defaultSettings: HotelSettings = {
      name: MAIN_HOTEL.name,
      tagline: MAIN_HOTEL.tagline ?? "Curated luxury hospitality",
      city: "Vrindavan",
      country: "India",
      address: "Boutique property â€” address configurable in Admin > Settings",
      description: MAIN_HOTEL.description,
      heroImage: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80",
      contactEmail: "contact@maisonnoir.example",
      contactPhone: "+91 90000 00000",
    };
    writeJson(SETTINGS_KEY, defaultSettings);
  }
}

export function listRooms({ activeOnly }: { activeOnly?: boolean } = {}): Room[] {
  const seeded = isBrowser() ? (readJson<Room[]>(ROOMS_KEY) ?? seedRooms()) : seedRooms();
  const rooms = seeded.map(normalizeRoom);
  const filtered = activeOnly ? rooms.filter((r) => r.active) : rooms;
  return filtered.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export function getRoomBySlug(slug: string): Room | null {
  return listRooms().find((r) => r.slug === slug) ?? null;
}

export function getRoomById(id: string): Room | null {
  return listRooms().find((r) => r.id === id) ?? null;
}

export function upsertRoom(room: Room): Room {
  ensureSeeded();
  const rooms = listRooms();
  const nextRoom: Room = normalizeRoom({
    ...room,
    id: room.id || (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `room-${Date.now()}`),
  });

  const existingIdx = rooms.findIndex((r) => r.id === nextRoom.id);
  const next = rooms.slice();
  if (existingIdx === -1) next.unshift(nextRoom);
  else next[existingIdx] = nextRoom;

  if (isBrowser()) writeJson(ROOMS_KEY, next);
  return nextRoom;
}

export function deleteRoom(id: string) {
  ensureSeeded();
  const next = listRooms().filter((r) => r.id !== id);
  if (isBrowser()) writeJson(ROOMS_KEY, next);
}

export function getSettings(): HotelSettings {
  const seeded = isBrowser() ? readJson<HotelSettings>(SETTINGS_KEY) : null;
  if (seeded) return seeded;
  return {
    name: MAIN_HOTEL.name,
    tagline: MAIN_HOTEL.tagline ?? "Curated luxury hospitality",
    city: "Vrindavan",
    country: "India",
    address: "Boutique property â€” address configurable in Admin > Settings",
    description: MAIN_HOTEL.description,
    heroImage: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80",
    contactEmail: "contact@maisonnoir.example",
    contactPhone: "+91 90000 00000",
  };
}

export function updateSettings(patch: Partial<HotelSettings>): HotelSettings {
  ensureSeeded();
  const next = { ...getSettings(), ...patch };
  if (isBrowser()) writeJson(SETTINGS_KEY, next);
  return next;
}

function listInventoryRows(): InventoryRow[] {
  return readJson<InventoryRow[]>(INVENTORY_KEY) ?? [];
}

function writeInventoryRows(rows: InventoryRow[]) {
  writeJson(INVENTORY_KEY, rows);
}

export function getRoomAvailability(roomId: string, from: string, days: number): RoomAvailabilityMap {
  const room = getRoomById(roomId);
  const totalUnits = room?.totalUnits ?? 1;
  const to = addDays(from, days);

  const inv = isBrowser()
    ? listInventoryRows().filter((r) => r.room_id === roomId && r.date >= from && r.date <= to)
    : [];

  const bookings = listBookings().filter((b) => b.room_id === roomId && b.status !== "cancelled");

  const bookedCount: Record<string, number> = {};
  for (const b of bookings) {
    let cur = b.check_in;
    while (cur < b.check_out) {
      bookedCount[cur] = (bookedCount[cur] ?? 0) + 1;
      cur = addDays(cur, 1);
    }
  }

  const invMap: Record<string, InventoryStatus> = {};
  for (const r of inv) invMap[r.date] = r.status;

  const available: Record<string, number> = {};
  const blocked: Record<string, "closed" | "maintenance" | "booked"> = {};
  for (let i = 0; i < days; i++) {
    const day = addDays(from, i);
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
}

export function listBookings(): LocalBooking[] {
  if (!isBrowser()) return [];
  return readJson<LocalBooking[]>(BOOKINGS_KEY) ?? [];
}

export function setLastBookingEmail(email: string) {
  if (!isBrowser()) return;
  window.localStorage.setItem(LAST_EMAIL_KEY, email.trim().toLowerCase());
}

export function getLastBookingEmail(): string {
  if (!isBrowser()) return "";
  return (window.localStorage.getItem(LAST_EMAIL_KEY) ?? "").trim().toLowerCase();
}

export function listBookingsByEmail(email: string): LocalBooking[] {
  const q = email.trim().toLowerCase();
  if (!q) return [];
  return listBookings().filter((b) => (b.guest_email ?? "").trim().toLowerCase() === q);
}

function writeBookings(rows: LocalBooking[]) {
  writeJson(BOOKINGS_KEY, rows);
}

export function createBooking(input: Omit<LocalBooking, "id" | "created_at" | "status" | "reference"> & { status?: BookingStatus; reference?: string }): LocalBooking {
  ensureSeeded();
  const now = new Date().toISOString();
  const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `bk-${Date.now()}`;
  const reference =
    input.reference ??
    `MN-${Math.random().toString(16).slice(2, 6).toUpperCase()}${Math.random().toString(16).slice(2, 6).toUpperCase()}`;

  const row: LocalBooking = {
    ...input,
    id,
    reference,
    created_at: now,
    status: input.status ?? "confirmed",
  };

  if (isBrowser()) {
    writeBookings([row, ...listBookings()]);
    setLastBookingEmail(row.guest_email);
  }
  return row;
}

export function cancelBooking(id: string) {
  if (!isBrowser()) return;
  const next = listBookings().map((b) => (b.id === id ? { ...b, status: "cancelled" as const } : b));
  writeBookings(next);
}

export function setInventory(input: { roomId: string; date: string; status: "open" | "closed" | "maintenance"; note?: string }) {
  if (!isBrowser()) return;
  const rows = listInventoryRows();
  const next = rows.filter((r) => !(r.room_id === input.roomId && r.date === input.date));
  if (input.status !== "open") {
    next.push({ room_id: input.roomId, date: input.date, status: input.status, note: input.note ?? null });
  }
  writeInventoryRows(next);
}

export function getInventoryAndBookings(input: { roomId: string; from: string; to: string }) {
  const inventory = isBrowser()
    ? listInventoryRows().filter((r) => r.room_id === input.roomId && r.date >= input.from && r.date <= input.to)
    : [];
  const bookings = listBookings().filter((b) => b.room_id === input.roomId && b.status !== "cancelled");
  const room = getRoomById(input.roomId);
  return { inventory, bookings, room: room ? { total_units: room.totalUnits, name: room.name } : { total_units: 1, name: "Room" } };
}

export type PaymentDraft = {
  room_id: string;
  room_type_name: string;
  check_in: string;
  check_out: string;
  nights: number;
  adults: number;
  children: number;
  guest_full_name: string;
  guest_email: string;
  guest_phone: string;
  total_cents: number;
  currency: string;
};

export function savePaymentDraft(draft: PaymentDraft) {
  if (!isBrowser()) return;
  writeJson(PAYMENT_DRAFT_KEY, draft);
}

export function readPaymentDraft(): PaymentDraft | null {
  return readJson<PaymentDraft>(PAYMENT_DRAFT_KEY);
}

export function clearPaymentDraft() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(PAYMENT_DRAFT_KEY);
}
