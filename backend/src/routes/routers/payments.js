import crypto from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import { Booking } from "../../models/Booking.js";
import { Room } from "../../models/Room.js";
import { User } from "../../models/User.js";
import { getEnv } from "../../lib/env.js";
import { verifyJwt } from "../../lib/jwt.js";
import { getFromEmail, getResend } from "../../lib/resend.js";

export const paymentsRouter = Router();

paymentsRouter.post("/razorpay/order", async (req, res) => {
  const input = orderCreateSchema.parse(req.body);
  const config = getRazorpayConfig();
  const authUser = await getOptionalAuthUser(req);

  const room =
    input.room_id && mongoose.Types.ObjectId.isValid(input.room_id)
      ? await Room.findById(input.room_id)
      : null;

  const amount = resolveAmountPaise(input, room);
  const reference = input.reference ?? makeReference();

  const booking = await Booking.create({
    reference,
    hotelName: input.hotel_name ?? "Maison Noir",
    roomTypeName: room?.name ?? input.room_type_name,
    roomId: room?._id ?? null,
    checkIn: input.check_in,
    checkOut: input.check_out,
    nights: input.nights,
    adults: input.adults,
    children: input.children,
    guestFullName: input.guest_full_name,
    guestEmail: input.guest_email,
    guestPhone: input.guest_phone,
    totalCents: amount,
    currency: input.currency ?? "INR",
    status: "pending",
    paymentStatus: "unpaid",
    paymentGateway: "razorpay",
    userId: authUser?._id ?? null,
  });

  const order = await createRazorpayOrder(config, {
    amount,
    currency: booking.currency,
    receipt: booking.reference,
    notes: {
      booking_id: String(booking._id),
      reference: booking.reference,
      room_type_name: booking.roomTypeName,
      guest_email: booking.guestEmail,
    },
  });

  booking.paymentOrderId = order.id;
  await booking.save();

  res.status(201).json({
    key_id: config.keyId,
    booking: toPaymentBookingDto(booking.toObject()),
    order: {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    },
  });
});

paymentsRouter.post("/razorpay/verify", async (req, res) => {
  const input = verifySchema.parse(req.body);
  const config = getRazorpayConfig();
  if (!mongoose.Types.ObjectId.isValid(input.booking_id)) {
    const err = new Error("Payment order not found");
    err.status = 404;
    throw err;
  }
  const booking = await Booking.findById(input.booking_id);

  if (
    !booking ||
    booking.paymentGateway !== "razorpay" ||
    !booking.paymentOrderId
  ) {
    const err = new Error("Payment order not found");
    err.status = 404;
    throw err;
  }

  if (booking.paymentOrderId !== input.razorpay_order_id) {
    const err = new Error("Payment order mismatch");
    err.status = 400;
    throw err;
  }

  const valid = verifyCheckoutSignature({
    orderId: booking.paymentOrderId,
    paymentId: input.razorpay_payment_id,
    signature: input.razorpay_signature,
    secret: config.keySecret,
  });

  if (!valid) {
    booking.paymentStatus = "failed";
    booking.paymentReference = input.razorpay_payment_id;
    await booking.save();
    const err = new Error("Payment signature verification failed");
    err.status = 400;
    throw err;
  }

  await markBookingPaid(booking, input.razorpay_payment_id);
  await sendConfirmationEmail(booking);
  res.json({ ok: true, booking: toPaymentBookingDto(booking.toObject()) });
});

paymentsRouter.post("/razorpay/webhook", async (req, res) => {
  const config = getRazorpayConfig({ requireWebhookSecret: true });
  const signature = req.get("x-razorpay-signature") ?? "";
  const rawBody = req.rawBody;

  if (
    !rawBody ||
    !verifyWebhookSignature(rawBody, signature, config.webhookSecret)
  ) {
    res.status(400).json({ error: "Invalid webhook signature" });
    return;
  }

  res.json({ ok: true });

  const event = req.body?.event;
  if (event !== "order.paid" && event !== "payment.captured") return;

  try {
    const order = req.body?.payload?.order?.entity;
    const payment = req.body?.payload?.payment?.entity;
    const orderId = order?.id ?? payment?.order_id;
    const paymentId = payment?.id ?? null;
    if (!orderId || !paymentId) return;

    const booking = await Booking.findOne({
      paymentGateway: "razorpay",
      paymentOrderId: orderId,
    });
    if (!booking) return;
    await markBookingPaid(booking, paymentId);
    await sendConfirmationEmail(booking);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[payments] Razorpay webhook processing failed", error);
  }
});

