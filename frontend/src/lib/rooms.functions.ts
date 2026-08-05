import type { Hotel, HotelSettings, Room, RoomAvailabilityMap } from "@/types/room";
import {
  ensureSeeded,
  findHotel,
  getRoomAvailability as localAvailability,
  getRoomById,
  getRoomBySlug,
  getSettings,
  isPartnerHotelActive,
  listPublicHotels as listVisibleHotels,
  listPublicRooms as listVisibleRooms,
} from "@/lib/local-store";
import { apiFetch, hasApiBase } from "@/lib/api-client";

const PUBLIC_API_TIMEOUT_MS = 180;

function mergeRooms(localRooms: Room[], apiRooms: Room[]) {
  const seen = new Set<string>();
  return [...localRooms, ...apiRooms]
    .filter((room) => {
      const key = room.id || room.slug;
      if (seen.has(key)) return false;
      seen.add(key);
      return !room.hotelId || isPartnerHotelActive(room.hotelId);
    })
    .filter((room) => room.active);
}

export async function listPublicRooms(): Promise<Room[]> {
  ensureSeeded();
  const localRooms = listVisibleRooms();
  if (hasApiBase()) {
    try {
      const apiRooms = await apiFetch<Room[]>("/public/rooms", {
        timeoutMs: PUBLIC_API_TIMEOUT_MS,
      });
      return mergeRooms(localRooms, apiRooms);
    } catch {
      return localRooms;
    }
  }
  return localRooms;
}

export async function listPublicHotels(): Promise<Hotel[]> {
  ensureSeeded();
  return listVisibleHotels();
}

export async function getPublicHotel(input: { slug: string }): Promise<Hotel | null> {
  const hotel = findHotel(input.slug);
  return hotel && isPartnerHotelActive(hotel.id) ? hotel : null;
}

export async function getPublicRoom(input: { slug: string }): Promise<Room | null> {
  ensureSeeded();
  const localRoom = getRoomBySlug(input.slug);
  if (localRoom && localRoom.active && isPartnerHotelActive(localRoom.hotelId)) return localRoom;
  if (localRoom?.hotelId && !isPartnerHotelActive(localRoom.hotelId)) return null;
  if (hasApiBase()) {
    return await apiFetch<Room | null>(`/public/rooms/${encodeURIComponent(input.slug)}`);
  }
  return null;
}

export async function getPublicRoomById(input: { id: string }): Promise<Room | null> {
  ensureSeeded();
  const localRoom = getRoomById(input.id);
  if (localRoom && localRoom.active && isPartnerHotelActive(localRoom.hotelId)) return localRoom;
  if (localRoom?.hotelId && !isPartnerHotelActive(localRoom.hotelId)) return null;
  if (hasApiBase()) {
    const rooms = await apiFetch<Room[]>("/public/rooms", { timeoutMs: PUBLIC_API_TIMEOUT_MS });
    return rooms.find((r) => r.id === input.id) ?? null;
  }
  return null;
}

export async function getHotelSettings(): Promise<HotelSettings | null> {
  if (hasApiBase()) {
    return await apiFetch<HotelSettings | null>("/public/settings");
  }
  ensureSeeded();
  return getSettings();
}

export async function getRoomAvailability(input: {
  roomId: string;
  from: string;
  days: number;
}): Promise<RoomAvailabilityMap> {
  ensureSeeded();
  const localRoom = getRoomById(input.roomId);
  if (localRoom) return localAvailability(input.roomId, input.from, input.days);

  if (hasApiBase()) {
    const qs = new URLSearchParams({
      roomId: input.roomId,
      from: input.from,
      days: String(input.days),
    });
    try {
      return await apiFetch<RoomAvailabilityMap>(`/public/availability?${qs.toString()}`, {
        timeoutMs: PUBLIC_API_TIMEOUT_MS,
      });
    } catch {
      return { available: {}, blocked: {} };
    }
  }
  return localAvailability(input.roomId, input.from, input.days);
}
