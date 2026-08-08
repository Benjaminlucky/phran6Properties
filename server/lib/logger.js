"use strict";

const pino = require("pino");

// Pretty-print in development so logs stay human-readable at a terminal;
// plain JSON in production so a log aggregator (Railway, Datadog, etc.)
// can parse it as structured data instead of grepping text.
const isProd = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";

const logger = pino({
  level: process.env.LOG_LEVEL || (isTest ? "silent" : isProd ? "info" : "debug"),
  transport: isProd || isTest
    ? undefined
    : {
        target: "pino-pretty",
        options: { colorize: true, translateTime: "HH:MM:ss", ignore: "pid,hostname" },
      },
});

module.exports = logger;
