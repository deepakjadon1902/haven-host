export type RoomStatus = "available" | "booked" | "closed" | "maintenance";

export interface RoomNumber {
  number: string;
  /** ISO date (YYYY-MM-DD) -> status. Missing = available. */
  calendar: Record<string, RoomStatus>;
}

export interface RoomType {
  id: string;
  name: string;
  description: string;
  pricePerNight: number;
  image: string;
  maxAdults: number;
  maxChildren: number;
  petsAllowed: boolean;
  amenities: string[];
  size: string;
  bedType: string;
  rooms: RoomNumber[];
}

export interface Hotel {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  city: string;
  country: string;
  address: string;
  rating: number;
  reviews: number;
  startingPrice: number;
  petsAllowed: boolean;
  heroImage: string;
  gallery: string[];
  highlights: string[];
  amenities: string[];
  description: string;
  roomTypes: RoomType[];
}
