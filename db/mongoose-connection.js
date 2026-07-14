import mongoose from "mongoose";
import debug from "debug";
import { env } from "../config/Zod.cheker.js";

const dbgr = debug("development:result");

// ----------------------
// CONFIG
// ----------------------
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;
const MONGO_OPTIONS = {
  serverSelectionTimeoutMS: 5000, // How long to wait for a server to be found
  socketTimeoutMS: 45000, // How long a send/receive can take before timing out
  maxPoolSize: 10, // Max concurrent connections in the pool
};

// ----------------------
// CONNECTION STATE
// ----------------------
let retryCount = 0;
let retryTimer = null;
let isShuttingDown = false;

// ----------------------
// EVENT MONITORING
// ----------------------
// Mongoose fires these after the initial connect() resolves — they cover
// unexpected drops, replica-set failovers, and reconnects.
mongoose.connection.on("connected", () => {
  retryCount = 0; // Reset on successful connection
  dbgr("MongoDB connected: %s", mongoose.connection.host);
  console.info("[DB] MongoDB connected:", mongoose.connection.host);
});

mongoose.connection.on("disconnected", () => {
  if (isShuttingDown) return; // Expected — don't retry during shutdown
  console.warn("[DB] MongoDB disconnected. Scheduling reconnect...");
  scheduleRetry();
});

mongoose.connection.on("error", (err) => {
  // Mongoose already handles most errors internally; this catches anything
  // that slips through (e.g. auth failures post-connect)
  console.error("[DB] MongoDB connection error:", err.message);
});

// ----------------------
// RETRY SCHEDULER
// ----------------------
const scheduleRetry = () => {
  if (retryTimer || isShuttingDown) return; // Prevent duplicate timers

  if (retryCount >= MAX_RETRIES) {
    console.error(
      `[DB] MongoDB connection failed after ${MAX_RETRIES} attempts. Giving up.`,
    );
    // In a long-running service, unrecoverable DB loss is fatal.
    // Let the process manager (PM2 / Kubernetes) restart cleanly.
    process.exit(1);
  }

  retryCount++;
  const delay = RETRY_DELAY_MS * retryCount; // Exponential-ish back-off
  console.warn(
    `[DB] Retrying MongoDB connection in ${delay}ms... (attempt ${retryCount}/${MAX_RETRIES})`,
  );

  retryTimer = setTimeout(() => {
    retryTimer = null;
    connectWithRetry();
  }, delay);
};

// ----------------------
// CONNECT
// ----------------------
const connectWithRetry = () => {
  if (isShuttingDown) return;

  mongoose.connect(env.MONGO_URI, MONGO_OPTIONS).catch((err) => {
    // Initial connect failure — .on("disconnected") won't fire here,
    // so we handle retry scheduling explicitly.
    console.error("[DB] MongoDB initial connection failed:", err.message);
    dbgr("connection error: %O", err);
    scheduleRetry();
  });
  // Success is handled by the "connected" event listener above.
};

// ----------------------
// GRACEFUL SHUTDOWN
// ----------------------
// Close the connection cleanly when the process exits so in-flight
// operations can complete and the pool drains properly.
const gracefulShutdown = async (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }

  console.info(`[DB] ${signal} received — closing MongoDB connection...`);
  try {
    await mongoose.connection.close();
    console.info("[DB] MongoDB connection closed cleanly.");
  } catch (err) {
    console.error("[DB] Error closing MongoDB connection:", err.message);
  } finally {
    process.exit(0);
  }
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

// ----------------------
// EXPORT
// ----------------------
export default connectWithRetry;
