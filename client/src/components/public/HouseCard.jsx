import Link from "next/link";
import Image from "next/image";
import { MapPin, BedDouble, Bath, Car } from "lucide-react";
import {
  formatPrice,
  getStatusBadge,
  getStatusLabel,
  buildWhatsAppLink,
} from "@/lib/utils";
import { API_URL, SITE_CONFIG, SITE_URL } from "@/config/site";

function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const clean = path.replace(/^uploads\//, "");
  return `${API_URL}/uploads/${clean}`;
}

const priceLabelMap = { per_annum: "/ yr", outright: "", on_request: "" };

// Inline WhatsApp SVG — no extra dependency
function WhatsAppIcon({ size = 14 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      style={{ flexShrink: 0 }}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function HouseCard({ house, whatsapp }) {
  const {
    slug,
    title,
    location,
    state,
    price,
    price_label,
    bedrooms,
    bathrooms,
    garage,
    category,
    feature_image,
    status = "available",
    featured,
  } = house;

  const imageUrl = getImageUrl(feature_image);

  // Resolve WhatsApp number: prop > SITE_CONFIG fallback
  const waNumber = whatsapp || SITE_CONFIG.whatsapp;
  const propertyUrl = `${SITE_URL}/houses/${slug}`;
  const priceText =
    price_label === "on_request"
      ? "Price on Request"
      : `${formatPrice(price)}${priceLabelMap[price_label] || ""}`;

  const waMessage =
    `Hello! I'm interested in this property:\n\n` +
    `*${title}*\n` +
    `📍 ${[location, state].filter(Boolean).join(", ")}\n` +
    `💰 ${priceText}\n` +
    (bedrooms != null
      ? `🛏 ${bedrooms === 0 ? "Self Contain" : `${bedrooms} Bedroom${bedrooms > 1 ? "s" : ""}`}\n`
      : "") +
    `\n${propertyUrl}\n\nPlease send me more details.`;

  const waLink = waNumber ? buildWhatsAppLink(waNumber, waMessage) : null;

  const isSoldOrRented = status === "sold" || status === "rented";

  return (
    <article className="card-property">
      {/* ── Image ── */}
      <Link href={`/houses/${slug}`} className="block group">
        <div
          className="relative h-56 overflow-hidden"
          style={{ background: "#1e293b" }}
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={`${title} - Property in ${location}`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="transition-transform duration-500 group-hover:scale-105"
              style={{ objectFit: "cover" }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MapPin size={32} style={{ color: "#475569" }} />
            </div>
          )}

          {/* Gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(28,28,46,0.85) 0%, transparent 55%)",
            }}
          />

          {/* Featured badge */}
          {featured && (
            <div className="absolute top-3 left-3">
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{
                  background: "var(--color-primary)",
                  color: "white",
                  fontFamily: "var(--font-heading)",
                }}
              >
                Featured
              </span>
            </div>
          )}

          {/* Status badge */}
          <div className="absolute top-3 right-3">
            <span className={getStatusBadge(status)}>
              {getStatusLabel(status)}
            </span>
          </div>

          {/* Price + location overlay */}
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
            <div>
              <p
                className="text-xs mb-0.5"
                style={{ color: "rgba(255,255,255,0.65)" }}
              >
                {location}
                {state ? `, ${state}` : ""}
              </p>
              <p
                className="font-bold text-base leading-tight"
                style={{
                  color: "var(--color-primary)",
                  fontFamily: "var(--font-heading)",
                }}
              >
                {priceText}
              </p>
            </div>
          </div>
        </div>
      </Link>

      {/* ── Content ── */}
      <div className="p-4">
        <Link href={`/houses/${slug}`} className="block group">
          <h3
            className="font-bold text-sm mb-3 line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors leading-snug"
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--color-secondary)",
            }}
          >
            {title}
          </h3>
        </Link>

        {/* Specs row */}
        <div
          className="flex items-center gap-4 text-sm pb-3 mb-3"
          style={{
            color: "var(--color-text-secondary)",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          {bedrooms != null && (
            <span className="flex items-center gap-1.5">
              <BedDouble size={14} style={{ color: "var(--color-primary)" }} />
              <span>{bedrooms === 0 ? "Self Con" : `${bedrooms} Bed`}</span>
            </span>
          )}
          {bathrooms != null && (
            <span className="flex items-center gap-1.5">
              <Bath size={14} style={{ color: "var(--color-primary)" }} />
              <span>{bathrooms} Bath</span>
            </span>
          )}
          {garage > 0 && (
            <span className="flex items-center gap-1.5">
              <Car size={14} style={{ color: "var(--color-primary)" }} />
              <span>{garage} Car</span>
            </span>
          )}
          {category && (
            <span
              className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full"
              style={{
                background: "var(--color-surface-3)",
                color: "var(--color-text-secondary)",
              }}
            >
              {category.replace("_", " ")}
            </span>
          )}
        </div>

        {/* ── Action buttons ── */}
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {/* WhatsApp enquiry button */}
          {waLink && !isSoldOrRented && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              title="Enquire on WhatsApp"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.375rem",
                flex: 1,
                padding: "0.625rem 0.75rem",
                borderRadius: "var(--radius)",
                background: "#25D366",
                color: "white",
                fontFamily: "var(--font-heading)",
                fontWeight: 700,
                fontSize: "0.8125rem",
                textDecoration: "none",
                transition: "background 150ms, transform 150ms",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#1ebe5a";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#25D366";
                e.currentTarget.style.transform = "none";
              }}
            >
              <WhatsAppIcon size={14} />
              Enquire
            </a>
          )}

          {/* View Details */}
          <Link
            href={`/houses/${slug}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: waLink && !isSoldOrRented ? "0 0 auto" : 1,
              padding: "0.625rem 1rem",
              borderRadius: "var(--radius)",
              background: "var(--color-secondary)",
              color: "white",
              fontFamily: "var(--font-heading)",
              fontWeight: 700,
              fontSize: "0.8125rem",
              textDecoration: "none",
              transition: "background 150ms",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--color-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--color-secondary)";
            }}
          >
            {isSoldOrRented ? "View" : "Details →"}
          </Link>
        </div>
      </div>
    </article>
  );
}
