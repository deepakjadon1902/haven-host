import type { Hotel, Room } from "@/types/room";

export const hotels: Hotel[] = [
  {
    id: "hotel-maison-noir",
    slug: "maison-noir",
    name: "Maison Noir Vrindavan",
    city: "Vrindavan",
    country: "India",
    address: "Yamuna Riverside, Vrindavan",
    tagline: "Riverside quiet with private butler rituals",
    description:
      "A polished spiritual-luxury retreat with suites, garden pavilions, temple-view terraces, live availability, and concierge-led arrivals.",
    image:
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1800&q=80",
    rating: 4.9,
    reviewCount: 842,
    subscriptionTier: "black",
    partnerName: "Maison Hospitality Group",
    featuredAmenities: ["Butler desk", "Temple transfers", "Fine dining", "Wellness concierge"],
  },
  {
    id: "hotel-azura-palace",
    slug: "azura-palace",
    name: "Azura Palace Jaipur",
    city: "Jaipur",
    country: "India",
    address: "C-Scheme, Jaipur",
    tagline: "Palatial city stays with rooftop evenings",
    description:
      "A heritage-inspired premium hotel built for leisure and business travellers who want suite comfort, skyline views, and high-touch service.",
    image:
      "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1800&q=80",
    rating: 4.8,
    reviewCount: 516,
    subscriptionTier: "signature",
    partnerName: "Azura Collection",
    featuredAmenities: ["Rooftop pool", "Airport desk", "Banquet lounge", "Chef table"],
  },
  {
    id: "hotel-sora-kyoto",
    slug: "sora-kyoto",
    name: "Sora Kyoto House",
    city: "Kyoto",
    country: "Japan",
    address: "Higashiyama Ward, Kyoto",
    tagline: "Minimal suites beside lantern-lit lanes",
    description:
      "A boutique ryokan-style property with calm interiors, private soaking baths, and a subscription-backed partner program for premium visibility.",
    image:
      "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1800&q=80",
    rating: 4.95,
    reviewCount: 391,
    subscriptionTier: "black",
    partnerName: "Sora Living",
    featuredAmenities: ["Onsen baths", "Tea ceremony", "Private garden", "Local host"],
  },
];

export const MAIN_HOTEL = hotels[0];

export const mockRooms: Room[] = [
  {
    id: "room-1",
    hotelId: "hotel-maison-noir",
    hotelName: "Maison Noir Vrindavan",
    hotelCity: "Vrindavan",
    slug: "deluxe-riverside-suite",
    name: "Deluxe Riverside Suite",
    description:
      "A polished suite overlooking the Yamuna with balcony dining and soft gold accents.",
    pricePerNightCents: 1850000,
    pricePerNight: 18500,
    maxAdults: 2,
    maxChildren: 1,
    petsAllowed: true,
    size: "45 sqm",
    bedType: "King Bed",
    amenities: ["WiFi", "Butler desk", "Balcony", "Mini bar", "Temple transfer"],
    images: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80",
    ],
    coverImage:
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80",
    totalUnits: 5,
    active: true,
    sortOrder: 1,
  },
  {
    id: "room-2",
    hotelId: "hotel-maison-noir",
    hotelName: "Maison Noir Vrindavan",
    hotelCity: "Vrindavan",
    slug: "garden-pavilion",
    name: "Garden Pavilion",
    description: "Private garden access, morning tea service, and a quiet indoor-outdoor lounge.",
    pricePerNightCents: 1520000,
    pricePerNight: 15200,
    maxAdults: 2,
    maxChildren: 0,
    petsAllowed: false,
    size: "40 sqm",
    bedType: "Queen Bed",
    amenities: ["WiFi", "Garden access", "Rain shower", "Work desk"],
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    ],
    coverImage:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    totalUnits: 3,
    active: true,
    sortOrder: 2,
  },
  {
    id: "room-3",
    hotelId: "hotel-azura-palace",
    hotelName: "Azura Palace Jaipur",
    hotelCity: "Jaipur",
    slug: "panoramic-palace-suite",
    name: "Panoramic Palace Suite",
    description: "A top-floor suite with city views, a marble bath, and evening lounge access.",
    pricePerNightCents: 2450000,
    pricePerNight: 24500,
    maxAdults: 3,
    maxChildren: 2,
    petsAllowed: true,
    size: "68 sqm",
    bedType: "King + Twin Bed",
    amenities: ["Rooftop access", "City view", "Spa bath", "Lounge", "Mini bar"],
    images: [
      "https://images.unsplash.com/photo-1564078369132-521ba4e44af3?auto=format&fit=crop&w=1200&q=80",
    ],
    coverImage:
      "https://images.unsplash.com/photo-1564078369132-521ba4e44af3?auto=format&fit=crop&w=1200&q=80",
    totalUnits: 4,
    active: true,
    sortOrder: 3,
  },
  {
    id: "room-4",
    hotelId: "hotel-azura-palace",
    hotelName: "Azura Palace Jaipur",
    hotelCity: "Jaipur",
    slug: "heritage-courtyard-room",
    name: "Heritage Courtyard Room",
    description:
      "Carved doors, courtyard calm, and a compact premium layout for short Jaipur stays.",
    pricePerNightCents: 1280000,
    pricePerNight: 12800,
    maxAdults: 2,
    maxChildren: 1,
    petsAllowed: false,
    size: "36 sqm",
    bedType: "King Bed",
    amenities: ["Courtyard view", "Breakfast", "Smart TV", "Airport desk"],
    images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    ],
    coverImage:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    totalUnits: 8,
    active: true,
    sortOrder: 4,
  },
  {
    id: "room-5",
    hotelId: "hotel-sora-kyoto",
    hotelName: "Sora Kyoto House",
    hotelCity: "Kyoto",
    slug: "onsen-garden-suite",
    name: "Onsen Garden Suite",
    description: "A quiet suite with private soaking bath, tatami lounge, and garden breakfast.",
    pricePerNightCents: 3120000,
    pricePerNight: 31200,
    maxAdults: 2,
    maxChildren: 1,
    petsAllowed: false,
    size: "52 sqm",
    bedType: "Low King Bed",
    amenities: ["Private onsen", "Tea service", "Garden", "Host concierge"],
    images: [
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1200&q=80",
    ],
    coverImage:
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1200&q=80",
    totalUnits: 3,
    active: true,
    sortOrder: 5,
  },
];

export function findHotel(slugOrId: string): Hotel | undefined {
  return hotels.find((h) => h.slug === slugOrId || h.id === slugOrId);
}

export function getHotelRooms(hotelSlugOrId: string): Room[] {
  const hotel = findHotel(hotelSlugOrId);
  if (!hotel) return [];
  return mockRooms.filter((r) => r.hotelId === hotel.id);
}

export function getAllRooms(): Room[] {
  return mockRooms;
}
