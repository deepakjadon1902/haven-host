import type { HotelSettings, Room, RoomAvailabilityMap } from "@/types/room";
import {
  ensureSeeded,
  getRoomAvailability as localAvailability,
  getRoomById,
  getRoomBySlug,
  getSettings,
  listRooms,
} from "@/lib/local-store";

export async function listPublicRooms(): Promise<Room[]> {
  ensureSeeded();
  return listRooms({ activeOnly: true });
}

export async function getPublicRoom(input: { slug: string }): Promise<Room | null> {
  ensureSeeded();
  const r = getRoomBySlug(input.slug);
  return r && r.active ? r : null;
}

export async function getPublicRoomById(input: { id: string }): Promise<Room | null> {
  ensureSeeded();
  const r = getRoomById(input.id);
  return r && r.active ? r : null;
}

export async function getHotelSettings(): Promise<HotelSettings | null> {
  ensureSeeded();
  return getSettings();
}

export async function getRoomAvailability(input: {
  roomId: string;
  from: string;
  days: number;
}): Promise<RoomAvailabilityMap> {
  ensureSeeded();
  return localAvailability(input.roomId, input.from, input.days);
}
