import { Resend } from "resend";
import { getEnv } from "./env.js";

export function getResend() {
  const env = getEnv();
  if (!env.RESEND_API_KEY) return null;
  return new Resend(env.RESEND_API_KEY);
}

export function getFromEmail() {
  const env = getEnv();
  return env.RESEND_FROM_EMAIL ?? "no-reply@example.com";
}

