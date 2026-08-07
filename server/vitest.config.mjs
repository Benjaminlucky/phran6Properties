import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: false,
    include: ["test/**/*.test.js"],

    // `setupFiles` runs *before* each test file's own imports are evaluated,
    // which is exactly what we need: it boots mongodb-memory-server and points
    // MONGODB_URI at it before `require("../index.js")` calls connectDB().
    setupFiles: ["./test/setup.js"],

    // Forks (not worker threads) — mongod is a real child process per test
    // file, and forks give each file a clean, isolated process.
    pool: "forks",

    // One test file at a time: each file spins up its own in-memory mongod,
    // and running them sequentially keeps startup predictable on Windows.
    fileParallelism: false,

    // Downloading the mongod binary on a cold cache can take a while.
    hookTimeout: 120000,
    testTimeout: 30000,
  },
});
