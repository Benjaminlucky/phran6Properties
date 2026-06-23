"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { settingsApi, mediaApi } from "@/lib/api";
import { API_URL } from "@/config/site";
import { toast } from "sonner";
import {
  Settings,
  Save,
  Loader2,
  RefreshCw,
  Palette,
  Globe,
  Phone,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Eye,
  Upload,
  X,
  Image as ImageIcon,
  Plus,
  Link as LinkIcon,
  GripVertical,
  Navigation,
  MessageCircle,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

// ── Style constants ───────────────────────────────────────────────
const S = {
  card: {
    background: "var(--color-surface, white)",
    border: "1px solid var(--color-border, #E2E8F0)",
    borderRadius: "var(--radius-lg, 1rem)",
    padding: "1.5rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    marginBottom: "1.5rem",
  },
  label: {
    display: "block",
    fontSize: "0.75rem",
    fontWeight: 600,
    marginBottom: "0.375rem",
    color: "var(--color-text-secondary, #475569)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    fontFamily: "Plus Jakarta Sans, sans-serif",
  },
  input: {
    width: "100%",
    padding: "0.625rem 0.875rem",
    borderRadius: "var(--radius, 0.625rem)",
    border: "1px solid var(--color-border, #E2E8F0)",
    fontSize: "0.875rem",
    color: "var(--color-text, #0F172A)",
    outline: "none",
    background: "var(--color-surface, white)",
    boxSizing: "border-box",
    transition: "border-color 150ms",
    fontFamily: "Inter, sans-serif",
  },
  sectionTitle: {
    fontFamily: "Plus Jakarta Sans, sans-serif",
    fontWeight: 700,
    fontSize: "1rem",
    color: "var(--color-text, #0F172A)",
    margin: "0 0 1.25rem",
    display: "flex",
    alignItems: "center",
    gap: "0.625rem",
  },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" },
};

const focus = (e) =>
  (e.target.style.borderColor = "var(--color-primary, #FF6B6B)");
const blur = (e) =>
  (e.target.style.borderColor = "var(--color-border, #E2E8F0)");

// ── Default theme values ──────────────────────────────────────────
const THEME_DEFAULTS = {
  theme_primary: "#b2ff70",
  theme_primary_dark: "#1b2f31",
  theme_primary_light: "#d4ffaa",
  theme_primary_muted: "#e8ffd6",
  theme_secondary: "#1b2f31",
  theme_secondary_dark: "#132224",
  theme_secondary_mid: "#2a4547",
  theme_secondary_light: "#3a5d60",
  theme_accent: "#b2ff70",
  theme_accent_light: "#d4ffaa",
  theme_surface: "#ffffff",
  theme_surface_2: "#f4f9f4",
  theme_surface_3: "#edf5ed",
  theme_border: "#e2e8e0",
  theme_text: "#0f1f20",
  theme_text_secondary: "#3d5a5c",
  theme_text_muted: "#a8c4c6",
  theme_radius: "0.625rem",
  theme_radius_lg: "1rem",
  theme_radius_xl: "1.5rem",
};

// ── Preset themes ─────────────────────────────────────────────────
const PRESETS = [
  {
    name: "Lime Teal",
    desc: "Default — fresh lime green + deep teal",
    preview: ["#b2ff70", "#1b2f31", "#d4ffaa"],
    values: { ...THEME_DEFAULTS },
  },
  {
    name: "Midnight Coral",
    desc: "Dark navy + coral red",
    preview: ["#ff6b6b", "#1c1c2e", "#38bdf8"],
    values: {
      theme_primary: "#ff6b6b",
      theme_primary_dark: "#0f172a",
      theme_primary_light: "#38bdf8",
      theme_primary_muted: "#d1fae5",
      theme_secondary: "#1c1c2e",
      theme_secondary_dark: "#0f0f1a",
      theme_secondary_mid: "#2d2d44",
      theme_secondary_light: "#3d3d5c",
      theme_accent: "#f59e0b",
      theme_accent_light: "#fcd34d",
      theme_surface: "#ffffff",
      theme_surface_2: "#f8fafc",
      theme_surface_3: "#f1f5f9",
      theme_border: "#e2e8f0",
      theme_text: "#0f172a",
      theme_text_secondary: "#475569",
      theme_text_muted: "#94a3b8",
      theme_radius: "0.625rem",
      theme_radius_lg: "1rem",
      theme_radius_xl: "1.5rem",
    },
  },
  {
    name: "Forest Green",
    desc: "Fresh green + deep charcoal",
    preview: ["#10b981", "#0f172a", "#34d399"],
    values: {
      ...THEME_DEFAULTS,
      theme_primary: "#10b981",
      theme_primary_dark: "#047857",
      theme_primary_light: "#34d399",
      theme_primary_muted: "#d1fae5",
      theme_accent: "#f59e0b",
    },
  },
  {
    name: "Royal Blue",
    desc: "Professional blue + white",
    preview: ["#3b82f6", "#1e3a5f", "#60a5fa"],
    values: {
      ...THEME_DEFAULTS,
      theme_primary: "#3b82f6",
      theme_primary_dark: "#1d4ed8",
      theme_primary_light: "#60a5fa",
      theme_primary_muted: "#dbeafe",
      theme_secondary: "#1e3a5f",
      theme_secondary_dark: "#0f2040",
      theme_secondary_mid: "#2d4f7c",
      theme_secondary_light: "#3d6099",
      theme_accent: "#f59e0b",
    },
  },
  {
    name: "Purple Luxury",
    desc: "Deep purple + gold accent",
    preview: ["#8b5cf6", "#1a0a2e", "#fbbf24"],
    values: {
      ...THEME_DEFAULTS,
      theme_primary: "#8b5cf6",
      theme_primary_dark: "#6d28d9",
      theme_primary_light: "#a78bfa",
      theme_primary_muted: "#ede9fe",
      theme_secondary: "#1a0a2e",
      theme_secondary_dark: "#0f0620",
      theme_secondary_mid: "#2e1a4a",
      theme_secondary_light: "#4a2d72",
      theme_accent: "#fbbf24",
      theme_accent_light: "#fde68a",
    },
  },
  {
    name: "Warm Amber",
    desc: "Golden amber + dark brown",
    preview: ["#f59e0b", "#1c1008", "#fcd34d"],
    values: {
      ...THEME_DEFAULTS,
      theme_primary: "#f59e0b",
      theme_primary_dark: "#b45309",
      theme_primary_light: "#fcd34d",
      theme_primary_muted: "#fef3c7",
      theme_secondary: "#1c1008",
      theme_secondary_dark: "#0f0a04",
      theme_secondary_mid: "#2d1f10",
      theme_secondary_light: "#3d2f1c",
      theme_accent: "#10b981",
      theme_accent_light: "#34d399",
    },
  },
  {
    name: "Clean White",
    desc: "Minimal white + slate",
    preview: ["#0f172a", "#f8fafc", "#3b82f6"],
    values: {
      ...THEME_DEFAULTS,
      theme_primary: "#0f172a",
      theme_primary_dark: "#020617",
      theme_primary_light: "#334155",
      theme_primary_muted: "#f1f5f9",
      theme_secondary: "#f8fafc",
      theme_secondary_dark: "#f1f5f9",
      theme_secondary_mid: "#e2e8f0",
      theme_secondary_light: "#cbd5e1",
      theme_accent: "#3b82f6",
      theme_accent_light: "#60a5fa",
      theme_text: "#0f172a",
      theme_text_secondary: "#334155",
    },
  },
];

// ── Logo upload ───────────────────────────────────────────────────
function LogoUpload({ value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const ref = useRef(null);

  const upload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await mediaApi.upload(file, "logos");

      // mediaApi.upload returns the raw JSON — check both shapes
      const filePath = res?.data?.file_path || res?.file_path;

      if (filePath) {
        const url = filePath.startsWith("http")
          ? filePath
          : `${API_URL}/uploads/${filePath.replace(/^uploads\//, "")}`;
        onChange(url);
        toast.success("Logo uploaded");
      } else {
        toast.error("Upload failed — no path returned");
      }
    } catch (err) {
      toast.error(err?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <label style={S.label}>Site Logo</label>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1.25rem",
          flexWrap: "wrap",
        }}
      >
        {/* Preview box — dark background so logo looks as it will in the navbar */}
        <div
          style={{
            width: "200px",
            height: "72px",
            borderRadius: "var(--radius, 0.75rem)",
            border: "1px solid var(--color-border, #E2E8F0)",
            background: "var(--color-secondary, #0F172A)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            flexShrink: 0,
            position: "relative",
          }}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt="Site logo"
              style={{
                maxWidth: "180px",
                maxHeight: "56px",
                objectFit: "contain",
              }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : (
            <div style={{ textAlign: "center" }}>
              <ImageIcon
                size={20}
                style={{
                  color: "rgba(255,255,255,0.2)",
                  display: "block",
                  margin: "0 auto 0.25rem",
                }}
              />
              <span
                style={{
                  color: "rgba(255,255,255,0.25)",
                  fontSize: "0.7rem",
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                }}
              >
                No logo
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <button
            type="button"
            onClick={() => ref.current?.click()}
            disabled={uploading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              borderRadius: "var(--radius, 0.625rem)",
              border: "1px solid var(--color-border, #E2E8F0)",
              background: "var(--color-surface, white)",
              color: "var(--color-text-secondary, #475569)",
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontWeight: 600,
              fontSize: "0.8125rem",
              cursor: uploading ? "wait" : "pointer",
              transition: "all 150ms",
            }}
            onMouseEnter={(e) => {
              if (!uploading) {
                e.currentTarget.style.borderColor =
                  "var(--color-primary, #FF6B6B)";
                e.currentTarget.style.color = "var(--color-primary, #FF6B6B)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor =
                "var(--color-border, #E2E8F0)";
              e.currentTarget.style.color = "#475569";
            }}
          >
            {uploading ? (
              <>
                <Loader2
                  size={13}
                  style={{ animation: "spin 0.8s linear infinite" }}
                />{" "}
                Uploading…
              </>
            ) : (
              <>
                <Upload size={13} /> {value ? "Change Logo" : "Upload Logo"}
              </>
            )}
          </button>

          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1rem",
                borderRadius: "var(--radius, 0.625rem)",
                border: "1px solid #FCA5A5",
                background: "#FEF2F2",
                color: "#EF4444",
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 600,
                fontSize: "0.8125rem",
                cursor: "pointer",
              }}
            >
              <X size={13} /> Remove Logo
            </button>
          )}

          <input
            ref={ref}
            type="file"
            accept=".svg,.png,.jpg,.jpeg,.webp,image/svg+xml,image/png,image/jpeg,image/webp"
            style={{ display: "none" }}
            onChange={(e) => {
              upload(e.target.files[0]);
              e.target.value = "";
            }}
          />
        </div>

        {/* Tip */}
        <div style={{ flex: 1, minWidth: "160px" }}>
          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--color-text-muted, #94A3B8)",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Displayed in the navbar on a dark background.
            <br />
            SVG, PNG, JPG, or WebP accepted. SVG or PNG with transparent background recommended.
            <br />
            Max 5MB.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Agent avatar upload ───────────────────────────────────────────
