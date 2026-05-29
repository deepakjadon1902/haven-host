import { Room } from "../models/Room.js";
import { Settings } from "../models/Settings.js";

const seedRooms = [
  {
    slug: "deluxe-vrindavan",
    name: "Deluxe Riverside Suite",
    description: "Overlooking the sacred Yamuna River with private balcony",
    pricePerNightCents: 50000,
    maxAdults: 2,
    maxChildren: 1,
    petsAllowed: true,
    size: "45 sqm",
    bedType: "King Bed",
    amenities: ["WiFi", "AC", "Hot Water", "Mini Bar", "Work Desk"],
    images: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800",
    ],
    coverImage:
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800",
    totalUnits: 5,
    active: true,
    sortOrder: 1,
  },
  {
    slug: "garden-pavilion",
    name: "Garden Pavilion",
    description: "Private garden view with direct access to manicured lawns",
    pricePerNightCents: 45000,
    maxAdults: 2,
    maxChildren: 0,
    petsAllowed: false,
    size: "40 sqm",
    bedType: "Queen Bed",
    amenities: ["WiFi", "AC", "Hot Water", "Garden Access"],
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800",
    ],
    coverImage:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800",
    totalUnits: 3,
    active: true,
    sortOrder: 2,
  },
  {
    slug: "premier-suite",
    name: "Premier Suite",
    description: "Top-floor suite with 180-degree city views and spa",
    pricePerNightCents: 75000,
    maxAdults: 3,
    maxChildren: 2,
    petsAllowed: true,
    size: "60 sqm",
    bedType: "King + Twin Bed",
    amenities: ["WiFi", "AC", "Hot Water", "Spa Bath", "Lounge Area"],
    images: [
      "https://images.unsplash.com/photo-1564078369132-521ba4e44af3?auto=format&fit=crop&w=800",
    ],
    coverImage:
      "https://images.unsplash.com/photo-1564078369132-521ba4e44af3?auto=format&fit=crop&w=800",
    totalUnits: 2,
    active: true,
    sortOrder: 3,
  },
  {
    slug: "heritage-haveli-suite",
    name: "Heritage Haveli Suite",
    description: "Handcrafted interiors with courtyard view and artisan details.",
    pricePerNightCents: 62000,
    maxAdults: 2,
    maxChildren: 2,
    petsAllowed: false,
    size: "55 sqm",
    bedType: "King Bed",
    amenities: ["WiFi", "AC", "Hot Water", "Courtyard View", "Tea & Coffee"],
    images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    ],
    coverImage:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    totalUnits: 4,
    active: true,
    sortOrder: 4,
  },
  {
    slug: "panoramic-skyline-suite",
    name: "Panoramic Skyline Suite",
    description: "Floor-to-ceiling windows, sunset views, and a plush lounge.",
    pricePerNightCents: 88000,
    maxAdults: 3,
    maxChildren: 1,
    petsAllowed: true,
    size: "68 sqm",
    bedType: "King Bed",
    amenities: ["WiFi", "AC", "Hot Water", "Lounge", "City View", "Mini Bar"],
    images: [
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1200&q=80",
    ],
    coverImage:
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1200&q=80",
    totalUnits: 2,
    active: true,
    sortOrder: 5,
  },
];

export async function seedIfEmpty() {
  const roomsCount = await Room.countDocuments();
  if (roomsCount === 0) {
    await Room.insertMany(seedRooms);
  }

  const settingsCount = await Settings.countDocuments();
  if (settingsCount === 0) {
    await Settings.create({
      name: "Maison Noir",
      tagline: "Curated luxury hospitality",
      city: "Vrindavan",
      country: "India",
      address: "Boutique property — address configurable in Admin > Settings",
      description:
        "A private collection of exquisitely designed rooms across India, Morocco, Japan and Italy.",
      heroImage:
        "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80",
      contactEmail: "contact@maisonnoir.example",
      contactPhone: "+91 90000 00000",
    });
  }
}

