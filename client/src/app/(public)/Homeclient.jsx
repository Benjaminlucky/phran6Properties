"use client";

import HeroSection from "@/components/public/home/HeroSection";
import {
  FeaturedLands,
  FeaturedHouses,
  PopularAreas,
  Testimonials,
  Partners,
} from "@/components/public/home/HomeSections";

/**
 * HomeClient — thin client boundary wrapper for the home page.
 *
 * HeroSection is now "use client" (needs CountUp / IntersectionObserver),
 * but all its data still arrives as props fetched server-side in page.jsx
 * so there's no client-side fetch waterfall.
 */
export default function HomeClient({
  lands,
  houses,
  settings,
  publicStats,
  popularAreas,
  testimonials,
  partners,
}) {
  return (
    <>
      <HeroSection settings={settings} publicStats={publicStats} />
      <FeaturedLands lands={lands} />
      <FeaturedHouses houses={houses} />
      <PopularAreas areas={popularAreas} />
      <Testimonials testimonials={testimonials} />
      <Partners partners={partners} />
    </>
  );
}
