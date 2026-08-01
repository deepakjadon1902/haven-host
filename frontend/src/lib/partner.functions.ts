import type { Hotel, Room, SubscriptionTier } from "@/types/room";
import {
  findHotel,
  getInventoryAndBookings,
  listBookings,
  listPartners,
  listRooms,
  setInventory,
  upsertHotel,
  upsertPartner,
  upsertRoom,
  updatePartnerStatus,
} from "@/lib/local-store";
import { getPartnerSession } from "@/lib/partner-session";
import { updatePartnerSession } from "@/lib/partner-session";
import { clearPartnerSessionFor } from "@/lib/partner-session";
import { emitAppDataChanged } from "@/lib/app-events";

function requirePartner() {
  const session = getPartnerSession();
  if (!session) throw new Error("Partner login required");
  return session;
}

export function partnerHotel(): Hotel {
  const session = requirePartner();
  const hotel = findHotel(session.hotelId);
  if (!hotel) throw new Error("Partner hotel not found");
  return hotel;
}

export function partnerRooms(): Room[] {
  const session = requirePartner();
  return listRooms().filter((room) => room.hotelId === session.hotelId);
}

export function partnerBookings() {
  const roomIds = new Set(partnerRooms().map((room) => room.id));
  return listBookings().filter((booking) => booking.room_id && roomIds.has(booking.room_id));
}

export function partnerSaveHotel(patch: Partial<Hotel>): Hotel {
  const session = requirePartner();
  const existing = findHotel(session.hotelId);
  if (!existing) throw new Error("Partner hotel not found");
  const saved = upsertHotel({ ...existing, ...patch, id: existing.id });
  emitAppDataChanged("partner:hotel:update");
  return saved;
}

export function partnerProfile() {
  const session = requirePartner();
  const partner = listPartners().find((item) => item.id === session.partnerId);
  const hotel = findHotel(session.hotelId);
  if (!partner || !hotel) throw new Error("Partner profile not found");
  return { partner, hotel };
}

export function partnerSaveProfile(input: {
  ownerName: string;
  businessName: string;
  email: string;
  phone: string;
  upiId: string;
  hotelName: string;
  tagline: string;
  address: string;
  description: string;
  termsAndConditions: string;
  cancellationPolicy: string;
  checkInInstructions: string;
}) {
  const session = requirePartner();
  const existingHotel = findHotel(session.hotelId);
  const existingPartner = listPartners().find((item) => item.id === session.partnerId);
  if (!existingHotel || !existingPartner) throw new Error("Partner profile not found");

  const hotel = upsertHotel({
    ...existingHotel,
    name: input.hotelName.trim(),
    tagline: input.tagline.trim(),
    address: input.address.trim(),
    description: input.description.trim(),
    partnerName: input.ownerName.trim(),
    partnerContactEmail: input.email.trim().toLowerCase(),
    partnerContactPhone: input.phone.trim(),
    upiId: input.upiId.trim(),
    termsAndConditions: input.termsAndConditions.trim(),
    cancellationPolicy: input.cancellationPolicy.trim(),
    checkInInstructions: input.checkInInstructions.trim(),
  });

  const partner = upsertPartner({
    ...existingPartner,
    hotelName: hotel.name,
    ownerName: input.ownerName.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    businessName: input.businessName.trim(),
    upiId: input.upiId.trim(),
  });

  updatePartnerSession({
    hotelName: hotel.name,
    ownerName: partner.ownerName,
    email: partner.email,
  });
  emitAppDataChanged("partner:profile:update");
  return { partner, hotel };
}

export function partnerSaveRoom(room: Room): Room {
  const session = requirePartner();
  const hotel = findHotel(session.hotelId);
  if (!hotel) throw new Error("Partner hotel not found");
  const saved = upsertRoom({
    ...room,
    hotelId: hotel.id,
    hotelName: hotel.name,
    hotelCity: hotel.city,
  });
  emitAppDataChanged("partner:room:save");
  return saved;
}

export function partnerInventory(input: { roomId: string; from: string; to: string }) {
  const allowed = partnerRooms().some((room) => room.id === input.roomId);
  if (!allowed) throw new Error("Room does not belong to this partner");
  return getInventoryAndBookings(input);
}

export function partnerSetInventory(input: {
  roomId: string;
  date: string;
  status: "open" | "closed" | "maintenance";
  note?: string;
}) {
  const allowed = partnerRooms().some((room) => room.id === input.roomId);
  if (!allowed) throw new Error("Room does not belong to this partner");
  setInventory(input);
  emitAppDataChanged("partner:inventory:update");
}

export function adminCreatePartnerWithHotel(input: {
  hotelName: string;
  city: string;
  country: string;
  ownerName: string;
  email: string;
  password: string;
  subscriptionTier: SubscriptionTier;
  image: string;
  images?: string[];
}) {
  const slug = input.hotelName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const hotelId = `hotel-${slug || Date.now()}`;
  const hotel = upsertHotel({
    id: hotelId,
    slug: slug || hotelId,
    name: input.hotelName.trim(),
    city: input.city.trim(),
    country: input.country.trim(),
    address: `${input.city.trim()}, ${input.country.trim()}`,
    tagline: "Premium partner hotel",
    description:
      "A subscribed Haven Host partner hotel. Update this listing from the partner panel.",
    image: input.image.trim(),
    images: input.images?.length ? input.images : [input.image.trim()].filter(Boolean),
    rating: 4.8,
    reviewCount: 0,
    subscriptionTier: input.subscriptionTier,
    partnerName: input.ownerName.trim(),
    featuredAmenities: ["Partner managed", "Live inventory", "Verified listing"],
  });
  const partner = upsertPartner({
    hotelId: hotel.id,
    hotelName: hotel.name,
    ownerName: input.ownerName.trim(),
    email: input.email,
    password: input.password,
    subscriptionTier: input.subscriptionTier,
    active: true,
  });
  emitAppDataChanged("admin:partner:create");
  return { hotel, partner };
}

export function adminListPartners() {
  return listPartners();
}

export function adminSetPartnerBlocked(input: { partnerId: string; blocked: boolean }) {
  const partner = updatePartnerStatus({ partnerId: input.partnerId, active: !input.blocked });
  if (input.blocked) clearPartnerSessionFor(input.partnerId);
  emitAppDataChanged(input.blocked ? "admin:partner:block" : "admin:partner:unblock");
  return partner;
}
