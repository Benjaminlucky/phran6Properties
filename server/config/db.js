"use strict";

const mongoose = require("mongoose");
const logger = require("../lib/logger");

let connected = false;

async function connectDB() {
  if (connected) return;
  try {
    if (!process.env.DB_NAME) {
      logger.warn("[DB] DB_NAME env var is not set — defaulting to 'realtymart_cms'. Set DB_NAME in your environment.");
    }
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || "realtymart_cms",
      // Cap concurrent sockets so a traffic spike can't exhaust the
      // Atlas connection allowance for this deployment.
      maxPoolSize: 10,
      // Fail fast (10s) instead of hanging the request when no primary
      // is reachable — the error handler surfaces a 500 rather than a stall.
      serverSelectionTimeoutMS: 10000,
      // Drop sockets idle/blocked for 45s so wedged connections are recycled.
      socketTimeoutMS: 45000,
    });
    connected = true;
    logger.info("[DB] MongoDB connected");
  } catch (err) {
    logger.error({ err }, "[DB] Connection failed");
    process.exit(1);
  }
}

mongoose.connection.on("disconnected", () => {
  connected = false;
  logger.warn("[DB] MongoDB disconnected");
});

module.exports = { connectDB };
