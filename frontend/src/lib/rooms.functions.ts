import type { HotelSettings, Room, RoomAvailabilityMap } from "@/types/room";
import {
  ensureSeeded,
  getRoomAvailability as localAvailability,
  getRoomById,
  getRoomBySlug,
  getSettings,
  listRooms,
} from "@/lib/local-store";
import { apiFetch, hasApiBase } from "@/lib/api-client";

export async function listPublicRooms(): Promise<Room[]> {
  if (hasApiBase()) {
    return await apiFetch<Room[]>("/public/rooms");
  }
  ensureSeeded();
  return listRooms({ activeOnly: true });
}

export async function getPublicRoom(input: { slug: string }): Promise<Room | null> {
  if (hasApiBase()) {
    return await apiFetch<Room | null>(`/public/rooms/${encodeURIComponent(input.slug)}`);
  }
  ensureSeeded();
  const r = getRoomBySlug(input.slug);
  return r && r.active ? r : null;
}

export async function getPublicRoomById(input: { id: string }): Promise<Room | null> {
  if (hasApiBase()) {
    const rooms = await apiFetch<Room[]>("/public/rooms");
    return rooms.find((r) => r.id === input.id) ?? null;
  }
  ensureSeeded();
  const r = getRoomById(input.id);
  return r && r.active ? r : null;
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
  if (hasApiBase()) {
    const qs = new URLSearchParams({
      roomId: input.roomId,
      from: input.from,
      days: String(input.days),
    });
    return await apiFetch<RoomAvailabilityMap>(`/public/availability?${qs.toString()}`);
  }
  ensureSeeded();
  return localAvailability(input.roomId, input.from, input.days);
}
