export type InventoryStatus = "closed" | "maintenance";

export interface Room {
  id: string;
  hotelId?: string;
  hotelName?: string;
  hotelCity?: string;
  slug: string;
  name: string;
  description: string;
  pricePerNightCents: number;
  pricePerNight: number;
  maxAdults: number;
  maxChildren: number;
  petsAllowed: boolean;
  size: string | null;
  bedType: string | null;
  amenities: string[];
  images: string[];
  coverImage: string;
  totalUnits: number;
  active: boolean;
  sortOrder: number;
}

export type SubscriptionTier = "starter" | "signature" | "black";

export interface Hotel {
  id: string;
  slug: string;
  name: string;
  city: string;
  country: string;
  address: string;
  tagline: string;
  description: string;
  image: string;
  images?: string[];
  rating: number;
  reviewCount: number;
  subscriptionTier: SubscriptionTier;
  partnerName: string;
  featuredAmenities: string[];
  termsAndConditions?: string;
  cancellationPolicy?: string;
  checkInInstructions?: string;
  partnerContactEmail?: string;
  partnerContactPhone?: string;
  upiId?: string;
}

export interface HotelSettings {
  name: string;
  tagline: string;
  city: string;
  country: string;
  address: string;
  description: string;
  heroImage: string;
  contactEmail: string;
  contactPhone: string;
}

export interface RoomAvailabilityMap {
  /** ISO date -> available unit count */
  available: Record<string, number>;
  /** ISO date -> "closed" | "maintenance" | "booked" (only set when fully blocked) */
  blocked: Partial<Record<string, "closed" | "maintenance" | "booked">>;
}