function AvatarUpload({ value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const ref = useRef(null);

  const upload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await mediaApi.upload(file, "general");
      const filePath = res?.data?.file_path || res?.file_path;
      if (filePath) {
        const url = filePath.startsWith("http")
          ? filePath
          : `${API_URL}/uploads/${filePath.replace(/^uploads\//, "")}`;
        onChange(url);
        toast.success("Avatar uploaded");
      } else {
        toast.error("Upload failed — no path returned");
      }
    } catch (err) {
      toast.error(err?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <label style={S.label}>Agent Avatar / Photo</label>
      <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
        {/* Circle preview */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            border: "2px solid var(--color-border, #E2E8F0)",
            overflow: "hidden",
            flexShrink: 0,
            background: "linear-gradient(135deg,#b2ff70,#5ecb40)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt="Agent avatar"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => { e.target.style.display = "none"; }}
            />
          ) : (
            <span style={{ color: "#1b2f31", fontWeight: 800, fontSize: "1.75rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>R</span>
          )}
        </div>
        {/* Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <button
            type="button"
            onClick={() => ref.current?.click()}
            disabled={uploading}
            style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              padding: "0.5rem 1rem",
              borderRadius: "var(--radius, 0.625rem)",
              border: "1px solid var(--color-border, #E2E8F0)",
              background: "var(--color-surface, white)",
              color: "var(--color-text-secondary, #475569)",
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontWeight: 600, fontSize: "0.8125rem",
              cursor: uploading ? "wait" : "pointer",
            }}
          >
            {uploading ? <><Loader2 size={13} style={{ animation: "spin 0.8s linear infinite" }} /> Uploading…</> : <><Upload size={13} /> {value ? "Change Photo" : "Upload Photo"}</>}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              style={{
                display: "flex", alignItems: "center", gap: "0.5rem",
                padding: "0.5rem 1rem",
                borderRadius: "var(--radius, 0.625rem)",
                border: "1px solid #FCA5A5", background: "#FEF2F2", color: "#EF4444",
                fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 600, fontSize: "0.8125rem", cursor: "pointer",
              }}
            >
              <X size={13} /> Remove
            </button>
          )}
          <input ref={ref} type="file" accept="image/png,image/jpeg,image/webp" style={{ display: "none" }} onChange={(e) => { upload(e.target.files[0]); e.target.value = ""; }} />
        </div>
        <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted, #94A3B8)", lineHeight: 1.6, margin: 0 }}>
          Square photo recommended (1:1 ratio).<br />JPG, PNG, or WebP. Max 5 MB.
        </p>
      </div>
    </div>
  );
}

// ── Collapsible accordion ─────────────────────────────────────────

// ── Favicon upload ───────────────────────────────────
function FaviconUpload({ value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const ref = useRef(null);

  const upload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await mediaApi.upload(file, "logos");

      // mediaApi.upload returns the raw JSON — check both shapes
      const filePath = res?.data?.file_path || res?.file_path;

      if (filePath) {
        const url = filePath.startsWith("http")
          ? filePath
          : `${API_URL}/uploads/${filePath.replace(/^uploads\//, "")}`;
        onChange(url);
        toast.success("Logo uploaded");
      } else {
        toast.error("Upload failed — no path returned");
      }
    } catch (err) {
      toast.error(err?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <label style={S.label}>Favicon</label>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1.25rem",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "var(--radius, 0.75rem)",
            border: "1px solid var(--color-border, #E2E8F0)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            flexShrink: 0,
            backgroundImage:
              "linear-gradient(45deg,#F1F5F9 25%,transparent 25%)," +
              "linear-gradient(-45deg,#F1F5F9 25%,transparent 25%)," +
              "linear-gradient(45deg,transparent 75%,#F1F5F9 75%)," +
              "linear-gradient(-45deg,transparent 75%,#F1F5F9 75%)",
            backgroundSize: "16px 16px",
            backgroundPosition: "0 0,0 8px,8px -8px,-8px 0",
          }}
        >
          {value ? (
            <img
              src={value}
              alt="Favicon"
              style={{ width: "48px", height: "48px", objectFit: "contain" }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : (
            <ImageIcon size={20} style={{ color: "#CBD5E1" }} />
          )}
        </div>

        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <button
            type="button"
            onClick={() => ref.current?.click()}
            disabled={uploading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              borderRadius: "var(--radius, 0.625rem)",
              border: "1px solid var(--color-border, #E2E8F0)",
              background: "var(--color-surface, white)",
              color: "var(--color-text-secondary, #475569)",
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontWeight: 600,
              fontSize: "0.8125rem",
              cursor: uploading ? "wait" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (!uploading) {
                e.currentTarget.style.borderColor =
                  "var(--color-primary, #FF6B6B)";
                e.currentTarget.style.color = "var(--color-primary, #FF6B6B)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor =
                "var(--color-border, #E2E8F0)";
              e.currentTarget.style.color = "#475569";
            }}
          >
            {uploading ? (
              <>
                <Loader2
                  size={13}
                  style={{ animation: "spin 0.8s linear infinite" }}
                />{" "}
                Uploading\u2026
              </>
            ) : (
              <>
                <Upload size={13} />{" "}
                {value ? "Change Favicon" : "Upload Favicon"}
              </>
            )}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1rem",
                borderRadius: "var(--radius, 0.625rem)",
                border: "1px solid #FCA5A5",
                background: "#FEF2F2",
                color: "#EF4444",
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 600,
                fontSize: "0.8125rem",
                cursor: "pointer",
              }}
            >
              <X size={13} /> Remove
            </button>
          )}
          <input
            ref={ref}
            type="file"
            accept="image/png,image/x-icon,image/svg+xml,image/webp"
            style={{ display: "none" }}
            onChange={(e) => {
              upload(e.target.files[0]);
              e.target.value = "";
            }}
          />
        </div>

        <p
          style={{
            fontSize: "0.75rem",
            color: "var(--color-text-muted, #94A3B8)",
            lineHeight: 1.6,
            flex: 1,
            minWidth: "160px",
          }}
        >
          Shown in browser tabs and bookmarks.
          <br />
          PNG (32�332 or 64�364), ICO, or SVG. Max 5MB.
        </p>
      </div>
    </div>
  );
}

// ── Nav Links editor ────────────────────────────────
const DEFAULT_NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Lands", href: "/lands" },
  { label: "Houses", href: "/houses" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

function NavLinksEditor({ value, onChange }) {
  const [links, setLinks] = useState(() => {
    try {
      return JSON.parse(value) || DEFAULT_NAV_LINKS;
    } catch {
      return DEFAULT_NAV_LINKS;
    }
  });

  useEffect(() => {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed) && parsed.length > 0) setLinks(parsed);
    } catch {
      /* keep current */
    }
  }, [value]);

  const push = (updated) => {
    setLinks(updated);
    onChange(JSON.stringify(updated));
  };
  const add = () => push([...links, { label: "", href: "" }]);
  const remove = (i) => push(links.filter((_, idx) => idx !== i));
  const update = (i, field, val) =>
    push(links.map((l, idx) => (idx === i ? { ...l, [field]: val } : l)));
  const move = (i, dir) => {
    const copy = [...links];
    const target = i + dir;
    if (target < 0 || target >= copy.length) return;
    [copy[i], copy[target]] = [copy[target], copy[i]];
    push(copy);
  };

  return (
    <div style={{ marginBottom: "1rem" }}>
      <label style={S.label}>Navigation Links</label>
      <p
        style={{
          fontSize: "0.75rem",
          color: "var(--color-text-muted, #94A3B8)",
          marginBottom: "0.875rem",
        }}
      >
        Controls links in the public navbar. Use relative paths (/lands) or full
        URLs.
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          marginBottom: "0.75rem",
        }}
      >
        {links.map((link, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr 1fr auto auto auto",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.625rem 0.75rem",
              borderRadius: "var(--radius, 0.625rem)",
              border: "1px solid var(--color-border, #E2E8F0)",
              background: "#FAFAFA",
            }}
          >
            <GripVertical size={14} style={{ color: "#CBD5E1" }} />
            <input
              style={{
                ...S.input,
                fontSize: "0.8125rem",
                padding: "0.4rem 0.625rem",
              }}
              placeholder="Label e.g. Lands"
              value={link.label}
              onChange={(e) => update(i, "label", e.target.value)}
              onFocus={focus}
              onBlur={blur}
            />
            <div style={{ position: "relative" }}>
              <LinkIcon
                size={12}
                style={{
                  position: "absolute",
                  left: "0.5rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--color-text-muted, #94A3B8)",
                }}
              />
              <input
                style={{
                  ...S.input,
                  fontSize: "0.8125rem",
                  padding: "0.4rem 0.625rem 0.4rem 1.75rem",
                }}
                placeholder="/path or https://..."
                value={link.href}
                onChange={(e) => update(i, "href", e.target.value)}
                onFocus={focus}
                onBlur={blur}
              />
            </div>
            <button
              onClick={() => move(i, -1)}
              disabled={i === 0}
              style={{
                background: "none",
                border: "none",
                cursor: i === 0 ? "default" : "pointer",
                color: i === 0 ? "#E2E8F0" : "#94A3B8",
                padding: "0.25rem",
                display: "flex",
                borderRadius: "0.375rem",
              }}
              title="Move up"
            >
              <ChevronUp size={15} />
            </button>
            <button
              onClick={() => move(i, 1)}
              disabled={i === links.length - 1}
              style={{
                background: "none",
                border: "none",
                cursor: i === links.length - 1 ? "default" : "pointer",
                color: i === links.length - 1 ? "#E2E8F0" : "#94A3B8",
                padding: "0.25rem",
                display: "flex",
                borderRadius: "0.375rem",
              }}
              title="Move down"
            >
              <ChevronDown size={15} />
            </button>
            <button
              onClick={() => remove(i)}
              style={{
                background: "#FEE2E2",
                border: "none",
                borderRadius: "0.5rem",
                padding: "0.3rem",
                cursor: "pointer",
                color: "#EF4444",
                display: "flex",
              }}
              title="Remove"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={add}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          padding: "0.5rem 1rem",
          borderRadius: "var(--radius, 0.625rem)",
          border: "1px dashed #CBD5E1",
          background: "var(--color-surface, white)",
          color: "var(--color-text-secondary, #64748B)",
          fontFamily: "Plus Jakarta Sans, sans-serif",
          fontWeight: 600,
          fontSize: "0.8125rem",
          cursor: "pointer",
          width: "100%",
          justifyContent: "center",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--color-primary, #FF6B6B)";
          e.currentTarget.style.color = "var(--color-primary, #FF6B6B)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#CBD5E1";
          e.currentTarget.style.color = "#64748B";
        }}
      >
        <Plus size={14} /> Add Link
      </button>
    </div>
  );
}

