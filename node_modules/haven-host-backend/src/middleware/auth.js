import { verifyJwt } from "../lib/jwt.js";

export function requireAuth(req, _res, next) {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;
  if (!token) {
    const err = new Error("Unauthorized");
    err.status = 401;
    throw err;
  }
  try {
    req.user = verifyJwt(token);
    next();
  } catch {
    const err = new Error("Unauthorized");
    err.status = 401;
    throw err;
  }
}

export function requireAdmin(req, _res, next) {
  if (req.user?.role !== "admin") {
    const err = new Error("Forbidden");
    err.status = 403;
    throw err;
  }
  next();
}

