import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { OAuth2Client } from "google-auth-library";

import { Otp } from "../../models/Otp.js";
import { User } from "../../models/User.js";
import { signJwt } from "../../lib/jwt.js";
import { getEnv } from "../../lib/env.js";
import { getFromEmail, getResend } from "../../lib/resend.js";

export const authRouter = Router();

function randomOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

authRouter.post("/request-otp", async (req, res) => {
  const input = z
    .object({
      email: z.string().trim().email().max(255),
      purpose: z.enum(["login", "signup"]).default("login"),
    })
    .parse(req.body);

  const code = randomOtpCode();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await Otp.deleteMany({ email: input.email, purpose: input.purpose });
  await Otp.create({ email: input.email, purpose: input.purpose, codeHash, expiresAt });

  const resend = getResend();
  if (resend) {
    await resend.emails.send({
      from: getFromEmail(),
      to: input.email,
      subject: "Your Maison Noir verification code",
      text: `Your verification code is ${code}. It expires in 10 minutes.`,
    });
  } else {
    // eslint-disable-next-line no-console
    console.warn("[backend] RESEND_API_KEY not set; returning OTP in response for local dev.");
  }

  res.json({
    ok: true,
    devCode: resend ? undefined : code,
    expiresAt: expiresAt.toISOString(),
  });
});

authRouter.post("/verify-otp", async (req, res) => {
  const input = z
    .object({
      email: z.string().trim().email().max(255),
      code: z.string().trim().min(4).max(12),
      fullName: z.string().trim().max(120).optional(),
    })
    .parse(req.body);

  const otp = await Otp.findOne({ email: input.email }).sort({ createdAt: -1 });
  if (!otp || otp.expiresAt.getTime() < Date.now()) {
    const err = new Error("OTP expired or not found");
    err.status = 400;
    throw err;
  }

  const ok = await bcrypt.compare(input.code, otp.codeHash);
  if (!ok) {
    const err = new Error("Invalid OTP");
    err.status = 400;
    throw err;
  }

  await Otp.deleteMany({ email: input.email });

  let user = await User.findOne({ email: input.email });
  if (!user) {
    user = await User.create({ email: input.email, fullName: input.fullName ?? "" });
  }

  const token = signJwt({ sub: String(user._id), email: user.email, role: user.role });
  res.json({ token, user: { id: String(user._id), email: user.email, role: user.role } });
});

authRouter.post("/admin/login", async (req, res) => {
  const input = z
    .object({ email: z.string().trim().email().max(255), password: z.string().min(1).max(200) })
    .parse(req.body);

  const env = getEnv();
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
    const err = new Error("Admin auth is not configured");
    err.status = 500;
    throw err;
  }

  const emailOk = input.email.toLowerCase() === env.ADMIN_EMAIL.toLowerCase();
  const passOk = input.password === env.ADMIN_PASSWORD;
  if (!emailOk || !passOk) {
    const err = new Error("Invalid credentials");
    err.status = 401;
    throw err;
  }

  let admin = await User.findOne({ email: env.ADMIN_EMAIL });
  if (!admin) admin = await User.create({ email: env.ADMIN_EMAIL, role: "admin" });
  if (admin.role !== "admin") {
    admin.role = "admin";
    await admin.save();
  }

  const token = signJwt({ sub: String(admin._id), email: admin.email, role: "admin" });
  res.json({ token, user: { id: String(admin._id), email: admin.email, role: "admin" } });
});

authRouter.post("/google", async (req, res) => {
  const input = z
    .object({
      credential: z.string().min(10),
      fullName: z.string().trim().max(120).optional(),
    })
    .parse(req.body);

  const env = getEnv();
  if (!env.GOOGLE_CLIENT_ID) {
    const err = new Error("Google auth is not configured");
    err.status = 500;
    throw err;
  }

  const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);
  const ticket = await client.verifyIdToken({
    idToken: input.credential,
    audience: env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  const email = payload?.email?.trim().toLowerCase();
  if (!email) {
    const err = new Error("Google token missing email");
    err.status = 400;
    throw err;
  }

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ email, fullName: payload?.name ?? input.fullName ?? "" });
  }

  const token = signJwt({ sub: String(user._id), email: user.email, role: user.role });
  res.json({ token, user: { id: String(user._id), email: user.email, role: user.role } });
});
