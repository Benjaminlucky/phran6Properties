import Link from "next/link";
import Image from "next/image";
import { MapPin, Ruler } from "lucide-react";
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

const TITLE_LABELS = {
  c_of_o: "C of O",
  governors_consent: "Gov's Consent",
  deed_of_assignment: "Deed of Assignment",
  excision: "Excision",
  gazette: "Gazette",
  freehold: "Freehold",
  leasehold: "Leasehold",
  survey_plan: "Survey Plan",
};

// WhatsApp SVG icon — inline so there's no extra dependency
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

export default function PropertyCard({ land, whatsapp }) {
  const {
    slug,
    estate_name,
    location,
    state,
    price,
    size,
    title_type,
    feature_image,
    status = "available",
  } = land;

  const imageUrl = getImageUrl(feature_image);

  // Resolve WhatsApp number: prop > SITE_CONFIG fallback
  const waNumber = whatsapp || SITE_CONFIG.whatsapp;
  const propertyUrl = `${SITE_URL}/lands/${slug}`;
  const waMessage =
    `Hello! I'm interested in this land listing:\n\n` +
    `*${estate_name}*\n` +
    `📍 ${[location, state].filter(Boolean).join(", ")}\n` +
    (price ? `💰 ${formatPrice(price)}\n` : "") +
    (size ? `📐 ${size}\n` : "") +
    `\n${propertyUrl}\n\nPlease send me more details.`;

  const waLink = waNumber ? buildWhatsAppLink(waNumber, waMessage) : null;

  const isSold = status === "sold";

  return (
    <article className="card-property">
      {/* ── Image ── */}
      <Link href={`/lands/${slug}`} className="block">
        <div
          className="relative h-52 overflow-hidden"
          style={{ background: "#f1f5f9" }}
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={`${estate_name} - Land for sale in ${location}`}
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
          {/* Status badge */}
          <div className="absolute top-3 left-3">
            <span className={getStatusBadge(status)}>
              {getStatusLabel(status)}
            </span>
          </div>
          {/* Title type badge */}
          {title_type && (
            <div className="absolute top-3 right-3">
              <span
                className="text-xs font-semibold px-2 py-1 rounded-full"
                style={{
                  background: "var(--color-secondary)",
                  color: "white",
                  fontFamily: "var(--font-heading)",
                }}
              >
                {TITLE_LABELS[title_type] || title_type}
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* ── Content ── */}
      <div className="p-4">
        <Link href={`/lands/${slug}`} className="block group">
          <h3
            className="font-bold text-base mb-1 line-clamp-1 group-hover:text-[var(--color-primary)] transition-colors"
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--color-secondary)",
            }}
          >
            {estate_name}
          </h3>
          <div
            className="flex items-center gap-1 text-sm mb-3"
            style={{ color: "var(--color-text-muted)" }}
          >
            <MapPin size={13} />
            <span className="line-clamp-1">
              {location}
              {state ? `, ${state}` : ""}
            </span>
          </div>
          <div className="flex items-center justify-between mb-4">
            {size && (
              <div
                className="flex items-center gap-1 text-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                <Ruler size={13} />
                <span>{size}</span>
              </div>
            )}
            <span className="price-badge">{formatPrice(price, true)}</span>
          </div>
        </Link>

        {/* ── Action buttons ── */}
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {/* WhatsApp button */}
          {waLink && !isSold && (
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

          {/* View Details button */}
          <Link
            href={`/lands/${slug}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: waLink && !isSold ? "0 0 auto" : 1,
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
            {isSold ? "View" : "Details →"}
          </Link>
        </div>
      </div>
    </article>
  );
}
