import jwt from "jsonwebtoken";
import { getEnv } from "./env.js";

export function signJwt(payload) {
  const env = getEnv();
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN ?? "7d" });
}

export function verifyJwt(token) {
  const env = getEnv();
  return jwt.verify(token, env.JWT_SECRET);
}

