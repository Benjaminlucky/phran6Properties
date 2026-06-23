"use strict";

const mongoose = require("mongoose");

let connected = false;

async function connectDB() {
  if (connected) return;
  try {
    if (!process.env.DB_NAME) {
      console.warn("[DB] DB_NAME env var is not set — defaulting to 'realtymart_cms'. Set DB_NAME in your environment.");
    }
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || "realtymart_cms",
    });
    connected = true;
    console.log("[DB] MongoDB connected");
  } catch (err) {
    console.error("[DB] Connection failed:", err.message);
    process.exit(1);
  }
}

mongoose.connection.on("disconnected", () => {
  connected = false;
  console.warn("[DB] MongoDB disconnected");
});

module.exports = { connectDB };
