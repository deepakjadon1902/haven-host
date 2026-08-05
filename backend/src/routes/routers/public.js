import { Router } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import { Room } from "../../models/Room.js";
import { Settings } from "../../models/Settings.js";
import { Inventory } from "../../models/Inventory.js";
import { Booking } from "../../models/Booking.js";
import { User } from "../../models/User.js";
import { verifyJwt } from "../../lib/jwt.js";
import { getFromEmail, getResend } from "../../lib/resend.js";

export const publicRouter = Router();

publicRouter.get("/rooms", async (_req, res) => {
  const rooms = await Room.find({ active: true }).sort({
    sortOrder: 1,
    createdAt: -1,
  });
  res.json(rooms.map(toRoomDto));
});

publicRouter.get("/rooms/:slug", async (req, res) => {
  const slug = z.string().trim().min(1).parse(req.params.slug);
  const room = await Room.findOne({ slug, active: true });
  res.json(room ? toRoomDto(room) : null);
});

publicRouter.get("/settings", async (_req, res) => {
  const settings = await Settings.findOne().sort({ updatedAt: -1 });
  res.json(settings ? toSettingsDto(settings) : null);
});

publicRouter.get("/availability", async (req, res) => {
  const input = z
    .object({
      roomId: z.string().min(1),
      from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      days: z.coerce.number().int().min(1).max(365),
    })
    .parse(req.query);

  if (!mongoose.Types.ObjectId.isValid(input.roomId)) {
    res.json({ available: {}, blocked: {} });
    return;
  }

  const room = await Room.findById(input.roomId);
  if (!room) {
    const err = new Error("Room not found");
    err.status = 404;
    throw err;
  }

  const to = addDays(input.from, input.days);
  const inv = await Inventory.find({
    roomId: room._id,
    date: { $gte: input.from, $lte: to },
  }).lean();

  const bookings = await Booking.find({
    roomId: room._id,
    status: { $ne: "cancelled" },
    checkOut: { $gt: input.from },
    checkIn: { $lt: to },
  }).lean();

  const bookedCount = {};
  for (const b of bookings) {
    let cur = b.checkIn;
    while (cur < b.checkOut) {
      bookedCount[cur] = (bookedCount[cur] ?? 0) + 1;
      cur = addDays(cur, 1);
    }
  }

  const blocked = {};
  for (const r of inv) blocked[r.date] = r.status;

  const available = {};
  let cur = input.from;
  for (let i = 0; i <= input.days; i++) {
    const isBlocked =
      blocked[cur] === "closed" || blocked[cur] === "maintenance";
    available[cur] = isBlocked
      ? 0
      : Math.max(0, (room.totalUnits ?? 1) - (bookedCount[cur] ?? 0));
    cur = addDays(cur, 1);
  }

  res.json({ available, blocked });
});

publicRouter.get("/bookings", async (req, res) => {
  const input = z
    .object({ email: z.string().trim().email().max(255) })
    .parse(req.query);
  const rows = await Booking.find({ guestEmail: input.email })
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();
  res.json(rows.map(toBookingDto));
});

publicRouter.get("/bookings/:id", async (req, res) => {
  const id = z.string().min(1).parse(req.params.id);
  const booking = await Booking.findById(id).lean();
  res.json(booking ? toBookingDto(booking) : null);
});

