import type { Hotel, RoomStatus } from "@/types/hotel";

const today = new Date();
const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return iso(d);
};

const sampleCalendar = (seed: number): Record<string, RoomStatus> => {
  const cal: Record<string, RoomStatus> = {};
  for (let i = 0; i < 45; i++) {
    const v = (seed * 7 + i * 3) % 11;
    if (v === 0) cal[addDays(i)] = "booked";
    else if (v === 1) cal[addDays(i)] = "closed";
    else if (v === 2) cal[addDays(i)] = "maintenance";
    else if (v === 7) cal[addDays(i)] = "booked";
  }
  return cal;
};

const mkRooms = (numbers: string[], seedBase: number) =>
  numbers.map((n, i) => ({ number: n, calendar: sampleCalendar(seedBase + i) }));

export const hotels: Hotel[] = [
  {
    id: "vrinda-uday-dham",
    slug: "vrinda-uday-dham",
    name: "Vrinda Uday Dham",
    tagline: "Sacred retreat on the banks of the Yamuna",
    city: "Vrindavan",
    country: "India",
    address: "Parikrama Marg, Vrindavan, Mathura, India",
    rating: 4.8,
    reviews: 1284,
    startingPrice: 4200,
    petsAllowed: true,
    heroImage:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1920&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1600&q=80",
    ],
    highlights: [
      "Riverside meditation garden",
      "Authentic Sattvic kitchen",
      "Daily aarti & temple shuttle",
      "Pet-friendly grounds",
    ],
    amenities: ["Free Wi-Fi", "Valet parking", "Yoga deck", "24/7 concierge", "Airport pickup", "Spa"],
    description:
      "A sanctuary where ancient hospitality meets contemporary comfort. Wake to the chants from the ghats and unwind on a private terrace overlooking the Yamuna.",
    roomTypes: [
      {
        id: "double-bed-ac",
        name: "Double Bed AC",
        description:
          "A refined corner suite with king bed, marble bath, and a juliet balcony overlooking the inner courtyard.",
        pricePerNight: 4200,
        image:
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1600&q=80",
        maxAdults: 3,
        maxChildren: 2,
        petsAllowed: true,
        amenities: ["King bed", "Climate control", "Smart TV", "Rain shower", "Tea & coffee"],
        size: "38 m²",
        bedType: "1 King bed",
        rooms: mkRooms(["101", "102", "103", "201", "202", "203"], 1),
      },
      {
        id: "triple-bed-ac",
        name: "Triple Bed AC",
        description:
          "Spacious family suite with a separate lounge area and panoramic windows facing the temple skyline.",
        pricePerNight: 6400,
        image:
          "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1600&q=80",
        maxAdults: 4,
        maxChildren: 3,
        petsAllowed: false,
        amenities: ["3 single beds", "Lounge area", "Smart TV", "Bathtub", "Mini bar"],
        size: "54 m²",
        bedType: "3 single beds",
        rooms: mkRooms(["301", "302", "303", "304"], 9),
      },
    ],
  },
  {
    id: "celeste-marrakech",
    slug: "celeste-marrakech",
    name: "Céleste Marrakech",
    tagline: "A jeweled riad inside the medina walls",
    city: "Marrakech",
    country: "Morocco",
    address: "Derb El Ferrane, Medina, Marrakech",
    rating: 4.9,
    reviews: 902,
    startingPrice: 18500,
    petsAllowed: false,
    heroImage:
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1600&q=80",
    ],
    highlights: ["Rooftop hammam", "Private courtyard pool", "Tagine masterclass"],
    amenities: ["Hammam", "Pool", "Rooftop bar", "Butler service", "Spa"],
    description:
      "Hand-carved cedar, candle-lit alcoves and a moon-bathed plunge pool. A modern reinterpretation of an 18th-century riad.",
    roomTypes: [
      {
        id: "atlas-suite",
        name: "Atlas Suite",
        description: "Couples sanctuary with private terrace and outdoor copper bath.",
        pricePerNight: 18500,
        image:
          "https://images.unsplash.com/photo-1444201983204-c43cbd584d93?auto=format&fit=crop&w=1600&q=80",
        maxAdults: 2,
        maxChildren: 1,
        petsAllowed: false,
        amenities: ["King bed", "Private terrace", "Copper bath", "Butler"],
        size: "62 m²",
        bedType: "1 King bed",
        rooms: mkRooms(["R1", "R2", "R3"], 3),
      },
    ],
  },
  {
    id: "aurora-kyoto",
    slug: "aurora-kyoto",
    name: "Aurora Kyoto",
    tagline: "Machiya minimalism in Gion",
    city: "Kyoto",
    country: "Japan",
    address: "Gion-Higashi, Higashiyama Ward, Kyoto",
    rating: 4.9,
    reviews: 1531,
    startingPrice: 32000,
    petsAllowed: false,
    heroImage:
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1920&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1545158539-7e8c2f3e58a9?auto=format&fit=crop&w=1600&q=80",
    ],
    highlights: ["Onsen bath", "Kaiseki dining", "Tea ceremony"],
    amenities: ["Onsen", "Kaiseki restaurant", "Garden", "Concierge"],
    description:
      "A restored machiya where shoji screens slide open onto a moss garden and the soft glow of paper lanterns.",
    roomTypes: [
      {
        id: "tatami-suite",
        name: "Tatami Suite",
        description: "Traditional tatami suite with futon bedding and cedar bath.",
        pricePerNight: 32000,
        image:
          "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1600&q=80",
        maxAdults: 2,
        maxChildren: 2,
        petsAllowed: false,
        amenities: ["Futon", "Cedar bath", "Tea set", "Yukata"],
        size: "48 m²",
        bedType: "Futon",
        rooms: mkRooms(["T1", "T2", "T3", "T4"], 5),
      },
    ],
  },
  {
    id: "noir-amalfi",
    slug: "noir-amalfi",
    name: "Noir Amalfi",
    tagline: "Cliffside theatre on the Tyrrhenian",
    city: "Positano",
    country: "Italy",
    address: "Via Cristoforo Colombo, Positano",
    rating: 4.7,
    reviews: 678,
    startingPrice: 41000,
    petsAllowed: true,
    heroImage:
      "https://images.unsplash.com/photo-1530841377377-3ff06c0ca713?auto=format&fit=crop&w=1920&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80",
    ],
    highlights: ["Infinity pool", "Private boat", "Cellar dining"],
    amenities: ["Pool", "Boat", "Spa", "Michelin restaurant"],
    description:
      "Carved into the cliff, every suite frames the sea like a cinema screen. Sunsets are non-negotiable.",
    roomTypes: [
      {
        id: "sea-suite",
        name: "Sea Suite",
        description: "Open-air suite with terrace plunge pool.",
        pricePerNight: 41000,
        image:
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80",
        maxAdults: 2,
        maxChildren: 2,
        petsAllowed: true,
        amenities: ["Plunge pool", "King bed", "Butler", "Champagne bar"],
        size: "70 m²",
        bedType: "1 King bed",
        rooms: mkRooms(["S1", "S2", "S3"], 11),
      },
    ],
  },
];

export const findHotel = (slug: string) => hotels.find((h) => h.slug === slug);
export const findRoomType = (hotelSlug: string, roomTypeId: string) =>
  findHotel(hotelSlug)?.roomTypes.find((r) => r.id === roomTypeId);

export const availableRoomCount = (
  roomType: { rooms: { calendar: Record<string, string> }[] },
  isoDate: string,
) =>
  roomType.rooms.filter((r) => {
    const s = r.calendar[isoDate];
    return !s || s === "available";
  }).length;
