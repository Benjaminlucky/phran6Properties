"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { housesApi, mediaApi } from "@/lib/api";
import {
  API_URL,
  NIGERIAN_STATES,
  HOUSE_CATEGORIES,
  PROPERTY_STATUS,
  PRICE_LABELS,
  HOUSE_FEATURES,
  BEDROOM_OPTIONS,
} from "@/config/site";
import { toast } from "sonner";
import {
  Home,
  Plus,
  Search,
  Edit2,
  Trash2,
  Star,
  StarOff,
  ChevronLeft,
  ChevronRight,
  X,
  AlertCircle,
  RefreshCw,
  Loader2,
  Upload,
  Check,
  BedDouble,
  Bath,
} from "lucide-react";

function formatPrice(p) {
  if (!p) return "—";
  return "₦" + Number(p).toLocaleString("en-NG");
}

function getImgUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_URL}/${path}`;
}

function StatusBadge({ status }) {
  const map = {
    available: ["#d1fae5", "#065f46"],
    sold: ["#fee2e2", "#991b1b"],
    rented: ["#fee2e2", "#991b1b"],
    reserved: ["#ede9fe", "#5b21b6"],
    coming_soon: ["#fef3c7", "#92400e"],
    off_plan: ["#fef3c7", "#92400e"],
    ready_to_move: ["#d1fae5", "#065f46"],
  };
  const [bg, color] = map[status] || ["#f1f5f9", "#475569"];
  const label =
    PROPERTY_STATUS.find((s) => s.value === status)?.label || status;
  return (
    <span
      style={{
        background: bg,
        color,
        fontSize: "0.7rem",
        fontWeight: 700,
        padding: "0.2rem 0.55rem",
        borderRadius: "9999px",
      }}
    >
      {label}
    </span>
  );
}

const EMPTY = {
  title: "",
  description: "",
  location: "",
  state: "",
  lga: "",
  address: "",
  price: "",
  price_label: "outright",
  status: "available",
  category: "apartment",
  bedrooms: "",
  bathrooms: "",
  garage: 0,
  feature_image: "",
  gallery: [],
  youtube_url: "",
  features: [],
  meta_title: "",
  meta_description: "",
  featured: false,
};

// ── ImageUpload ───────────────────────────────────────────────────
function ImageUpload({ label, value, onChange, folder = "houses" }) {
  const [uploading, setUploading] = useState(false);
  const ref = useRef(null);
  const url = getImgUrl(value);

  const upload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await mediaApi.upload(file, folder);
      if (res?.data?.file_path) {
        onChange(res.data.file_path);
        toast.success("Image uploaded");
      } else toast.error("Upload failed");
    } catch (err) {
      toast.error(err?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label style={S.label}>{label}</label>
      <div
        onClick={() => !uploading && ref.current?.click()}
        style={{
          border: `2px dashed ${url ? "#22c55e" : "#e2e8f0"}`,
          borderRadius: "var(--radius, 0.75rem)",
          padding: url ? "0.5rem" : "2rem 1rem",
          textAlign: "center",
          cursor: uploading ? "wait" : "pointer",
          background: url ? "#f0fdf4" : "#f8fafc",
          transition: "all 150ms",
        }}
        onMouseEnter={(e) => {
          if (!url) e.currentTarget.style.borderColor = "var(--color-primary, #b2ff70)";
        }}
        onMouseLeave={(e) => {
          if (!url) e.currentTarget.style.borderColor = "#e2e8f0";
        }}
      >
        <input
          ref={ref}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => upload(e.target.files[0])}
        />
        {uploading ? (
          <>
            <Loader2
              size={26}
              style={{
                color: "var(--color-primary, #b2ff70)",
                animation: "spin 1s linear infinite",
                display: "block",
                margin: "0 auto 0.5rem",
              }}
            />
            <p style={{ margin: 0, fontSize: "0.8rem", color: "#94a3b8" }}>
              Uploading…
            </p>
          </>
        ) : url ? (
          <div style={{ position: "relative" }}>
            <img
              src={url}
              alt=""
              style={{
                width: "100%",
                maxHeight: "180px",
                objectFit: "cover",
                borderRadius: "0.5rem",
                display: "block",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "0.5rem",
                right: "0.5rem",
                display: "flex",
                gap: "0.375rem",
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  ref.current?.click();
                }}
                style={{
                  background: "rgba(0,0,0,0.65)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "0.375rem",
                  padding: "0.3rem 0.75rem",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Change
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onChange("");
                }}
                style={{
                  background: "rgba(239,68,68,0.85)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "0.375rem",
                  padding: "0.3rem 0.5rem",
                  cursor: "pointer",
                  display: "inline-flex",
                }}
              >
                <X size={12} />
              </button>
            </div>
            <p
              style={{
                margin: "0.5rem 0 0",
                fontSize: "0.75rem",
                color: "#16a34a",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
                justifyContent: "center",
              }}
            >
              <Check size={13} /> Uploaded
            </p>
          </div>
        ) : (
          <>
            <Upload
              size={26}
              style={{
                color: "#cbd5e1",
                display: "block",
                margin: "0 auto 0.5rem",
              }}
            />
            <p
              style={{
                margin: "0 0 0.25rem",
                fontWeight: 600,
                fontSize: "0.875rem",
                color: "var(--color-text-secondary, #475569)",
              }}
            >
              Click to upload
            </p>
            <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>
              Any image format · Max 5MB
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// ── GalleryUpload ─────────────────────────────────────────────────
function GalleryUpload({ value = [], onChange, folder = "houses" }) {
  const [uploading, setUploading] = useState(false);
  const ref = useRef(null);

  const upload = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    const added = [];
    for (const file of Array.from(files)) {
      try {
        const res = await mediaApi.upload(file, folder);
        if (res?.data?.file_path) added.push(res.data.file_path);
        else toast.error(`Failed: ${file.name}`);
      } catch {
        toast.error(`Failed: ${file.name}`);
      }
    }
    if (added.length) {
      onChange([...value, ...added]);
      toast.success(
        `${added.length} image${added.length > 1 ? "s" : ""} added`,
      );
    }
    setUploading(false);
  };

  return (
    <div>
      <label style={S.label}>Gallery Images ({value.length})</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        {value.map((path, i) => (
          <div
            key={i}
            style={{
              position: "relative",
              width: "88px",
              height: "88px",
              borderRadius: "0.5rem",
              overflow: "hidden",
              border: "1px solid #e2e8f0",
            }}
          >
            <img
              src={getImgUrl(path)}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <button
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              style={{
                position: "absolute",
                top: "3px",
                right: "3px",
                background: "rgba(239,68,68,0.85)",
                color: "#fff",
                border: "none",
                borderRadius: "0.25rem",
                width: "20px",
                height: "20px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={11} />
            </button>
          </div>
        ))}
        <div
          onClick={() => !uploading && ref.current?.click()}
          style={{
            width: "88px",
            height: "88px",
            borderRadius: "0.5rem",
            border: "2px dashed #e2e8f0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: uploading ? "wait" : "pointer",
            background: "#f8fafc",
            gap: "0.25rem",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--color-primary, #b2ff70)")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
        >
          <input
            ref={ref}
            type="file"
            accept="image/*"
            multiple
            style={{ display: "none" }}
            onChange={(e) => upload(e.target.files)}
          />
          {uploading ? (
            <Loader2
              size={20}
              style={{ color: "var(--color-primary, #b2ff70)", animation: "spin 1s linear infinite" }}
            />
          ) : (
            <>
              <Plus size={20} style={{ color: "#94a3b8" }} />
              <span style={{ fontSize: "0.65rem", color: "#94a3b8" }}>Add</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── FeatureSelect ─────────────────────────────────────────────────
function FeatureSelect({ label, value = [], onChange }) {
  const [custom, setCustom] = useState("");
  const toggle = (f) =>
    value.includes(f)
      ? onChange(value.filter((v) => v !== f))
      : onChange([...value, f]);
  const addCustom = () => {
    const v = custom.trim();
    if (v && !value.includes(v)) {
      onChange([...value, v]);
      setCustom("");
    }
  };
  return (
    <div>
      <label style={S.label}>{label}</label>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.375rem",
          marginBottom: "0.75rem",
        }}
      >
        {HOUSE_FEATURES.map((f) => (
          <button
            key={f}
            onClick={() => toggle(f)}
            style={{
              padding: "0.25rem 0.625rem",
              borderRadius: "9999px",
              border: `1px solid ${value.includes(f) ? "#0f172a" : "#e2e8f0"}`,
              background: value.includes(f) ? "#0f172a" : "#f8fafc",
              color: value.includes(f) ? "#fff" : "#475569",
              fontSize: "0.78rem",
              cursor: "pointer",
              fontWeight: value.includes(f) ? 600 : 400,
            }}
          >
            {f}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCustom();
            }
          }}
          placeholder="Custom feature…"
          style={{ ...S.input, flex: 1 }}
        />
        <button onClick={addCustom} style={S.btnSm}>
          Add
        </button>
      </div>
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children, wide }) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(15,23,42,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "var(--radius-lg, 1rem)",
          width: "100%",
          maxWidth: wide ? "820px" : "480px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 60px rgba(0,0,0,0.2)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid #e2e8f0",
            flexShrink: 0,
          }}
        >
          <h2
            style={{
              fontWeight: 800,
              fontSize: "1.125rem",
              color: "#0f172a",
              margin: 0,
            }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              color: "#94a3b8",
            }}
          >
            <X size={20} />
          </button>
        </div>
        <div style={{ overflowY: "auto", flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}

// ── HouseForm ─────────────────────────────────────────────────────
function HouseForm({ initial, onSave, onClose, saving }) {
  const [form, setForm] = useState({ ...EMPTY, ...initial });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div
      style={{
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
      }}
    >
      <div style={S.row2}>
        <div>
          <label style={S.label}>Title *</label>
          <input
            style={S.input}
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. 4 Bedroom Duplex in Lekki"
          />
        </div>
        <div>
          <label style={S.label}>Category</label>
          <select
            style={S.input}
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
          >
            {HOUSE_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={S.row3}>
        <div>
          <label style={S.label}>Status</label>
          <select
            style={S.input}
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
          >
            {PROPERTY_STATUS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={S.label}>Price (₦)</label>
          <input
            style={S.input}
            type="number"
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            placeholder="e.g. 50000000"
          />
        </div>
        <div>
          <label style={S.label}>Price Label</label>
          <select
            style={S.input}
            value={form.price_label}
            onChange={(e) => set("price_label", e.target.value)}
          >
            {PRICE_LABELS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={S.row3}>
        <div>
          <label style={S.label}>Bedrooms</label>
          <select
            style={S.input}
            value={form.bedrooms}
            onChange={(e) => set("bedrooms", e.target.value)}
          >
            <option value="">Select</option>
            {BEDROOM_OPTIONS.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={S.label}>Bathrooms</label>
          <input
            style={S.input}
            type="number"
            min="1"
            value={form.bathrooms}
            onChange={(e) => set("bathrooms", e.target.value)}
            placeholder="e.g. 3"
          />
        </div>
        <div>
          <label style={S.label}>Garage Spaces</label>
          <input
            style={S.input}
            type="number"
            min="0"
            value={form.garage}
            onChange={(e) => set("garage", e.target.value)}
            placeholder="0"
          />
        </div>
      </div>

      <div style={S.row3}>
        <div>
          <label style={S.label}>State</label>
          <select
            style={S.input}
            value={form.state}
            onChange={(e) => set("state", e.target.value)}
          >
            <option value="">Select State</option>
            {NIGERIAN_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={S.label}>LGA</label>
          <input
            style={S.input}
            value={form.lga}
            onChange={(e) => set("lga", e.target.value)}
            placeholder="Local Gov. Area"
          />
        </div>
        <div>
          <label style={S.label}>Area / Location</label>
          <input
            style={S.input}
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            placeholder="e.g. Lekki Phase 1"
          />
        </div>
      </div>

      <div>
        <label style={S.label}>Full Address</label>
        <input
          style={S.input}
          value={form.address}
          onChange={(e) => set("address", e.target.value)}
          placeholder="Street address"
        />
      </div>
      <div>
        <label style={S.label}>Description</label>
        <textarea
          style={{ ...S.input, minHeight: "100px", resize: "vertical" }}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Full description of the property…"
        />
      </div>

      {/* IMAGE UPLOADS */}
      <ImageUpload
        label="Feature Image"
        value={form.feature_image}
        onChange={(v) => set("feature_image", v)}
        folder="houses"
      />
      <GalleryUpload
        value={form.gallery}
        onChange={(v) => set("gallery", v)}
        folder="houses"
      />

      <div>
        <label style={S.label}>YouTube URL (optional)</label>
        <input
          style={S.input}
          value={form.youtube_url}
          onChange={(e) => set("youtube_url", e.target.value)}
          placeholder="https://youtube.com/watch?v=..."
        />
      </div>

      <FeatureSelect
        label="Features & Amenities"
        value={form.features}
        onChange={(v) => set("features", v)}
      />

      <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "1rem" }}>
        <p
          style={{
            fontSize: "0.78rem",
            fontWeight: 600,
            color: "#94a3b8",
            marginBottom: "0.875rem",
          }}
        >
          SEO (optional)
        </p>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          <div>
            <label style={S.label}>Meta Title</label>
            <input
              style={S.input}
              value={form.meta_title}
              onChange={(e) => set("meta_title", e.target.value)}
              placeholder="SEO title"
            />
          </div>
          <div>
            <label style={S.label}>Meta Description</label>
            <textarea
              style={{ ...S.input, minHeight: "72px", resize: "vertical" }}
              value={form.meta_description}
              onChange={(e) => set("meta_description", e.target.value)}
              placeholder="SEO description"
            />
          </div>
        </div>
      </div>

      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          cursor: "pointer",
        }}
      >
        <div
          onClick={() => set("featured", !form.featured)}
          style={{
            width: "44px",
            height: "24px",
            borderRadius: "9999px",
            background: form.featured ? "var(--color-primary, #b2ff70)" : "#e2e8f0",
            position: "relative",
            cursor: "pointer",
            transition: "background 0.2s",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "3px",
              left: form.featured ? "23px" : "3px",
              width: "18px",
              height: "18px",
              borderRadius: "50%",
              background: "#fff",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              transition: "left 0.2s",
            }}
          />
        </div>
        <span
          style={{ fontWeight: 600, fontSize: "0.875rem", color: "#0f172a" }}
        >
          Featured Listing
        </span>
      </label>

      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          justifyContent: "flex-end",
          paddingTop: "0.5rem",
        }}
      >
        <button onClick={onClose} style={S.btnOutline} disabled={saving}>
          Cancel
        </button>
        <button
          onClick={() => onSave(form)}
          style={S.btnPrimary}
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2
                size={14}
                style={{ animation: "spin 1s linear infinite" }}
              />{" "}
              Saving…
            </>
          ) : (
            "Save Listing"
          )}
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function AdminHousesPage() {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterState, setFilterState] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editHouse, setEditHouse] = useState(null);
  const [deleteHouse, setDeleteHouse] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const searchTimeout = useRef(null);

  const fetchHouses = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, perPage: 12 };
      if (search) params.search = search;
      if (filterStatus) params.status = filterStatus;
      if (filterState) params.state = filterState;
      if (filterCategory) params.category = filterCategory;
      const res = await housesApi.adminGetAll(params);
      setHouses(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      toast.error(err?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [page, search, filterStatus, filterState, filterCategory]);

  useEffect(() => {
    fetchHouses();
  }, [fetchHouses]);

  const handleSearch = (v) => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setSearch(v);
      setPage(1);
    }, 400);
  };
  const handleCreate = async (form) => {
    setSaving(true);
    try {
      await housesApi.create(form);
      toast.success("Created!");
      setCreateOpen(false);
      fetchHouses();
    } catch (err) {
      toast.error(err?.message || "Failed");
    } finally {
      setSaving(false);
    }
  };
  const handleUpdate = async (form) => {
    setSaving(true);
    try {
      await housesApi.update(editHouse._id || editHouse.id, form);
      toast.success("Updated!");
      setEditHouse(null);
      fetchHouses();
    } catch (err) {
      toast.error(err?.message || "Failed");
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await housesApi.delete(deleteHouse._id || deleteHouse.id);
      toast.success("Deleted");
      setDeleteHouse(null);
      fetchHouses();
    } catch (err) {
      toast.error(err?.message || "Failed");
    } finally {
      setDeleting(false);
    }
  };
  const toggleFeatured = async (house) => {
    try {
      await housesApi.update(house._id || house.id, { featured: !house.featured });
      fetchHouses();
    } catch {
      toast.error("Failed");
    }
  };

  return (
    <AdminShell>
      <div style={{ padding: "2rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.75rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
                marginBottom: "0.25rem",
              }}
            >
              <Home size={20} style={{ color: "var(--color-primary, #b2ff70)" }} />
              <h1
                style={{
                  fontWeight: 800,
                  fontSize: "1.5rem",
                  color: "#0f172a",
                  margin: 0,
                }}
              >
                House Listings
              </h1>
              <span
                style={{
                  background: "#f1f5f9",
                  color: "var(--color-text-secondary, #475569)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  padding: "0.2rem 0.55rem",
                  borderRadius: "9999px",
                }}
              >
                {total}
              </span>
            </div>
            <p style={{ color: "#94a3b8", fontSize: "0.875rem", margin: 0 }}>
              Manage all house listings
            </p>
          </div>
          <button onClick={() => setCreateOpen(true)} style={S.btnPrimary}>
            <Plus size={16} /> Add House
          </button>
        </div>

        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            marginBottom: "1.25rem",
            flexWrap: "wrap",
          }}
        >
          <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
            <Search
              size={14}
              style={{
                position: "absolute",
                left: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8",
              }}
            />
            <input
              style={{ ...S.input, paddingLeft: "2.25rem" }}
              placeholder="Search…"
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <select
            style={{ ...S.input, minWidth: "130px" }}
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Statuses</option>
            {PROPERTY_STATUS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <select
            style={{ ...S.input, minWidth: "130px" }}
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Types</option>
            {HOUSE_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <select
            style={{ ...S.input, minWidth: "130px" }}
            value={filterState}
            onChange={(e) => {
              setFilterState(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All States</option>
            {NIGERIAN_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button onClick={fetchHouses} style={S.btnIcon}>
            <RefreshCw
              size={14}
              style={{
                animation: loading ? "spin 1s linear infinite" : "none",
              }}
            />
          </button>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: "var(--radius-lg, 1rem)",
            border: "1px solid #e2e8f0",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}
        >
          {loading ? (
            <div style={{ padding: "4rem", textAlign: "center" }}>
              <Loader2
                size={30}
                style={{
                  color: "var(--color-primary, #b2ff70)",
                  animation: "spin 1s linear infinite",
                  display: "block",
                  margin: "0 auto 0.75rem",
                }}
              />
              <p style={{ color: "#94a3b8", margin: 0 }}>Loading…</p>
            </div>
          ) : houses.length === 0 ? (
            <div style={{ padding: "4rem", textAlign: "center" }}>
              <Home
                size={40}
                style={{
                  color: "#e2e8f0",
                  display: "block",
                  margin: "0 auto 1rem",
                }}
              />
              <p
                style={{
                  fontWeight: 700,
                  color: "var(--color-text-secondary, #475569)",
                  margin: "0 0 0.25rem",
                }}
              >
                No houses found
              </p>
              <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.875rem" }}>
                Click "Add House" to get started
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                    {[
                      "Property",
                      "Location",
                      "Price",
                      "Beds/Baths",
                      "Category",
                      "Status",
                      "Featured",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "0.875rem 1rem",
                          textAlign: "left",
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          color: "#94a3b8",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {houses.map((house) => (
                    <tr
                      key={house.id}
                      style={{ borderBottom: "1px solid #f8fafc" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#fafbff")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                          }}
                        >
                          {house.feature_image ? (
                            <img
                              src={getImgUrl(house.feature_image)}
                              alt=""
                              style={{
                                width: "44px",
                                height: "44px",
                                objectFit: "cover",
                                borderRadius: "0.5rem",
                                flexShrink: 0,
                              }}
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: "44px",
                                height: "44px",
                                borderRadius: "0.5rem",
                                background: "#f1f5f9",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              <Home size={18} color="#cbd5e1" />
                            </div>
                          )}
                          <p
                            style={{
                              fontWeight: 700,
                              fontSize: "0.875rem",
                              color: "#0f172a",
                              margin: 0,
                              maxWidth: "160px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {house.title}
                          </p>
                        </div>
                      </td>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <p
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--color-text-secondary, #475569)",
                            margin: 0,
                          }}
                        >
                          {house.location || "—"}
                        </p>
                        <p
                          style={{
                            fontSize: "0.75rem",
                            color: "#94a3b8",
                            margin: 0,
                          }}
                        >
                          {house.state || ""}
                        </p>
                      </td>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: "0.875rem",
                            color: "#0f172a",
                          }}
                        >
                          {formatPrice(house.price)}
                        </span>
                        <p
                          style={{
                            fontSize: "0.72rem",
                            color: "#94a3b8",
                            margin: 0,
                          }}
                        >
                          {
                            PRICE_LABELS.find(
                              (p) => p.value === house.price_label,
                            )?.label
                          }
                        </p>
                      </td>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <div style={{ display: "flex", gap: "0.75rem" }}>
                          {house.bedrooms != null && (
                            <span
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.25rem",
                                fontSize: "0.8rem",
                                color: "var(--color-text-secondary, #475569)",
                              }}
                            >
                              <BedDouble size={13} /> {house.bedrooms}
                            </span>
                          )}
                          {house.bathrooms != null && (
                            <span
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.25rem",
                                fontSize: "0.8rem",
                                color: "var(--color-text-secondary, #475569)",
                              }}
                            >
                              <Bath size={13} /> {house.bathrooms}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <span
                          style={{
                            fontSize: "0.78rem",
                            color: "var(--color-text-secondary, #475569)",
                          }}
                        >
                          {HOUSE_CATEGORIES.find(
                            (c) => c.value === house.category,
                          )?.label || house.category}
                        </span>
                      </td>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <StatusBadge status={house.status} />
                      </td>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <button
                          onClick={() => toggleFeatured(house)}
                          style={{
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            padding: "0.25rem",
                            color: house.featured ? "#f59e0b" : "#cbd5e1",
                          }}
                        >
                          {house.featured ? (
                            <Star size={18} fill="#f59e0b" />
                          ) : (
                            <StarOff size={18} />
                          )}
                        </button>
                      </td>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <div style={{ display: "flex", gap: "0.375rem" }}>
                          <button
                            onClick={() => setEditHouse(house)}
                            style={S.actionBtn}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteHouse(house)}
                            style={{ ...S.actionBtn, color: "#ef4444" }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "1rem",
              flexWrap: "wrap",
              gap: "0.75rem",
            }}
          >
            <p style={{ fontSize: "0.8rem", color: "#94a3b8", margin: 0 }}>
              Page {page} of {totalPages} · {total} listings
            </p>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={S.pageBtn}
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = page <= 3 ? i + 1 : page - 2 + i;
                if (p < 1 || p > totalPages) return null;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    style={{
                      ...S.pageBtn,
                      background: p === page ? "var(--color-primary, #b2ff70)" : "#fff",
                      color: p === page ? "var(--color-secondary, #1b2f31)" : "#475569",
                    }}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={S.pageBtn}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add House Listing"
        wide
      >
        <HouseForm
          initial={EMPTY}
          onSave={handleCreate}
          onClose={() => setCreateOpen(false)}
          saving={saving}
        />
      </Modal>
      <Modal
        open={!!editHouse}
        onClose={() => setEditHouse(null)}
        title="Edit House Listing"
        wide
      >
        {editHouse && (
          <HouseForm
            initial={editHouse}
            onSave={handleUpdate}
            onClose={() => setEditHouse(null)}
            saving={saving}
          />
        )}
      </Modal>
      <Modal
        open={!!deleteHouse}
        onClose={() => setDeleteHouse(null)}
        title="Delete Listing"
      >
        {deleteHouse && (
          <div style={{ padding: "1.5rem", textAlign: "center" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "#fee2e2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1rem",
              }}
            >
              <AlertCircle size={28} color="#ef4444" />
            </div>
            <p
              style={{
                color: "var(--color-text-secondary, #475569)",
                margin: "0 0 1.5rem",
                lineHeight: 1.6,
              }}
            >
              Delete{" "}
              <strong style={{ color: "#0f172a" }}>{deleteHouse.title}</strong>?
              This cannot be undone.
            </p>
            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                justifyContent: "center",
              }}
            >
              <button onClick={() => setDeleteHouse(null)} style={S.btnOutline}>
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{ ...S.btnPrimary, background: "#ef4444" }}
              >
                {deleting ? (
                  <>
                    <Loader2
                      size={14}
                      style={{ animation: "spin 1s linear infinite" }}
                    />{" "}
                    Deleting…
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AdminShell>
  );
}

const S = {
  label: {
    display: "block",
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "#374151",
    marginBottom: "0.375rem",
  },
  input: {
    width: "100%",
    padding: "0.625rem 0.875rem",
    border: "1px solid #e2e8f0",
    borderRadius: "0.5rem",
    fontSize: "0.875rem",
    color: "#0f172a",
    background: "#fff",
    outline: "none",
    boxSizing: "border-box",
  },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" },
  row3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" },
  btnPrimary: {
    background: "var(--color-primary, #b2ff70)",
    color: "var(--color-secondary, #1b2f31)",
    border: "none",
    cursor: "pointer",
    padding: "0.625rem 1.25rem",
    borderRadius: "var(--radius, 0.625rem)",
    fontWeight: 700,
    fontSize: "0.875rem",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.375rem",
  },
  btnOutline: {
    background: "#fff",
    color: "var(--color-text-secondary, #475569)",
    border: "1px solid #e2e8f0",
    cursor: "pointer",
    padding: "0.625rem 1.25rem",
    borderRadius: "var(--radius, 0.625rem)",
    fontWeight: 600,
    fontSize: "0.875rem",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.375rem",
  },
  btnSm: {
    background: "#f1f5f9",
    color: "var(--color-text-secondary, #475569)",
    border: "none",
    cursor: "pointer",
    padding: "0.5rem 0.875rem",
    borderRadius: "0.5rem",
    fontWeight: 600,
    fontSize: "0.8rem",
  },
  btnIcon: {
    background: "#f8fafc",
    color: "var(--color-text-secondary, #475569)",
    border: "1px solid #e2e8f0",
    cursor: "pointer",
    padding: "0.5rem 0.625rem",
    borderRadius: "0.5rem",
    display: "inline-flex",
    alignItems: "center",
  },
  actionBtn: {
    background: "#f8fafc",
    color: "var(--color-text-secondary, #475569)",
    border: "1px solid #e2e8f0",
    cursor: "pointer",
    padding: "0.4rem",
    borderRadius: "0.375rem",
    display: "inline-flex",
    alignItems: "center",
  },
  pageBtn: {
    background: "#fff",
    color: "var(--color-text-secondary, #475569)",
    border: "1px solid #e2e8f0",
    cursor: "pointer",
    padding: "0.4rem 0.625rem",
    borderRadius: "0.5rem",
    display: "inline-flex",
    alignItems: "center",
    fontSize: "0.875rem",
    fontWeight: 600,
  },
};
