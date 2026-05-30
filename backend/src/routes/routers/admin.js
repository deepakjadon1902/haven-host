import { Router } from "express";
import multer from "multer";
import { z } from "zod";

import { requireAdmin, requireAuth } from "../../middleware/auth.js";
import { Room } from "../../models/Room.js";
import { Settings } from "../../models/Settings.js";
import { Inventory } from "../../models/Inventory.js";
import { Booking } from "../../models/Booking.js";
import { uploadImageBuffer } from "../../lib/cloudinary.js";

export const adminRouter = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 6 * 1024 * 1024 },
});

adminRouter.use(requireAuth, requireAdmin);

adminRouter.get("/rooms", async (_req, res) => {
  const rooms = await Room.find().sort({ sortOrder: 1, createdAt: -1 });
  res.json(rooms.map(toRoomDto));
});

adminRouter.post("/rooms", async (req, res) => {
  const input = roomSchema.parse(req.body);
  const created = await Room.create(input);
  res.status(201).json(toRoomDto(created));
});

adminRouter.patch("/rooms/:id", async (req, res) => {
  const id = z.string().min(1).parse(req.params.id);
  const patch = roomSchema.partial().parse(req.body);
  const updated = await Room.findByIdAndUpdate(id, patch, { new: true });
  if (!updated) {
    const err = new Error("Room not found");
    err.status = 404;
    throw err;
  }
  res.json(toRoomDto(updated));
});

adminRouter.delete("/rooms/:id", async (req, res) => {
  const id = z.string().min(1).parse(req.params.id);
  await Room.findByIdAndDelete(id);
  res.json({ ok: true });
});

adminRouter.get("/settings", async (_req, res) => {
  const settings = await Settings.findOne().sort({ updatedAt: -1 });
  res.json(settings ? toSettingsDto(settings) : null);
});

adminRouter.patch("/settings", async (req, res) => {
  const patch = settingsSchema.parse(req.body);
  const settings =
    (await Settings.findOne().sort({ updatedAt: -1 })) ??
    (await Settings.create({}));
  Object.assign(settings, patch);
  await settings.save();
  res.json(toSettingsDto(settings));
});

adminRouter.get("/inventory", async (req, res) => {
  const input = z
    .object({
      roomId: z.string().min(1),
      from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    })
    .parse(req.query);

  const room = await Room.findById(input.roomId);
  if (!room) {
    const err = new Error("Room not found");
    err.status = 404;
    throw err;
  }

  const inventory = await Inventory.find({
    roomId: room._id,
    date: { $gte: input.from, $lte: input.to },
  }).lean();

  const bookings = await Booking.find({
    roomId: room._id,
    status: { $ne: "cancelled" },
    checkOut: { $gt: input.from },
    checkIn: { $lt: input.to },
  }).lean();

  res.json({
    inventory: inventory.map((r) => ({
      room_id: String(r.roomId),
      date: r.date,
      status: r.status,
      note: r.note ?? null,
    })),
    bookings: bookings.map((b) => ({
      id: String(b._id),
      reference: b.reference,
      guest_full_name: b.guestFullName,
      guest_email: b.guestEmail,
      check_in: b.checkIn,
      check_out: b.checkOut,
      status: b.status,
      total_cents: b.totalCents,
    })),
    room: { name: room.name, total_units: room.totalUnits ?? 1 },
  });
});

adminRouter.post("/inventory", async (req, res) => {
  const input = z
    .object({
      roomId: z.string().min(1),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      status: z.enum(["closed", "maintenance", "open"]),
      note: z.string().max(280).optional(),
    })
    .parse(req.body);

  const room = await Room.findById(input.roomId);
  if (!room) {
    const err = new Error("Room not found");
    err.status = 404;
    throw err;
  }

  if (input.status === "open") {
    await Inventory.findOneAndDelete({ roomId: room._id, date: input.date });
    res.json({ ok: true });
    return;
  }

  await Inventory.findOneAndUpdate(
    { roomId: room._id, date: input.date },
    { status: input.status, note: input.note ?? null },
    { upsert: true, new: true },
  );
  res.json({ ok: true });
});

adminRouter.get("/bookings", async (_req, res) => {
  const bookings = await Booking.find()
    .sort({ createdAt: -1 })
    .limit(500)
    .lean();
  res.json(bookings.map(toBookingDto));
});

