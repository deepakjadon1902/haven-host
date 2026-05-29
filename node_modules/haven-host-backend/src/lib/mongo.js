import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

export async function connectMongo(uri) {
  mongoose.set("strictQuery", true);

  const useMemory = String(process.env.MONGODB_USE_MEMORY ?? "").toLowerCase() === "true";
  if (!uri && !useMemory) throw new Error("Missing MONGODB_URI");
  if (!uri && useMemory) uri = "mongodb://127.0.0.1:27017/haven_host";

  try {
    await mongoose.connect(uri);
  } catch (err) {
    const code = err && typeof err === "object" ? err.code : undefined;
    const msg = err instanceof Error ? err.message : String(err);
    const isConnRefused =
      code === "ECONNREFUSED" || msg.includes("ECONNREFUSED") || msg.includes("ServerSelectionError");

    if (process.env.NODE_ENV !== "production" && isConnRefused && useMemory) {
      // eslint-disable-next-line no-console
      console.warn(
        `[backend] MongoDB connection failed (${msg}); starting in-memory MongoDB for dev.`,
      );
      const mem = await MongoMemoryServer.create();
      const memUri = mem.getUri("haven_host");
      await mongoose.connect(memUri);
      setupMemoryShutdown(mem);
      return;
    }

    if (isConnRefused) {
      const e = new Error(
        "MongoDB is not reachable. Start MongoDB locally or set a MongoDB Atlas URI in MONGODB_URI.",
      );
      e.cause = err;
      throw e;
    }
    throw err;
  }
}

function setupMemoryShutdown(mem) {
  const stop = async () => {
    try {
      await mongoose.disconnect();
    } catch {
      // ignore
    }
    try {
      await mem.stop();
    } catch {
      // ignore
    }
  };
  process.once("SIGINT", () => void stop().finally(() => process.exit(0)));
  process.once("SIGTERM", () => void stop().finally(() => process.exit(0)));
}
