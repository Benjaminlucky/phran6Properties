/**
 * Seeds the PopularArea and Partner collections with the values
 * that were previously hardcoded in HomeSections.jsx.
 *
 * Run once:  node server/seeds/homepage.js
 * Safe to re-run — uses upsert so duplicates are never created.
 */
"use strict";

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const { PopularArea, Partner } = require("../models/Homepage");

const AREAS = [
  {
    name: "Lekki Phase 1",
    location: "Lagos",
    count: "24 Properties",
    sort_order: 0,
  },
  { name: "Ikate", location: "Lagos", count: "18 Properties", sort_order: 1 },
  {
    name: "Chevron Drive",
    location: "Lagos",
    count: "31 Properties",
    sort_order: 2,
  },
  { name: "Maitama", location: "Abuja", count: "15 Properties", sort_order: 3 },
  { name: "Asokoro", location: "Abuja", count: "22 Properties", sort_order: 4 },
  {
    name: "GRA",
    location: "Port Harcourt",
    count: "19 Properties",
    sort_order: 5,
  },
];

const PARTNERS = [
  { name: "Landmark Group", sort_order: 0 },
  { name: "CruxStone Realty", sort_order: 1 },
  { name: "Quest Properties", sort_order: 2 },
  { name: "Veritasi Homes", sort_order: 3 },
  { name: "Mixta Africa", sort_order: 4 },
  { name: "Propertymart", sort_order: 5 },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  for (const area of AREAS) {
    await PopularArea.findOneAndUpdate(
      { name: area.name },
      { $setOnInsert: { ...area, is_active: true } },
      { upsert: true, new: true },
    );
    console.log("  Area upserted:", area.name);
  }

  for (const partner of PARTNERS) {
    await Partner.findOneAndUpdate(
      { name: partner.name },
      { $setOnInsert: { ...partner, is_active: true } },
      { upsert: true, new: true },
    );
    console.log("  Partner upserted:", partner.name);
  }

  console.log("\nSeed complete.");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