publicRouter.post("/bookings", async (req, res) => {
  const input = bookingCreateSchema.parse(req.body);

  const room =
    input.room_id && mongoose.Types.ObjectId.isValid(input.room_id)
      ? await Room.findById(input.room_id)
      : null;
  const roomName = room?.name ?? input.room_type_name;
  const authUser = await getOptionalAuthUser(req);

  const inserted = await Booking.create({
    reference: input.reference ?? makeReference(),
    hotelName: input.hotel_name ?? "Maison Noir",
    roomTypeName: roomName,
    roomId: room?._id ?? null,
    checkIn: input.check_in,
    checkOut: input.check_out,
    nights: input.nights,
    adults: input.adults,
    children: input.children,
    guestFullName: input.guest_full_name,
    guestEmail: input.guest_email,
    guestPhone: input.guest_phone,
    totalCents: input.total_cents,
    currency: input.currency ?? "INR",
    status: "pending",
    paymentStatus: "unpaid",
    paymentReference: null,
    userId: authUser?._id ?? null,
  });

  const profileUser =
    authUser ?? (await User.findOne({ email: input.guest_email }));
  if (profileUser) {
    let changed = false;
    if (!profileUser.fullName && input.guest_full_name) {
      profileUser.fullName = input.guest_full_name;
      changed = true;
    }
    if (!profileUser.phone && input.guest_phone) {
      profileUser.phone = input.guest_phone;
      changed = true;
    }
    if (changed) await profileUser.save();
  }

  const resend = getResend();
  if (resend) {
    await resend.emails.send({
      from: getFromEmail(),
      to: input.guest_email,
      subject: `Booking confirmed: ${inserted.reference}`,
      text: `Your booking ${inserted.reference} is confirmed for ${roomName} from ${input.check_in} to ${input.check_out}.`,
    });
  }

  res.status(201).json(toBookingDto(inserted.toObject()));
});

function toRoomDto(r) {
  return {
    id: String(r._id),
    slug: r.slug,
    name: r.name,
    description: r.description ?? "",
    pricePerNightCents: r.pricePerNightCents,
    pricePerNight: Math.round((r.pricePerNightCents ?? 0) / 100),
    maxAdults: r.maxAdults,
    maxChildren: r.maxChildren,
    petsAllowed: r.petsAllowed,
    size: r.size ?? null,
    bedType: r.bedType ?? null,
    amenities: r.amenities ?? [],
    images: r.images ?? [],
    coverImage: r.coverImage ?? r.images?.[0] ?? "",
    totalUnits: r.totalUnits ?? 1,
    active: r.active,
    sortOrder: r.sortOrder ?? 0,
  };
}

function toSettingsDto(s) {
  return {
    name: s.name,
    tagline: s.tagline,
    city: s.city,
    country: s.country,
    address: s.address,
    description: s.description,
    heroImage: s.heroImage,
    contactEmail: s.contactEmail,
    contactPhone: s.contactPhone,
  };
}

function toBookingDto(b) {
  return {
    id: String(b._id),
    reference: b.reference,
    hotel_name: b.hotelName,
    room_type_name: b.roomTypeName,
    room_id: b.roomId ? String(b.roomId) : null,
    check_in: b.checkIn,
    check_out: b.checkOut,
    nights: b.nights,
    adults: b.adults,
    children: b.children,
    guest_full_name: b.guestFullName,
    guest_email: b.guestEmail,
    guest_phone: b.guestPhone,
    total_cents: b.totalCents,
    currency: b.currency,
    status: b.status,
    created_at:
      b.createdAt?.toISOString?.() ?? new Date(b.createdAt).toISOString(),
    payment_status: b.paymentStatus,
    payment_reference: b.paymentReference,
  };
}

function addDays(iso, n) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function makeReference() {
  return `MN-${Math.random().toString(16).slice(2, 8).toUpperCase()}`;
}

const bookingCreateSchema = z.object({
  reference: z.string().trim().min(3).max(40).optional(),
  hotel_name: z.string().trim().min(1).max(200).optional(),
  room_type_name: z.string().trim().min(1).max(200),
  room_id: z.string().trim().min(1).optional().nullable(),
  check_in: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  check_out: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  nights: z.number().int().min(1).max(365),
  adults: z.number().int().min(1).max(20),
  children: z.number().int().min(0).max(20),
  guest_full_name: z.string().trim().min(1).max(200),
  guest_email: z.string().trim().email().max(255),
  guest_phone: z.string().trim().min(3).max(40),
  total_cents: z.number().int().min(0).max(1_000_000_000),
  currency: z.string().trim().min(2).max(10).optional(),
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]).optional(),
  payment_status: z.enum(["unpaid", "paid", "failed"]).optional(),
  payment_reference: z.string().trim().max(120).optional(),
});

async function getOptionalAuthUser(req) {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ")
    ? header.slice("Bearer ".length)
    : null;
  if (!token) return null;
  try {
    const payload = verifyJwt(token);
    return await User.findById(payload.sub);
  } catch {
    return null;
  }
}
