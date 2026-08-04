import dotenv from "dotenv";
dotenv.config();

import http from "node:http";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { connectMongo } from "./lib/mongo.js";
import { getEnv } from "./lib/env.js";
import { registerRoutes } from "./routes/index.js";
import { errorMiddleware, notFoundMiddleware } from "./middleware/errors.js";
import { seedIfEmpty } from "./seed/seed.js";

const app = express();
const env = getEnv();
let dbReady = false;
let dbError = null;

const defaultAllowedOrigins = [
  "http://localhost:5173",
  "https://haven-host-frontend-5etw.vercel.app",
];

const allowedOrigins = new Set(
  [
    ...defaultAllowedOrigins,
    env.APP_BASE_URL,
    env.FRONTEND_URL,
    ...(env.CORS_ORIGINS ?? "").split(","),
  ]
    .map((origin) => origin?.trim())
    .filter(Boolean),
);

app.set("trust proxy", true);
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/health", (_req, res) =>
  res.json({
    ok: true,
    db: dbReady ? "connected" : "connecting",
    error: dbReady || !dbError ? undefined : dbError.message,
  }),
);

app.use("/api", (_req, res, next) => {
  if (dbReady) {
    next();
    return;
  }

  res.status(503).json({
    error: "Backend is starting. Database connection is not ready yet.",
  });
});

registerRoutes(app);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

const port = Number(process.env.PORT ?? 5000);

async function main() {
  const server = http.createServer(app);
  server.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`[backend] listening on http://localhost:${port}`);
  });

  try {
    await connectMongo(process.env.MONGODB_URI);
    await seedIfEmpty();
    dbReady = true;
    dbError = null;
    // eslint-disable-next-line no-console
    console.log("[backend] MongoDB connected");
  } catch (err) {
    dbReady = false;
    dbError = err instanceof Error ? err : new Error(String(err));
    // eslint-disable-next-line no-console
    console.error("[backend] MongoDB startup failed", dbError);
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

