import { authRouter } from "./routers/auth.js";
import { publicRouter } from "./routers/public.js";
import { adminRouter } from "./routers/admin.js";

export function registerRoutes(app) {
  app.use("/api/auth", authRouter);
  app.use("/api/public", publicRouter);
  app.use("/api/admin", adminRouter);
}

