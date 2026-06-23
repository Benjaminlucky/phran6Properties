import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ── Tailwind class merger (used by shadcn/ui) ──────────────────
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ── Format price in Naira ──────────────────────────────────────
// Usage: formatPrice(5000000) → "₦5,000,000"
// Usage: formatPrice(5000000, true) → "₦5M"
export function formatPrice(amount, short = false) {
  if (!amount) return "Price on Request";

  const num = Number(amount);

  if (short) {
    if (num >= 1_000_000_000) return `₦${(num / 1_000_000_000).toFixed(1)}B`;
    if (num >= 1_000_000) return `₦${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `₦${(num / 1_000).toFixed(0)}K`;
    return `₦${num.toLocaleString("en-NG")}`;
  }

  return `₦${num.toLocaleString("en-NG")}`;
}

// ── Generate URL slug from string ─────────────────────────────
// Usage: slugify("Greenfield Estate Phase 2") → "greenfield-estate-phase-2"
export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

// ── Truncate text ─────────────────────────────────────────────
// Usage: truncate("Long text here...", 100)
export function truncate(text, maxLength = 120) {
  if (!text) return "";
  const stripped = stripHtml(text);
  if (stripped.length <= maxLength) return stripped;
  return stripped.slice(0, maxLength).trim() + "…";
}

// ── Strip HTML tags ───────────────────────────────────────────
export function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
}

// ── Calculate reading time ────────────────────────────────────
// Usage: readingTime("Long article text...") → "3 min read"
export function readingTime(text) {
  const wordsPerMinute = 200;
  const words = stripHtml(text).split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}

// ── Format date for Nigeria ───────────────────────────────────
// Usage: formatDate("2024-01-15") → "15 January 2024"
export function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ── Format date short ─────────────────────────────────────────
// Usage: formatDateShort("2024-01-15") → "Jan 15, 2024"
export function formatDateShort(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ── Get time ago ─────────────────────────────────────────────
// Usage: timeAgo("2024-01-01") → "3 months ago"
export function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);

  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
    }
  }

  return "Just now";
}

// ── Extract YouTube video ID ──────────────────────────────────
// Handles: youtu.be/ID, youtube.com/watch?v=ID, youtube.com/embed/ID
export function getYouTubeId(url) {
  if (!url) return null;
  const patterns = [
    /youtu\.be\/([^?&]+)/,
    /youtube\.com\/watch\?v=([^?&]+)/,
    /youtube\.com\/embed\/([^?&]+)/,
    /youtube\.com\/shorts\/([^?&]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// ── Build YouTube embed URL ───────────────────────────────────
export function getYouTubeEmbed(url) {
  const id = getYouTubeId(url);
  if (!id) return null;
  return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`;
}

// ── Build YouTube thumbnail ───────────────────────────────────
export function getYouTubeThumbnail(url) {
  const id = getYouTubeId(url);
  if (!id) return null;
  return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
}

// ── Get property status badge class ──────────────────────────
export function getStatusBadge(status) {
  const map = {
    available: "badge-available",
    ready_to_move: "badge-available",
    off_plan: "badge-offplan",
    coming_soon: "badge-offplan",
    sold: "badge-sold",
    rented: "badge-sold",
    reserved: "badge-reserved",
  };
  return map[status] || "badge-available";
}

// ── Get property status label ─────────────────────────────────
export function getStatusLabel(status) {
  const map = {
    available: "Available",
    ready_to_move: "Ready to Move In",
    off_plan: "Off-Plan",
    coming_soon: "Coming Soon",
    sold: "Sold",
    rented: "Rented",
    reserved: "Reserved",
  };
  return map[status] || status;
}

// ── Build WhatsApp link ───────────────────────────────────────
// Usage: buildWhatsAppLink("+2348012345678", "I'm interested in Greenfield Estate...")
export function buildWhatsAppLink(phone, message) {
  const cleaned = phone.replace(/\D/g, "");
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${cleaned}?text=${encoded}`;
}

// ── Build property enquiry WhatsApp message ───────────────────
export function buildPropertyWhatsApp(phone, propertyTitle, propertyUrl) {
  const message = `Hello! I'm interested in this property:\n\n*${propertyTitle}*\n${propertyUrl}\n\nPlease provide more details.`;
  return buildWhatsAppLink(phone, message);
}

// ── Build share URL ────────────────────────────────────────────
export function buildShareUrl(path) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return `${base}${path}`;
}

// ── Clamp number between min and max ─────────────────────────
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// ── Check if a URL is external ────────────────────────────────
export function isExternalUrl(url) {
  return url?.startsWith("http") || url?.startsWith("//");
}

// ── Get initials from name ────────────────────────────────────
// Usage: getInitials("Chukwuemeka Obi") → "CO"
export function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ── Debounce function ─────────────────────────────────────────
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