function Accordion({
  icon: Icon,
  title,
  color = "#FF6B6B",
  children,
  defaultOpen = false,
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={S.card}>
      <button
        onClick={() => setOpen((p) => !p)}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 0,
          marginBottom: open ? "1.25rem" : 0,
        }}
      >
        <span style={{ ...S.sectionTitle, margin: 0 }}>
          <span
            style={{
              width: "2rem",
              height: "2rem",
              borderRadius: "0.5rem",
              background: `${color}15`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon size={15} style={{ color }} />
          </span>
          {title}
        </span>
        {open ? (
          <ChevronUp
            size={16}
            style={{ color: "var(--color-text-muted, #94A3B8)" }}
          />
        ) : (
          <ChevronDown
            size={16}
            style={{ color: "var(--color-text-muted, #94A3B8)" }}
          />
        )}
      </button>
      {open && children}
    </div>
  );
}

// ── Text field ────────────────────────────────────────────────────
function Field({
  label,
  value,
  onChange,
  placeholder,
  hint,
  textarea,
  rows = 3,
  type = "text",
}) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label style={S.label}>{label}</label>
      {textarea ? (
        <textarea
          value={value || ""}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          style={{ ...S.input, resize: "vertical" }}
          onFocus={focus}
          onBlur={blur}
        />
      ) : (
        <input
          type={type}
          value={value || ""}
          onChange={onChange}
          placeholder={placeholder}
          style={S.input}
          onFocus={focus}
          onBlur={blur}
        />
      )}
      {hint && (
        <p
          style={{
            fontSize: "0.7rem",
            color: "var(--color-text-muted, #94A3B8)",
            marginTop: "0.25rem",
          }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

// ── Color picker field ────────────────────────────────────────────
function ColorField({ label, themeKey, value, onChange, hint }) {
  const isRadius = themeKey.includes("radius");
  return (
    <div style={{ marginBottom: "0.875rem" }}>
      <label style={S.label}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
        {!isRadius && (
          <>
            <input
              type="color"
              value={value || "#000000"}
              onChange={(e) => onChange(e.target.value)}
              style={{
                width: "2.5rem",
                height: "2.5rem",
                padding: "0.125rem",
                border: "1px solid var(--color-border, #E2E8F0)",
                borderRadius: "0.5rem",
                cursor: "pointer",
                background: "var(--color-surface, white)",
              }}
            />
            <input
              type="text"
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="#000000"
              style={{
                ...S.input,
                flex: 1,
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "0.8125rem",
              }}
              onFocus={focus}
              onBlur={blur}
            />
          </>
        )}
        {isRadius && (
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="0.625rem"
            style={{
              ...S.input,
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "0.8125rem",
            }}
            onFocus={focus}
            onBlur={blur}
          />
        )}
      </div>
      {hint && (
        <p
          style={{
            fontSize: "0.7rem",
            color: "var(--color-text-muted, #94A3B8)",
            marginTop: "0.25rem",
          }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

// ── Live theme preview ────────────────────────────────────────────
function ThemePreview({ theme, logoUrl, siteName }) {
  const primary = theme.theme_primary || "#ff6b6b";
  const secondary = theme.theme_secondary || "#1c1c2e";
  const accent = theme.theme_accent || "#f59e0b";
  const surface = theme.theme_surface || "#ffffff";
  const text = theme.theme_text || "#0f172a";
  const border = theme.theme_border || "#e2e8f0";
  const radius = theme.theme_radius || "0.625rem";
  const radiusLg = theme.theme_radius_lg || "1rem";

  return (
    <div
      style={{
        border: "1px solid var(--color-border, #E2E8F0)",
        borderRadius: "0.875rem",
        overflow: "hidden",
        marginBottom: "1.5rem",
      }}
    >
      {/* Label */}
      <div
        style={{
          padding: "0.625rem 1rem",
          background: "var(--color-surface-2, #F8FAFC)",
          borderBottom: "1px solid #E2E8F0",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <Eye size={13} style={{ color: "var(--color-text-muted, #94A3B8)" }} />
        <span
          style={{
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "var(--color-text-secondary, #64748B)",
            fontFamily: "Plus Jakarta Sans, sans-serif",
          }}
        >
          Live Preview
        </span>
      </div>

      {/* Mock navbar */}
      <div
        style={{
          background: secondary,
          padding: "0.75rem 1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo or site name */}
        <div>
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt="logo"
              style={{ height: "28px", width: "auto", objectFit: "contain" }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : (
            <span
              style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 800,
                color: "white",
                fontSize: "0.9375rem",
              }}
            >
              {siteName || "NaijaRealty"}
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          {["Home", "Lands", "Houses"].map((l) => (
            <span
              key={l}
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: "0.75rem",
                fontFamily: "Plus Jakarta Sans, sans-serif",
              }}
            >
              {l}
            </span>
          ))}
          <span
            style={{
              background: primary,
              color: "white",
              padding: "0.25rem 0.75rem",
              borderRadius: radius,
              fontSize: "0.75rem",
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontWeight: 600,
            }}
          >
            Enquire
          </span>
        </div>
      </div>

      {/* Mock hero */}
      <div
        style={{
          background: secondary,
          padding: "1.5rem 1.25rem",
          borderBottom: `1px solid ${border}`,
        }}
      >
        <div
          style={{
            display: "inline-block",
            background: `${primary}20`,
            color: primary,
            padding: "0.2rem 0.75rem",
            borderRadius: "9999px",
            fontSize: "0.7rem",
            fontWeight: 700,
            fontFamily: "Plus Jakarta Sans, sans-serif",
            marginBottom: "0.75rem",
          }}
        >
          Premium Properties
        </div>
        <div
          style={{
            fontFamily: "Plus Jakarta Sans, sans-serif",
            fontWeight: 800,
            fontSize: "1.25rem",
            color: "white",
            marginBottom: "0.5rem",
          }}
        >
          Find Your Perfect Property
        </div>
        <div
          style={{
            fontSize: "0.8rem",
            color: "rgba(255,255,255,0.6)",
            marginBottom: "1rem",
          }}
        >
          Verified listings across Nigeria
        </div>
        <div style={{ display: "flex", gap: "0.875rem" }}>
          {[
            ["500+", "Listings"],
            ["2k+", "Clients"],
            ["15+", "States"],
          ].map(([val, lbl]) => (
            <span
              key={lbl}
              style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 800,
                fontSize: "1.1rem",
                color: primary,
              }}
            >
              {val}
              <span
                style={{
                  fontSize: "0.7rem",
                  color: "rgba(255,255,255,0.5)",
                  display: "block",
                  fontWeight: 400,
                }}
              >
                {lbl}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Mock cards */}
      <div
        style={{
          background: surface,
          padding: "1.25rem",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "0.75rem",
        }}
      >
        {["Lekki Plot", "Abuja Land", "PH Estate"].map((name, i) => (
          <div
            key={name}
            style={{
              border: `1px solid ${border}`,
              borderRadius: radiusLg,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "60px",
                background: `linear-gradient(135deg, ${secondary}, ${theme.theme_secondary_mid || "#2d2d44"})`,
              }}
            />
            <div style={{ padding: "0.625rem" }}>
              <div
                style={{
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  color: text,
                  marginBottom: "0.2rem",
                }}
              >
                {name}
              </div>
              <div
                style={{
                  color: primary,
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                }}
              >
                ₦{(i + 1) * 15}M
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "0.375rem",
                  marginTop: "0.5rem",
                }}
              >
                <span
                  style={{
                    background: `${primary}15`,
                    color: primary,
                    fontSize: "0.6rem",
                    fontWeight: 700,
                    padding: "0.15rem 0.4rem",
                    borderRadius: radius,
                  }}
                >
                  Available
                </span>
                <span
                  style={{
                    background: `${accent}15`,
                    color: accent,
                    fontSize: "0.6rem",
                    fontWeight: 700,
                    padding: "0.15rem 0.4rem",
                    borderRadius: radius,
                  }}
                >
                  C of O
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────
export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({});
  const [theme, setTheme] = useState({ ...THEME_DEFAULTS });
  const [loading, setLoading] = useState(true);
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [savingTheme, setSavingTheme] = useState(false);
  const [savingWhatsapp, setSavingWhatsapp] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await settingsApi.getAdmin();
      const s = res?.data?.settings || {};
      setSettings(s);
      const t = { ...THEME_DEFAULTS };
      for (const k of Object.keys(THEME_DEFAULTS)) {
        if (s[k]) t[k] = s[k];
      }
      setTheme(t);
    } catch (err) {
      toast.error(err.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setS = (k) => (e) =>
    setSettings((p) => ({ ...p, [k]: e.target.value }));
  const setT = (k) => (v) => setTheme((p) => ({ ...p, [k]: v }));

  // ── Save general settings ─────────────────────────────────────
  const saveGeneral = async () => {
    setSavingGeneral(true);
    try {
      await settingsApi.update({
        logo: settings.logo || "",
        site_name: settings.site_name || "",
        site_tagline: settings.site_tagline || "",
        phone: settings.phone || "",
        whatsapp: settings.whatsapp || "",
        email: settings.email || "",
        address: settings.address || "",
        hero_headline: settings.hero_headline || "",
        hero_subtext: settings.hero_subtext || "",
        facebook: settings.facebook || "",
        instagram: settings.instagram || "",
        twitter: settings.twitter || "",
        linkedin: settings.linkedin || "",
        youtube: settings.youtube || "",
        meta_title: settings.meta_title || "",
        meta_description: settings.meta_description || "",
        favicon: settings.favicon || "",
        nav_links: settings.nav_links || "",
      });
      toast.success("General settings saved");
    } catch (err) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSavingGeneral(false);
    }
  };

  // ── Save WhatsApp widget settings ─────────────────────────────
  const saveWhatsApp = async () => {
    setSavingWhatsapp(true);
    try {
      await settingsApi.update({
        wa_enabled: settings.wa_enabled ?? "true",
        wa_number: settings.wa_number || "",
        wa_name: settings.wa_name || "",
        wa_title: settings.wa_title || "",
        wa_avatar: settings.wa_avatar || "",
        wa_message: settings.wa_message || "",
        wa_prefill: settings.wa_prefill || "",
      });
      toast.success("WhatsApp widget settings saved");
    } catch (err) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSavingWhatsapp(false);
    }
  };

  // ── Apply theme vars directly to the document ─────────────────
  // Called both on save and on live preview so the admin area
  // reflects changes immediately without waiting for /api/theme.css
  const applyThemeVars = (t) => {
    const root = document.documentElement;
    const map = {
      theme_primary: "--color-primary",
      theme_primary_dark: "--color-primary-dark",
      theme_primary_light: "--color-primary-light",
      theme_primary_muted: "--color-primary-muted",
      theme_secondary: "--color-secondary",
      theme_secondary_dark: "--color-secondary-dark",
      theme_secondary_mid: "--color-secondary-mid",
      theme_secondary_light: "--color-secondary-light",
      theme_accent: "--color-accent",
      theme_accent_light: "--color-accent-light",
      theme_surface: "--color-surface",
      theme_surface_2: "--color-surface-2",
      theme_surface_3: "--color-surface-3",
      theme_border: "--color-border",
      theme_text: "--color-text",
      theme_text_secondary: "--color-text-secondary",
      theme_text_muted: "--color-text-muted",
      theme_radius: "--radius",
      theme_radius_lg: "--radius-lg",
      theme_radius_xl: "--radius-xl",
    };
    Object.entries(map).forEach(([key, cssVar]) => {
      if (t[key]) root.style.setProperty(cssVar, t[key]);
    });
  };

  // ── Save theme ────────────────────────────────────────────────
  const saveTheme = async () => {
    setSavingTheme(true);
    try {
      await settingsApi.update(theme);

      // 1. Apply immediately to document so admin area updates right now
      applyThemeVars(theme);

      // 2. Also bust the /api/theme.css cache so public pages
      //    pick up the new values on their next load
      const links = document.querySelectorAll('link[href*="theme.css"]');
      links.forEach((link) => {
        const base = link.href.split("?")[0];
        link.href = `${base}?t=${Date.now()}`;
      });

      toast.success("Theme saved and applied");
    } catch (err) {
      toast.error(err.message || "Failed to save theme");
    } finally {
      setSavingTheme(false);
    }
  };

  const applyPreset = (preset) => {
    setTheme({ ...preset.values });
    applyThemeVars(preset.values);
    toast.success(
      `Preset "${preset.name}" applied — save to make it permanent`,
    );
  };

  const resetTheme = () => {
    setTheme({ ...THEME_DEFAULTS });
    applyThemeVars(THEME_DEFAULTS);
    toast("Theme reset to defaults — save to apply");
  };

  if (loading) {
    return (
      <AdminShell>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "60vh",
            gap: "0.75rem",
            color: "var(--color-text-muted, #94A3B8)",
          }}
        >
          <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />{" "}
          Loading settings...
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div style={{ padding: "2rem", maxWidth: "860px" }}>
        {/* Page header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "2rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "0.25rem",
              }}
            >
              <Settings
                size={20}
                style={{ color: "var(--color-primary, #FF6B6B)" }}
              />
              <h1
                style={{
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 800,
                  fontSize: "1.5rem",
                  color: "var(--color-text, #0F172A)",
                  margin: 0,
                }}
              >
                Site Settings
              </h1>
            </div>
            <p
              style={{
                color: "var(--color-text-muted, #94A3B8)",
                fontSize: "0.875rem",
                margin: 0,
              }}
            >
              Manage your brand, contact info, and visual theme.
            </p>
          </div>
          <button
            onClick={load}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              borderRadius: "var(--radius, 0.625rem)",
              border: "1px solid var(--color-border, #E2E8F0)",
              background: "var(--color-surface, white)",
              color: "var(--color-text-secondary, #475569)",
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontWeight: 600,
              fontSize: "0.8125rem",
              cursor: "pointer",
            }}
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {/* ── General & Brand ── */}
        <Accordion
          icon={Globe}
          title="General & Brand"
          color="#FF6B6B"
          defaultOpen
        >
          {/* ── Logo upload — first field ── */}
          <LogoUpload
            value={settings.logo || ""}
            onChange={(url) => setSettings((p) => ({ ...p, logo: url }))}
          />

          <FaviconUpload
            value={settings.favicon || ""}
            onChange={(url) => setSettings((p) => ({ ...p, favicon: url }))}
          />

          <div style={S.grid2}>
            <Field
              label="Site Name"
              value={settings.site_name}
              onChange={setS("site_name")}
              placeholder="e.g. NaijaRealty"
            />
            <Field
              label="Tagline"
              value={settings.site_tagline}
              onChange={setS("site_tagline")}
              placeholder="e.g. Premium Properties Across Nigeria"
            />
          </div>
          <Field
            label="Hero Headline"
            value={settings.hero_headline}
            onChange={setS("hero_headline")}
            placeholder="e.g. Your Trusted Gateway for Land & Homes"
          />
          <Field
            label="Hero Subtext"
            value={settings.hero_subtext}
            onChange={setS("hero_subtext")}
            placeholder="Short description under the headline"
            textarea
            rows={2}
          />
          <div style={S.grid2}>
            <Field
              label="Meta Title"
              value={settings.meta_title}
              onChange={setS("meta_title")}
              placeholder="SEO page title"
            />
            <Field
              label="Meta Description"
              value={settings.meta_description}
              onChange={setS("meta_description")}
              placeholder="SEO description"
            />
          </div>

          {/* Nav Links */}
          <NavLinksEditor
            value={settings.nav_links || ""}
            onChange={(v) => setSettings((p) => ({ ...p, nav_links: v }))}
          />

          {/* Contact */}
          <div
            style={{
              borderTop: "1px solid #F1F5F9",
              paddingTop: "1.25rem",
              marginTop: "0.25rem",
            }}
          >
            <p
              style={{
                ...S.sectionTitle,
                fontSize: "0.875rem",
                marginBottom: "1rem",
                color: "var(--color-text-secondary, #64748B)",
              }}
            >
              <Phone size={14} /> Contact Details
            </p>
            <div style={S.grid2}>
              <Field
                label="Phone Number"
                value={settings.phone}
                onChange={setS("phone")}
                placeholder="+234 800 000 0000"
              />
              <Field
                label="WhatsApp Number"
                value={settings.whatsapp}
                onChange={setS("whatsapp")}
                placeholder="+234 800 000 0000"
                hint="Used for WhatsApp CTA buttons"
              />
            </div>
            <div style={S.grid2}>
              <Field
                label="Email Address"
                value={settings.email}
                onChange={setS("email")}
                placeholder="hello@yourdomain.com"
                type="email"
              />
              <Field
                label="Office Address"
                value={settings.address}
                onChange={setS("address")}
                placeholder="Lagos, Nigeria"
              />
            </div>
          </div>

          {/* Social */}
          <div
            style={{
              borderTop: "1px solid #F1F5F9",
              paddingTop: "1.25rem",
              marginTop: "0.25rem",
            }}
          >
            <p
              style={{
                ...S.sectionTitle,
                fontSize: "0.875rem",
                marginBottom: "1rem",
                color: "var(--color-text-secondary, #64748B)",
              }}
            >
              <Globe size={14} /> Social Media
            </p>
            <div style={S.grid2}>
              <Field
                label="Facebook URL"
                value={settings.facebook}
                onChange={setS("facebook")}
                placeholder="https://facebook.com/yourpage"
              />
              <Field
                label="Instagram URL"
                value={settings.instagram}
                onChange={setS("instagram")}
                placeholder="https://instagram.com/yourhandle"
              />
              <Field
                label="Twitter / X"
                value={settings.twitter}
                onChange={setS("twitter")}
                placeholder="https://twitter.com/yourhandle"
              />
              <Field
                label="LinkedIn URL"
                value={settings.linkedin}
                onChange={setS("linkedin")}
                placeholder="https://linkedin.com/company/..."
              />
              <Field
                label="YouTube URL"
                value={settings.youtube}
                onChange={setS("youtube")}
                placeholder="https://youtube.com/@yourchannel"
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              paddingTop: "0.5rem",
            }}
          >
            <button
              onClick={saveGeneral}
              disabled={savingGeneral}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.625rem 1.5rem",
                borderRadius: "var(--radius, 0.75rem)",
                border: "none",
                background: "var(--color-primary, #b2ff70)",
                color: "var(--color-secondary, #1b2f31)",
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 700,
                fontSize: "0.875rem",
                cursor: savingGeneral ? "not-allowed" : "pointer",
                opacity: savingGeneral ? 0.7 : 1,
              }}
            >
              {savingGeneral ? (
                <>
                  <Loader2
                    size={14}
                    style={{ animation: "spin 0.8s linear infinite" }}
                  />{" "}
                  Saving...
                </>
              ) : (
                <>
                  <Save size={14} /> Save General Settings
                </>
              )}
            </button>
          </div>
        </Accordion>

        {/* ── Theme & Colors ── */}
        <Accordion icon={Palette} title="Theme & Colors" color="#A78BFA">
          <p
            style={{
              fontSize: "0.8125rem",
              color: "var(--color-text-secondary, #64748B)",
              marginBottom: "1.5rem",
              lineHeight: 1.6,
            }}
          >
            Customize your brand colors. Changes go live immediately after
            saving — no rebuild required.
          </p>

          {/* Presets */}
          <div style={{ marginBottom: "1.75rem" }}>
            <p style={{ ...S.label, marginBottom: "0.75rem" }}>Quick Presets</p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "0.625rem",
              }}
            >
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.75rem 1rem",
                    borderRadius: "var(--radius, 0.75rem)",
                    border: "1px solid var(--color-border, #E2E8F0)",
                    background: "var(--color-surface, white)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 150ms",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#A78BFA";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 3px rgba(167,139,250,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor =
                      "var(--color-border, #E2E8F0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{ display: "flex", gap: "3px", flexShrink: 0 }}>
                    {preset.preview.map((c, i) => (
                      <div
                        key={i}
                        style={{
                          width: "14px",
                          height: "32px",
                          borderRadius: "4px",
                          background: c,
                        }}
                      />
                    ))}
                  </div>
                  <div>
                    <p
                      style={{
                        fontFamily: "Plus Jakarta Sans, sans-serif",
                        fontWeight: 700,
                        fontSize: "0.8125rem",
                        color: "var(--color-text, #0F172A)",
                        margin: 0,
                      }}
                    >
                      {preset.name}
                    </p>
                    <p
                      style={{
                        fontSize: "0.7rem",
                        color: "var(--color-text-muted, #94A3B8)",
                        margin: 0,
                      }}
                    >
                      {preset.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Live preview — passes logo and site name so it shows them too */}
          <ThemePreview
            theme={theme}
            logoUrl={settings.logo || ""}
            siteName={settings.site_name || ""}
          />

          {/* Color pickers */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1.5rem",
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  color: "var(--color-text, #0F172A)",
                  marginBottom: "1rem",
                  paddingBottom: "0.5rem",
                  borderBottom: "1px solid #F1F5F9",
                }}
              >
                Primary Brand Color
              </p>
              <ColorField
                label="Primary"
                themeKey="theme_primary"
                value={theme.theme_primary}
                onChange={setT("theme_primary")}
                hint="Main accent — buttons, badges, highlights"
              />
              <ColorField
                label="Primary Dark"
                themeKey="theme_primary_dark"
                value={theme.theme_primary_dark}
                onChange={setT("theme_primary_dark")}
                hint="Hover state of primary"
              />
              <ColorField
                label="Primary Light"
                themeKey="theme_primary_light"
                value={theme.theme_primary_light}
                onChange={setT("theme_primary_light")}
                hint="Info tags, secondary accents"
              />
              <ColorField
                label="Primary Muted"
                themeKey="theme_primary_muted"
                value={theme.theme_primary_muted}
                onChange={setT("theme_primary_muted")}
                hint="Soft background tint of primary"
              />
            </div>

            <div>
              <p
                style={{
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  color: "var(--color-text, #0F172A)",
                  marginBottom: "1rem",
                  paddingBottom: "0.5rem",
                  borderBottom: "1px solid #F1F5F9",
                }}
              >
                Secondary (Dark UI)
              </p>
              <ColorField
                label="Secondary"
                themeKey="theme_secondary"
                value={theme.theme_secondary}
                onChange={setT("theme_secondary")}
                hint="Navbar, hero, admin sidebar background"
              />
              <ColorField
                label="Secondary Dark"
                themeKey="theme_secondary_dark"
                value={theme.theme_secondary_dark}
                onChange={setT("theme_secondary_dark")}
                hint="Deeper sections within the dark UI"
              />
              <ColorField
                label="Secondary Mid"
                themeKey="theme_secondary_mid"
                value={theme.theme_secondary_mid}
                onChange={setT("theme_secondary_mid")}
                hint="Mid-tone within dark panels"
              />
              <ColorField
                label="Secondary Light"
                themeKey="theme_secondary_light"
                value={theme.theme_secondary_light}
                onChange={setT("theme_secondary_light")}
                hint="Borders and dividers in dark panels"
              />
            </div>

            <div>
              <p
                style={{
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  color: "var(--color-text, #0F172A)",
                  marginBottom: "1rem",
                  paddingBottom: "0.5rem",
                  borderBottom: "1px solid #F1F5F9",
                }}
              >
                Accent Color
              </p>
              <ColorField
                label="Accent"
                themeKey="theme_accent"
                value={theme.theme_accent}
                onChange={setT("theme_accent")}
                hint="Star ratings, gold highlights"
              />
              <ColorField
                label="Accent Light"
                themeKey="theme_accent_light"
                value={theme.theme_accent_light}
                onChange={setT("theme_accent_light")}
                hint="Lighter accent backgrounds"
              />
            </div>

            <div>
              <p
                style={{
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  color: "var(--color-text, #0F172A)",
                  marginBottom: "1rem",
                  paddingBottom: "0.5rem",
                  borderBottom: "1px solid #F1F5F9",
                }}
              >
                Surfaces & Text
              </p>
              <ColorField
                label="Surface"
                themeKey="theme_surface"
                value={theme.theme_surface}
                onChange={setT("theme_surface")}
                hint="Main white/page background"
              />
              <ColorField
                label="Surface 2"
                themeKey="theme_surface_2"
                value={theme.theme_surface_2}
                onChange={setT("theme_surface_2")}
                hint="Secondary page sections"
              />
              <ColorField
                label="Border"
                themeKey="theme_border"
                value={theme.theme_border}
                onChange={setT("theme_border")}
                hint="Card and input borders"
              />
              <ColorField
                label="Text"
                themeKey="theme_text"
                value={theme.theme_text}
                onChange={setT("theme_text")}
                hint="Primary body text"
              />
              <ColorField
                label="Text Secondary"
                themeKey="theme_text_secondary"
                value={theme.theme_text_secondary}
                onChange={setT("theme_text_secondary")}
                hint="Paragraph and label text"
              />
              <ColorField
                label="Text Muted"
                themeKey="theme_text_muted"
                value={theme.theme_text_muted}
                onChange={setT("theme_text_muted")}
                hint="Placeholder and meta text"
              />
            </div>
          </div>

          {/* Border radius */}
          <div
            style={{
              marginTop: "1.5rem",
              paddingTop: "1.5rem",
              borderTop: "1px solid #F1F5F9",
            }}
          >
            <p
              style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 700,
                fontSize: "0.875rem",
                color: "var(--color-text, #0F172A)",
                marginBottom: "1rem",
              }}
            >
              Border Radius
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "1rem",
              }}
            >
              <ColorField
                label="Radius (base)"
                themeKey="theme_radius"
                value={theme.theme_radius}
                onChange={setT("theme_radius")}
                hint="Buttons, inputs"
              />
              <ColorField
                label="Radius LG"
                themeKey="theme_radius_lg"
                value={theme.theme_radius_lg}
                onChange={setT("theme_radius_lg")}
                hint="Cards, panels"
              />
              <ColorField
                label="Radius XL"
                themeKey="theme_radius_xl"
                value={theme.theme_radius_xl}
                onChange={setT("theme_radius_xl")}
                hint="Hero cards, modals"
              />
            </div>
          </div>

          {/* Theme actions */}
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: "1.25rem",
              borderTop: "1px solid #F1F5F9",
              marginTop: "1.25rem",
            }}
          >
            <button
              onClick={resetTheme}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1rem",
                borderRadius: "var(--radius, 0.625rem)",
                border: "1px solid var(--color-border, #E2E8F0)",
                background: "var(--color-surface, white)",
                color: "var(--color-text-secondary, #64748B)",
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 600,
                fontSize: "0.8125rem",
                cursor: "pointer",
              }}
            >
              <RotateCcw size={13} /> Reset to Default
            </button>
            <button
              onClick={saveTheme}
              disabled={savingTheme}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.625rem 1.5rem",
                borderRadius: "var(--radius, 0.75rem)",
                border: "none",
                background: "linear-gradient(135deg, #A78BFA, #7C3AED)",
                color: "white",
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 700,
                fontSize: "0.875rem",
                cursor: savingTheme ? "not-allowed" : "pointer",
                opacity: savingTheme ? 0.7 : 1,
              }}
            >
              {savingTheme ? (
                <>
                  <Loader2
                    size={14}
                    style={{ animation: "spin 0.8s linear infinite" }}
                  />{" "}
                  Saving...
                </>
              ) : (
                <>
                  <Palette size={14} /> Save Theme
                </>
              )}
            </button>
          </div>
        </Accordion>

        {/* ── WhatsApp Chat Widget ── */}
        <Accordion icon={MessageCircle} title="WhatsApp Chat Widget" color="#25D366">
          <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary, #64748B)", marginBottom: "1.5rem", lineHeight: 1.6 }}>
            A floating chat widget that appears on all public pages, letting visitors message or call your agent directly on WhatsApp.
          </p>

          {/* Enable / disable toggle */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.875rem 1rem", borderRadius: "var(--radius, 0.625rem)", border: "1px solid var(--color-border, #E2E8F0)", marginBottom: "1.25rem", background: "var(--color-surface-2, #f4f9f4)" }}>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: "0.875rem", color: "var(--color-text, #0F172A)", fontFamily: "Plus Jakarta Sans, sans-serif" }}>Show widget on public site</p>
              <p style={{ margin: "0.2rem 0 0", fontSize: "0.75rem", color: "var(--color-text-muted, #94A3B8)", fontFamily: "Inter, sans-serif" }}>
                {settings.wa_enabled === "false" ? "Widget is hidden" : "Widget is visible to visitors"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSettings((p) => ({ ...p, wa_enabled: p.wa_enabled === "false" ? "true" : "false" }))}
              style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", padding: 0, color: settings.wa_enabled === "false" ? "var(--color-text-muted, #94A3B8)" : "#25D366" }}
              aria-label="Toggle widget"
            >
              {settings.wa_enabled === "false"
                ? <ToggleLeft size={40} />
                : <ToggleRight size={40} />}
            </button>
          </div>

          {/* Avatar */}
          <AvatarUpload
            value={settings.wa_avatar || ""}
            onChange={(url) => setSettings((p) => ({ ...p, wa_avatar: url }))}
          />

          {/* Name + Title */}
          <div style={S.grid2}>
            <Field label="Agent Name" value={settings.wa_name} onChange={setS("wa_name")} placeholder="Lucky Benjamin" />
            <Field label="Agent Title / Role" value={settings.wa_title} onChange={setS("wa_title")} placeholder="CEO, Mehurbs Properties Limited" />
          </div>

          {/* WhatsApp number */}
          <Field
            label="WhatsApp Number"
            value={settings.wa_number}
            onChange={setS("wa_number")}
            placeholder="09021359415 or 2349021359415"
          />
          <p style={{ fontSize: "0.72rem", color: "var(--color-text-muted, #94A3B8)", marginTop: "-0.75rem", marginBottom: "1rem", fontFamily: "Inter, sans-serif" }}>
            Nigerian format (09...) or international format (2349...) — both work.
          </p>

          {/* Greeting message */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={S.label}>Greeting Message</label>
            <textarea
              value={settings.wa_message || ""}
              onChange={setS("wa_message")}
              onFocus={focus}
              onBlur={blur}
              rows={4}
              placeholder={`Hi there! 👋 I'm Lucky Benjamin. I'm not available right now, but send me a message and I'll get back to you as soon as possible!`}
              style={{ ...S.input, resize: "vertical", lineHeight: 1.6 }}
            />
            <p style={{ fontSize: "0.72rem", color: "var(--color-text-muted, #94A3B8)", marginTop: "0.3rem", fontFamily: "Inter, sans-serif" }}>
              This message is shown in the chat bubble that appears on the widget.
            </p>
          </div>

          {/* Pre-fill message */}
          <Field
            label="WhatsApp Pre-fill Text (optional)"
            value={settings.wa_prefill}
            onChange={setS("wa_prefill")}
            placeholder="Hello! I came across Mehurbs Properties and I'd like to enquire about a listing."
          />
          <p style={{ fontSize: "0.72rem", color: "var(--color-text-muted, #94A3B8)", marginTop: "-0.75rem", marginBottom: "1.25rem", fontFamily: "Inter, sans-serif" }}>
            Pre-filled message visitors see when they tap "Start Chat on WhatsApp".
          </p>

          {/* Save */}
          <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "0.5rem" }}>
            <button
              onClick={saveWhatsApp}
              disabled={savingWhatsapp}
              style={{
                display: "flex", alignItems: "center", gap: "0.5rem",
                padding: "0.625rem 1.5rem",
                borderRadius: "var(--radius, 0.75rem)",
                border: "none",
                background: "#25D366",
                color: "#fff",
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 700, fontSize: "0.875rem",
                cursor: savingWhatsapp ? "not-allowed" : "pointer",
                opacity: savingWhatsapp ? 0.7 : 1,
                boxShadow: "0 2px 8px rgba(37,211,102,0.35)",
              }}
            >
              {savingWhatsapp
                ? <><Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} /> Saving…</>
                : <><MessageCircle size={14} /> Save Widget Settings</>}
            </button>
          </div>
        </Accordion>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AdminShell>
  );
}
