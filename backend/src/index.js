import dotenv from "dotenv";
dotenv.config();

import http from "node:http";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { connectMongo } from "./lib/mongo.js";
import { registerRoutes } from "./routes/index.js";
import { errorMiddleware, notFoundMiddleware } from "./middleware/errors.js";
import { seedIfEmpty } from "./seed/seed.js";

const app = express();

app.set("trust proxy", true);
app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.json({ ok: true }));

registerRoutes(app);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

const port = Number(process.env.PORT ?? 5000);

async function main() {
  await connectMongo(process.env.MONGODB_URI);
  await seedIfEmpty();

  const server = http.createServer(app);
  server.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`[backend] listening on http://localhost:${port}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

