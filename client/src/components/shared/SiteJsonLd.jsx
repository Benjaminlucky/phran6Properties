import { SITE_CONFIG, SITE_URL } from "@/config/site";

// ── Sitewide structured data ──────────────────────────────────────
// Emitted once from the root layout so every page carries the brand's
// Organization node — upgraded to RealEstateAgent (a LocalBusiness subtype,
// matching the `provider` node the house/land detail pages already emit)
// as soon as a real postal address is configured in settings — plus the
// WebSite node search engines use for sitelinks / knowledge panel.
//
// Detail pages keep emitting their own page-level schema (RealEstateListing,
// BlogPosting, BreadcrumbList) — those are additive and reference the same
// brand by name, so there is no conflict.
//
// Every value comes from the DB-backed site settings with the fallbacks in
// @/config/site — nothing is invented here.

const ENV_SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "";
const ENV_SITE_DESC = process.env.NEXT_PUBLIC_SITE_DESC || "";

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

// Settings may store an absolute Cloudinary URL or a site-relative path.
function absoluteUrl(value) {
  if (!value) return undefined;
  const v = String(value).trim();
  if (!v) return undefined;
  if (/^https?:\/\//i.test(v)) return v;
  return `${SITE_URL}${v.startsWith("/") ? "" : "/"}${v}`;
}

function clean(str) {
  const v = typeof str === "string" ? str.trim() : "";
  return v || undefined;
}

export function buildSiteSchema(settings = {}) {
  const s = settings || {};

  const name =
    clean(s.site_name) || clean(ENV_SITE_NAME) || SITE_CONFIG.name;
  const description =
    clean(s.meta_description) ||
    clean(s.site_tagline) ||
    clean(s.tagline) ||
    clean(ENV_SITE_DESC) ||
    SITE_CONFIG.description;

  const logo = absoluteUrl(s.logo);

  // NAP (name/address/phone) comes from the DB settings only. The
  // SITE_CONFIG values for these are shipped demo placeholders
  // ("+234 800 000 0000", "hello@naijarealty.com", "Lagos, Nigeria") —
  // publishing those into machine-readable structured data would assert
  // a wrong business phone/email to search engines, which is worse than
  // omitting the field. Name/description placeholders are harmless, so
  // those still fall back.
  const telephone = clean(s.phone) || clean(s.whatsapp);
  const email = clean(s.email);
  const address = clean(s.address);

  // schema.org LocalBusiness subtypes (RealEstateAgent) expect an address;
  // without a real one, plain Organization is the valid shape.
  const orgType = address ? "RealEstateAgent" : "Organization";

  // The admin settings form writes `facebook`/`instagram`/…; the footer
  // reads `social_facebook`/… — accept both so sameAs is never empty
  // just because of which key the operator's build saved.
  const sameAs = [
    s.facebook || s.social_facebook,
    s.instagram || s.social_instagram,
    s.twitter || s.social_twitter,
    s.linkedin || s.social_linkedin,
    s.youtube || s.social_youtube,
  ]
    .map((v) => clean(v))
    .filter(Boolean);

  const organization = {
    "@type": orgType,
    "@id": ORG_ID,
    name,
    url: SITE_URL,
    description,
    logo: logo ? { "@type": "ImageObject", url: logo } : undefined,
    image: logo,
    telephone,
    email,
    address: address
      ? {
          "@type": "PostalAddress",
          streetAddress: address,
          addressCountry: "NG",
        }
      : undefined,
    areaServed: { "@type": "Country", name: "Nigeria" },
    sameAs: sameAs.length ? sameAs : undefined,
  };

  const website = {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name,
    description,
    inLanguage: "en-NG",
    publisher: { "@id": ORG_ID },
  };

  const schema = {
    "@context": "https://schema.org",
    "@graph": [organization, website],
  };

  // Drop undefined branches (same normalization the detail pages use)
  return JSON.parse(JSON.stringify(schema));
}

export default function SiteJsonLd({ settings }) {
  const jsonLd = buildSiteSchema(settings);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
