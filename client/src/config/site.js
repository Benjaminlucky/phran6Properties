// ── API Configuration ──────────────────────────────────────────
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://phran6properties-production.up.railway.app";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
export const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET || "";

// ── Default Site Config ────────────────────────────────────────
// This is the fallback. Real values come from site_settings in the DB.
export const SITE_CONFIG = {
  name: "Real Estate CMS",
  tagline: "Premium Properties Across Nigeria",
  description: "Discover premium lands and houses for sale across Nigeria.",
  phone: "+234 800 000 0000",
  whatsapp: "+234 800 000 0000",
  email: "hello@naijarealty.com",
  address: "Lagos, Nigeria",
  currency: "₦",
  locale: "en-NG",
};

// ── Nigerian States ────────────────────────────────────────────
export const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT - Abuja",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

// ── Popular Locations (cities / areas) ─────────────────────────
export const POPULAR_LOCATIONS = [
  { label: "Lagos", value: "Lagos", state: "Lagos" },
  { label: "Abuja", value: "Abuja", state: "FCT - Abuja" },
  { label: "Port Harcourt", value: "Port Harcourt", state: "Rivers" },
  { label: "Asaba", value: "Asaba", state: "Delta" },
  { label: "Enugu", value: "Enugu", state: "Enugu" },
  { label: "Ibadan", value: "Ibadan", state: "Oyo" },
  { label: "Benin City", value: "Benin City", state: "Edo" },
  { label: "Warri", value: "Warri", state: "Delta" },
  { label: "Calabar", value: "Calabar", state: "Cross River" },
  { label: "Owerri", value: "Owerri", state: "Imo" },
  { label: "Kaduna", value: "Kaduna", state: "Kaduna" },
  { label: "Kano", value: "Kano", state: "Kano" },
];

// ── Land Title Types ───────────────────────────────────────────
export const LAND_TITLES = [
  { label: "Certificate of Occupancy (C of O)", value: "c_of_o" },
  { label: "Governor's Consent", value: "governors_consent" },
  { label: "Deed of Assignment", value: "deed_of_assignment" },
  { label: "Excision", value: "excision" },
  { label: "Gazette", value: "gazette" },
  { label: "Freehold", value: "freehold" },
  { label: "Leasehold", value: "leasehold" },
  { label: "Survey Plan Only", value: "survey_plan" },
];

// ── House Categories ───────────────────────────────────────────
export const HOUSE_CATEGORIES = [
  { label: "Apartment / Flat", value: "apartment", icon: "Building2" },
  { label: "Duplex", value: "duplex", icon: "Home" },
  { label: "Bungalow", value: "bungalow", icon: "House" },
  { label: "Terrace", value: "terrace", icon: "Rows3" },
  { label: "Penthouse", value: "penthouse", icon: "Crown" },
  { label: "Semi-Detached", value: "semi_detached", icon: "HomeIcon" },
  { label: "Detached", value: "detached", icon: "Home" },
  { label: "Commercial", value: "commercial", icon: "Briefcase" },
  { label: "Shortlet", value: "shortlet", icon: "CalendarDays" },
  { label: "Mini Flat", value: "mini_flat", icon: "LayoutGrid" },
];

// ── Property Status Options ────────────────────────────────────
export const PROPERTY_STATUS = [
  { label: "Available", value: "available", color: "green" },
  { label: "Ready to Move In", value: "ready_to_move", color: "green" },
  { label: "Off-Plan", value: "off_plan", color: "yellow" },
  { label: "Coming Soon", value: "coming_soon", color: "yellow" },
  { label: "Sold", value: "sold", color: "red" },
  { label: "Reserved", value: "reserved", color: "purple" },
  { label: "Rented", value: "rented", color: "red" },
];

// ── Land Status Options ────────────────────────────────────────
export const LAND_STATUS = [
  { label: "Available", value: "available", color: "green" },
  { label: "Reserved", value: "reserved", color: "purple" },
  { label: "Sold", value: "sold", color: "red" },
  { label: "Coming Soon", value: "coming_soon", color: "yellow" },
];