adminRouter.get("/stats", async (_req, res) => {
  const todayIso = new Date().toISOString().slice(0, 10);
  const since30 = new Date(Date.now() - 30 * 86400000);

  const rooms = await Room.find().lean();
  const activeRooms = rooms.filter((r) => r.active);
  const totalRooms = rooms.length;
  const totalUnits = activeRooms.reduce(
    (sum, r) => sum + (r.totalUnits ?? 0),
    0,
  );

  const last30 = await Booking.find({ createdAt: { $gte: since30 } }).lean();
  const revenue30dCents = last30
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + (b.totalCents ?? 0), 0);
  const totalBookings30d = last30.length;

  const bookedToday = await Booking.countDocuments({
    status: { $ne: "cancelled" },
    checkIn: { $lte: todayIso },
    checkOut: { $gt: todayIso },
  });
  const occupancyPct =
    totalUnits > 0
      ? Math.min(100, Math.round((bookedToday / totalUnits) * 100))
      : 0;

  const upcomingBookings = await Booking.find({
    checkIn: { $gte: todayIso },
    status: { $ne: "cancelled" },
  })
    .sort({ checkIn: 1 })
    .limit(10)
    .lean();

  const upcoming = upcomingBookings.map((b) => ({
    id: String(b._id),
    reference: b.reference,
    guest_full_name: b.guestFullName,
    room_type_name: b.roomTypeName,
    check_in: b.checkIn,
    check_out: b.checkOut,
    status: b.status,
  }));

  const dayIso = (d) => {
    const x = new Date(
      Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
    );
    return x.toISOString().slice(0, 10);
  };
  const now = new Date();
  const chartDays = [];
  for (let i = 13; i >= 0; i--)
    chartDays.push(dayIso(new Date(now.getTime() - i * 86400000)));

  const counts = new Map();
  for (const k of chartDays) counts.set(k, 0);

  const since14 = new Date(Date.now() - 14 * 86400000);
  const recent = await Booking.find({ createdAt: { $gte: since14 } }).lean();
  for (const b of recent) {
    const d = (
      b.createdAt?.toISOString?.() ?? new Date(b.createdAt).toISOString()
    ).slice(0, 10);
    if (counts.has(d)) counts.set(d, (counts.get(d) ?? 0) + 1);
  }

  const chart = chartDays.map((date) => ({
    date,
    count: counts.get(date) ?? 0,
  }));

  res.json({
    totalRooms,
    totalUnits,
    totalBookings30d,
    occupancyPct,
    revenue30dCents,
    upcoming,
    chart,
  });
});

adminRouter.post("/bookings/:id/cancel", async (req, res) => {
  const id = z.string().min(1).parse(req.params.id);
  const booking = await Booking.findById(id);
  if (!booking) {
    const err = new Error("Booking not found");
    err.status = 404;
    throw err;
  }
  booking.status = "cancelled";
  await booking.save();
  res.json({ ok: true });
});

adminRouter.post("/uploads/image", upload.single("file"), async (req, res) => {
  if (!req.file?.buffer) {
    const err = new Error("Missing file");
    err.status = 400;
    throw err;
  }
  const result = await uploadImageBuffer({
    buffer: req.file.buffer,
    folder: "haven-host",
  });
  res.json({ url: result.secure_url, publicId: result.public_id });
});

const roomSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "lowercase letters, numbers and hyphens only"),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(4000).default(""),
  pricePerNightCents: z.number().int().min(0).max(100_000_000),
  maxAdults: z.number().int().min(1).max(20),
  maxChildren: z.number().int().min(0).max(20),
  petsAllowed: z.boolean(),
  size: z.string().max(40).optional().nullable(),
  bedType: z.string().max(60).optional().nullable(),
  amenities: z.array(z.string().min(1).max(80)).max(40).default([]),
  images: z.array(z.string().url().max(800)).max(20).default([]),
  coverImage: z.string().url().max(800).optional().nullable(),
  totalUnits: z.number().int().min(1).max(500),
  active: z.boolean().default(true),
  sortOrder: z.number().int().min(0).max(10_000).default(0),
});

const settingsSchema = z
  .object({
    name: z.string().max(120).optional(),
    tagline: z.string().max(200).optional(),
    city: z.string().max(120).optional(),
    country: z.string().max(120).optional(),
    address: z.string().max(300).optional(),
    description: z.string().max(5000).optional(),
    heroImage: z.string().url().max(800).optional(),
    contactEmail: z.string().email().max(255).optional(),
    contactPhone: z.string().max(60).optional(),
  })
  .strict();

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
