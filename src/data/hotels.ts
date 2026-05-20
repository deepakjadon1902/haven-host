// Bridge file for compatibility with existing code
// The app has been refactored to a single-property model (Maison Noir)
// This file provides backward compatibility until full refactoring is complete

import type { Room } from "@/types/room";

/**
 * Mock hotel structure for backward compatibility
 * The app now operates as a single luxury property
 */
export interface Hotel {
  id: string;
  slug: string;
  name: string;
  description: string;
  tagline?: string;
  image?: string;
}

/**
 * Single property: Maison Noir
 */
export const MAIN_HOTEL: Hotel = {
  id: "maison-noir-main",
  slug: "maison-noir",
  name: "Maison Noir",
  tagline: "Curated luxury hospitality",
  description: "A private collection of exquisitely designed rooms across India, Morocco, Japan and Italy.",
};

/**
 * Placeholder hotels array - will be fetched from server in production
 */
export const hotels: Hotel[] = [MAIN_HOTEL];

/**
 * Mock rooms data - placeholder until integrated with server functions
 * In production, use listPublicRooms() from @/lib/rooms.functions.ts
 */
export const mockRooms: Room[] = [
  {
    id: "room-1",
    slug: "deluxe-vrindavan",
    name: "Deluxe Riverside Suite",
    description: "Overlooking the sacred Yamuna River with private balcony",
    pricePerNightCents: 50000,
    pricePerNight: 500,
    maxAdults: 2,
    maxChildren: 1,
    petsAllowed: true,
    size: "45 sqm",
    bedType: "King Bed",
    amenities: ["WiFi", "AC", "Hot Water", "Mini Bar", "Work Desk"],
    images: ["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800"],
    coverImage: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800",
    totalUnits: 5,
    active: true,
    sortOrder: 1,
  },
  {
    id: "room-2",
    slug: "garden-pavilion",
    name: "Garden Pavilion",
    description: "Private garden view with direct access to manicured lawns",
    pricePerNightCents: 45000,
    pricePerNight: 450,
    maxAdults: 2,
    maxChildren: 0,
    petsAllowed: false,
    size: "40 sqm",
    bedType: "Queen Bed",
    amenities: ["WiFi", "AC", "Hot Water", "Garden Access"],
    images: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800"],
    coverImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800",
    totalUnits: 3,
    active: true,
    sortOrder: 2,
  },
  {
    id: "room-3",
    slug: "premier-suite",
    name: "Premier Suite",
    description: "Top-floor suite with 180-degree city views and spa",
    pricePerNightCents: 75000,
    pricePerNight: 750,
    maxAdults: 3,
    maxChildren: 2,
    petsAllowed: true,
    size: "60 sqm",
    bedType: "King + Twin Bed",
    amenities: ["WiFi", "AC", "Hot Water", "Spa Bath", "Lounge Area"],
    images: ["https://images.unsplash.com/photo-1564078369132-521ba4e44af3?auto=format&fit=crop&w=800"],
    coverImage: "https://images.unsplash.com/photo-1564078369132-521ba4e44af3?auto=format&fit=crop&w=800",
    totalUnits: 2,
    active: true,
    sortOrder: 3,
  },
];

/**
 * Find a hotel by slug
 */
export function findHotel(slug: string): Hotel | undefined {
  return hotels.find((h) => h.slug === slug);
}

/**
 * Get mock rooms for a hotel
 * TODO: Replace with actual server function call
 */
export function getHotelRooms(hotelSlug: string): Room[] {
  // For now, all rooms belong to Maison Noir
  if (hotelSlug === MAIN_HOTEL.slug || hotelSlug === "maison-noir") {
    return mockRooms;
  }
  return [];
}

/**
 * Find a specific room by hotel slug and room id
 */
export function findRoomType(hotelSlug: string, roomId: string): Room | undefined {
  const rooms = getHotelRooms(hotelSlug);
  return rooms.find((r) => r.id === roomId);
}

/**
 * Get all rooms (from main hotel)
 */
export function getAllRooms(): Room[] {
  return mockRooms;
}