// ── Price Label Options ────────────────────────────────────────
export const PRICE_LABELS = [
  { label: "Outright", value: "outright" },
  { label: "Per Annum", value: "per_annum" },
  { label: "On Request", value: "on_request" },
];

// ── Common Amenities (Land) ────────────────────────────────────
export const LAND_AMENITIES = [
  "Perimeter Fence",
  "Electricity (NEPA/PHCN)",
  "Good Road Network",
  "Borehole / Water Supply",
  "Security Post",
  "Street Lights",
  "Drainage System",
  "Recreational Area",
  "Estate Gate",
  "CCTV Surveillance",
  "Solar Street Lights",
  "Sewage System",
];

// ── Common House Features ──────────────────────────────────────
export const HOUSE_FEATURES = [
  "Swimming Pool",
  "Generator (Standby)",
  "Inverter System",
  "Solar Power",
  "CCTV Cameras",
  "Smart Home System",
  "Air Conditioning",
  "Fitted Kitchen",
  "Walk-in Wardrobe",
  "Security Door",
  "Boys Quarters (BQ)",
  "Elevator / Lift",
  "Rooftop Terrace",
  "Garden / Lawn",
  "Covered Parking",
  "Intercom System",
  "Water Treatment",
  "Balcony",
];

// ── Bedroom Options ────────────────────────────────────────────
export const BEDROOM_OPTIONS = [
  { label: "Self Con", value: 0 },
  { label: "1 Bedroom", value: 1 },
  { label: "2 Bedrooms", value: 2 },
  { label: "3 Bedrooms", value: 3 },
  { label: "4 Bedrooms", value: 4 },
  { label: "5 Bedrooms", value: 5 },
  { label: "6+ Bedrooms", value: 6 },
];

// ── Price Ranges (for filters) ─────────────────────────────────
export const PRICE_RANGES = [
  { label: "Under ₦5M", min: 0, max: 5_000_000 },
  { label: "₦5M – ₦20M", min: 5_000_000, max: 20_000_000 },
  { label: "₦20M – ₦50M", min: 20_000_000, max: 50_000_000 },
  { label: "₦50M – ₦100M", min: 50_000_000, max: 100_000_000 },
  { label: "₦100M – ₦500M", min: 100_000_000, max: 500_000_000 },
  { label: "Above ₦500M", min: 500_000_000, max: 9_999_999_999 },
];

// ── Navigation Links ───────────────────────────────────────────
export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Lands", href: "/lands" },
  { label: "Houses", href: "/houses" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

// ── Admin Navigation ───────────────────────────────────────────
export const ADMIN_NAV = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: "LayoutDashboard",
  },
  {
    label: "Lands",
    href: "/admin/lands",
    icon: "MapPin",
    children: [
      { label: "All Lands", href: "/admin/lands" },
      { label: "Add New", href: "/admin/lands/new" },
    ],
  },
  {
    label: "Houses",
    href: "/admin/houses",
    icon: "Home",
    children: [
      { label: "All Houses", href: "/admin/houses" },
      { label: "Add New", href: "/admin/houses/new" },
    ],
  },
  {
    label: "Blog",
    href: "/admin/blog",
    icon: "FileText",
    children: [
      { label: "All Posts", href: "/admin/blog" },
      { label: "Add New", href: "/admin/blog/new" },
    ],
  },
  {
    label: "Media",
    href: "/admin/media",
    icon: "Image",
  },
  {
    label: "Enquiries",
    href: "/admin/enquiries",
    icon: "MessageSquare",
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: "Settings",
    children: [
      { label: "Theme", href: "/admin/settings/theme" },
      { label: "SEO", href: "/admin/settings/seo" },
      { label: "Social", href: "/admin/settings/social" },
    ],
  },
];

// ── Pagination ─────────────────────────────────────────────────
export const ITEMS_PER_PAGE = 12;

// ── Image sizes ────────────────────────────────────────────────
export const IMAGE_SIZES = {
  card: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  hero: "100vw",
  detail: "(max-width: 768px) 100vw, 60vw",
  thumb: "120px",
};

// ── Max file upload size (5MB) ─────────────────────────────────
export const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;

// ── Accepted image types ───────────────────────────────────────
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
