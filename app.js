import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import logger from "morgan";
import connectWithRetry from "./db/mongoose-connection.js";
import resultRouter from "./routes/result.router.js";
import { env } from "./config/Zod.cheker.js";

// ----------------------
// STARTUP GUARD
// ----------------------
if (!env.GATEWAY_SECRET || env.GATEWAY_SECRET.length < 32) {
  console.error(
    "[Result] FATAL: GATEWAY_SECRET is missing or too short. Refusing to start.",
  );
  process.exit(1);
}

// ----------------------
// DB
// ----------------------
connectWithRetry();

const app = express();

// ----------------------
// SECURITY HEADERS
// ----------------------
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] },
    },
    hidePoweredBy: true,
    noSniff: true,
    frameguard: { action: "deny" },
    hsts: { maxAge: 31536000, includeSubDomains: true },
    referrerPolicy: { policy: "no-referrer" },
  }),
);

// ----------------------
// CORS — internal only
// ----------------------
app.use(cors({ origin: false, credentials: true }));

// ----------------------
// CORE MIDDLEWARE
// ----------------------
app.use(logger("dev"));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// ----------------------
// GATEWAY SECRET VERIFICATION
// ----------------------
app.use((req, res, next) => {
  // Allow Render health checks to pass without gateway secret
  if (req.path === "/" && (req.method === "GET" || req.method === "HEAD")) {
    return next();
  }
  const incomingSecret = req.headers["x-gateway-secret"];
  if (!incomingSecret) {
    console.warn(
      `[Result] Blocked — missing x-gateway-secret | IP: ${req.ip} | ${req.method} ${req.path}`,
    );
    return res.status(403).json({ message: "Forbidden" });
  }
  if (incomingSecret !== env.GATEWAY_SECRET) {
    console.warn(
      `[Result] Blocked — invalid x-gateway-secret | IP: ${req.ip} | ${req.method} ${req.path}`,
    );
    return res.status(403).json({ message: "Forbidden" });
  }
  delete req.headers["x-gateway-secret"];
  next();
});

// ----------------------
// ROUTES
// ----------------------
app.get("/", (_req, res) => res.json({ status: "ok", service: "Result API" }));
app.use("/api", resultRouter);

// ----------------------
// 404 + ERROR HANDLER
// ----------------------
app.use((_req, res) => res.status(404).json({ message: "Not found" }));

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("[Result] Unhandled error:", err.message);
  res.status(500).json({ message: "Internal server error" });
});

// ----------------------
// START
// ----------------------
const PORT = Number(env.PORT) || 3004;
app.listen(PORT, () => console.log(`[Result] Server running on port ${PORT}`));