function getRazorpayConfig(options = {}) {
  const env = getEnv();
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    const err = new Error("Razorpay is not configured");
    err.status = 503;
    throw err;
  }
  if (options.requireWebhookSecret && !env.RAZORPAY_WEBHOOK_SECRET) {
    const err = new Error("Razorpay webhook secret is not configured");
    err.status = 503;
    throw err;
  }
  return {
    keyId: env.RAZORPAY_KEY_ID,
    keySecret: env.RAZORPAY_KEY_SECRET,
    webhookSecret: env.RAZORPAY_WEBHOOK_SECRET,
  };
}

async function createRazorpayOrder(config, payload) {
  const token = Buffer.from(`${config.keyId}:${config.keySecret}`).toString(
    "base64",
  );
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      authorization: `Basic ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      amount: payload.amount,
      currency: payload.currency,
      receipt: payload.receipt,
      notes: payload.notes,
      payment_capture: 1,
    }),
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const err = new Error(
      body?.error?.description ?? "Failed to create Razorpay order",
    );
    err.status = response.status;
    throw err;
  }
  return body;
}

function resolveAmountPaise(input, room) {
  if (!room) return input.total_cents;
  const roomSubtotal = Number(room.pricePerNightCents ?? 0) * input.nights;
  const taxes = Math.round(roomSubtotal * 0.12);
  return roomSubtotal + taxes;
}

function verifyCheckoutSignature({ orderId, paymentId, signature, secret }) {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return timingSafeEqual(expected, signature);
}

function verifyWebhookSignature(rawBody, signature, secret) {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  return timingSafeEqual(expected, signature);
}

function timingSafeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

async function markBookingPaid(booking, paymentId) {
  if (booking.paymentStatus === "paid" && booking.paymentId === paymentId)
    return booking;
  booking.status = "confirmed";
  booking.paymentStatus = "paid";
  booking.paymentReference = paymentId;
  booking.paymentId = paymentId;
  booking.paymentVerifiedAt = booking.paymentVerifiedAt ?? new Date();
  await booking.save();
  return booking;
}

async function sendConfirmationEmail(booking) {
  const resend = getResend();
  if (!resend || booking.$locals?.confirmationEmailSent) return;
  await resend.emails.send({
    from: getFromEmail(),
    to: booking.guestEmail,
    subject: `Booking confirmed: ${booking.reference}`,
    text: `Your booking ${booking.reference} is confirmed for ${booking.roomTypeName} from ${booking.checkIn} to ${booking.checkOut}.`,
  });
  booking.$locals.confirmationEmailSent = true;
}

function toPaymentBookingDto(b) {
  return {
    id: String(b._id),
    reference: b.reference,
    room_type_name: b.roomTypeName,
    total_cents: b.totalCents,
    currency: b.currency,
    status: b.status,
    payment_status: b.paymentStatus,
    payment_reference: b.paymentReference,
  };
}

function makeReference() {
  return `MN-${Math.random().toString(16).slice(2, 8).toUpperCase()}`;
}

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

const orderCreateSchema = z.object({
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
  total_cents: z.number().int().min(100).max(1_000_000_000),
  currency: z.string().trim().min(2).max(10).default("INR"),
});

const verifySchema = z.object({
  booking_id: z.string().trim().min(1),
  razorpay_order_id: z.string().trim().min(1),
  razorpay_payment_id: z.string().trim().min(1),
  razorpay_signature: z.string().trim().min(1),
});
