"use client";

import Image from "next/image";
import Link from "next/link";
import { SITE_CONFIG } from "@/config/site";

export default function Logo({ settings, className = "" }) {
  const logoUrl = settings?.logo || null;
  const siteName = settings?.site_name || SITE_CONFIG.name;

  return (
    <Link href="/" className={`flex items-center gap-2 shrink-0 ${className}`}>
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt={siteName}
          width={140}
          height={40}
          className="h-10 w-auto object-contain"
          priority
        />
      ) : (
        <span
          className="text-xl font-extrabold tracking-tight"
          style={{
            fontFamily: "var(--font-heading)",
            color: "var(--color-primary)",
          }}
        >
          {siteName}
        </span>
      )}
    </Link>
  );
}
