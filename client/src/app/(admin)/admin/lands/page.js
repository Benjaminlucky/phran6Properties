"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { landsApi, mediaApi } from "@/lib/api";
import {
  API_URL,
  NIGERIAN_STATES,
  LAND_TITLES,
  LAND_STATUS,
  LAND_AMENITIES,
} from "@/config/site";
import { toast } from "sonner";
import {
  MapPin,
  Plus,
  Search,
  Edit2,
  Trash2,
  Star,
  StarOff,
  X,
  AlertCircle,
  RefreshCw,
  Loader2,
  Upload,
  Check,
} from "lucide-react";
import Pagination from "@/components/admin/Pagination";

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
    reserved: ["#ede9fe", "#5b21b6"],
    coming_soon: ["#fef3c7", "#92400e"],
  };
  const [bg, color] = map[status] || map.available;
  const label = LAND_STATUS.find((s) => s.value === status)?.label || status;
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
  estate_name: "",
  price: "",
  title_type: "c_of_o",
  size: "",
  overview_title: "",
  overview_body: "",
  amenities: [],
  neighborhood: [],
  payment_plan: "",
  initial_deposit_pct: "",
  feature_image: "",
  gallery: [],
  youtube_url: "",
  address: "",
  location: "",
  state: "",
  lga: "",
  meta_title: "",
  meta_description: "",
  status: "available",
  featured: false,
};

// ── ImageUpload ───────────────────────────────────────────────────
function ImageUpload({ label, value, onChange, folder = "lands" }) {
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
      } else toast.error("Upload failed — no path returned");
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
          if (!url) e.currentTarget.style.borderColor = "#ff6b6b";
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
                color: "#ff6b6b",
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
function GalleryUpload({ value = [], onChange, folder = "lands" }) {
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
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#ff6b6b")}
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
              style={{ color: "#ff6b6b", animation: "spin 1s linear infinite" }}
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

// ── TagInput ──────────────────────────────────────────────────────
function TagInput({
  label,
  value = [],
  onChange,
  suggestions = [],
  placeholder,
}) {
  const [input, setInput] = useState("");
  const add = (v) => {
    const val = (v || input).trim();
    if (val && !value.includes(val)) onChange([...value, val]);
    setInput("");
  };
  return (
    <div>
      <label style={S.label}>{label}</label>
      {suggestions.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.3rem",
            marginBottom: "0.5rem",
          }}
        >
          {suggestions
            .filter((s) => !value.includes(s))
            .slice(0, 8)
            .map((s) => (
              <button
                key={s}
                onClick={() => add(s)}
                style={{
                  background: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                  borderRadius: "9999px",
                  padding: "0.15rem 0.55rem",
                  fontSize: "0.72rem",
                  cursor: "pointer",
                  color: "var(--color-text-secondary, #475569)",
                }}
              >
                + {s}
              </button>
            ))}
        </div>
      )}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.375rem",
          marginBottom: "0.5rem",
        }}
      >
        {value.map((tag) => (
          <span
            key={tag}
            style={{
              background: "#0f172a",
              color: "#fff",
              borderRadius: "9999px",
              padding: "0.2rem 0.625rem",
              fontSize: "0.78rem",
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
            }}
          >
            {tag}
            <button
              onClick={() => onChange(value.filter((t) => t !== tag))}
              style={{
                border: "none",
                background: "none",
                cursor: "pointer",
                color: "#94a3b8",
                padding: 0,
                display: "inline-flex",
              }}
            >
              <X size={11} />
            </button>
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          style={{ ...S.input, flex: 1 }}
        />
        <button onClick={() => add()} style={S.btnSm}>
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

// ── LandForm ──────────────────────────────────────────────────────
function LandForm({ initial, onSave, onClose, saving }) {
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
          <label style={S.label}>Estate Name *</label>
          <input
            style={S.input}
            value={form.estate_name}
            onChange={(e) => set("estate_name", e.target.value)}
            placeholder="e.g. Royal Gardens Estate"
          />
        </div>
        <div>
          <label style={S.label}>Price (₦)</label>
          <input
            style={S.input}
            type="number"
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            placeholder="e.g. 5000000"
          />
        </div>
      </div>
      <div style={S.row3}>
        <div>
          <label style={S.label}>Title Type</label>
          <select
            style={S.input}
            value={form.title_type}
            onChange={(e) => set("title_type", e.target.value)}
          >
            {LAND_TITLES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={S.label}>Size</label>
          <input
            style={S.input}
            value={form.size}
            onChange={(e) => set("size", e.target.value)}
            placeholder="e.g. 500 SQM"
          />
        </div>
        <div>
          <label style={S.label}>Status</label>
          <select
            style={S.input}
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
          >
            {LAND_STATUS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
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
        <label style={S.label}>Overview Title</label>
        <input
          style={S.input}
          value={form.overview_title}
          onChange={(e) => set("overview_title", e.target.value)}
          placeholder="e.g. Prime Land in the Heart of Lagos"
        />
      </div>
      <div>
        <label style={S.label}>Description</label>
        <textarea
          style={{ ...S.input, minHeight: "100px", resize: "vertical" }}
          value={form.overview_body}
          onChange={(e) => set("overview_body", e.target.value)}
          placeholder="Full description…"
        />
      </div>
      <div style={S.row2}>
        <div>
          <label style={S.label}>Payment Plan</label>
          <input
            style={S.input}
            value={form.payment_plan}
            onChange={(e) => set("payment_plan", e.target.value)}
            placeholder="e.g. 6 months installment"
          />
        </div>
        <div>
          <label style={S.label}>Initial Deposit (%)</label>
          <input
            style={S.input}
            type="number"
            min="0"
            max="100"
            value={form.initial_deposit_pct}
            onChange={(e) => set("initial_deposit_pct", e.target.value)}
            placeholder="e.g. 30"
          />
        </div>
      </div>
      <ImageUpload
        label="Feature Image"
        value={form.feature_image}
        onChange={(v) => set("feature_image", v)}
        folder="lands"
      />
      <GalleryUpload
        value={form.gallery}
        onChange={(v) => set("gallery", v)}
        folder="lands"
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
      <TagInput
        label="Amenities"
        value={form.amenities}
        onChange={(v) => set("amenities", v)}
        suggestions={LAND_AMENITIES}
        placeholder="Type and press Enter"
      />
      <TagInput
        label="Neighborhood Features"
        value={form.neighborhood}
        onChange={(v) => set("neighborhood", v)}
        placeholder="e.g. School 2km away"
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
            background: form.featured ? "#ff6b6b" : "#e2e8f0",
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
export default function AdminLandsPage() {
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterState, setFilterState] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editLand, setEditLand] = useState(null);
  const [deleteLand, setDeleteLand] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const searchTimeout = useRef(null);

  const fetchLands = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, perPage };
      if (search) params.search = search;
      if (filterStatus) params.status = filterStatus;
      if (filterState) params.state = filterState;
      const res = await landsApi.adminGetAll(params);
      setLands(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      toast.error(err?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search, filterStatus, filterState]);

  useEffect(() => {
    fetchLands();
  }, [fetchLands]);

  const handleSearch = (v) => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setSearch(v);
      setPage(1);
    }, 400);
  };

  // ── perPage change — reset to page 1 ─────────────────────────
  const handlePerPage = (n) => {
    setPerPage(n);
    setPage(1);
  };

  const handleCreate = async (form) => {
    setSaving(true);
    try {
      await landsApi.create(form);
      toast.success("Created!");
      setCreateOpen(false);
      fetchLands();
    } catch (err) {
      toast.error(err?.message || "Failed");
    } finally {
      setSaving(false);
    }
  };
  const handleUpdate = async (form) => {
    setSaving(true);
    try {
      await landsApi.update(editLand._id || editLand.id, form);
      toast.success("Updated!");
      setEditLand(null);
      fetchLands();
    } catch (err) {
      toast.error(err?.message || "Failed");
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await landsApi.delete(deleteLand._id || deleteLand.id);
      toast.success("Deleted");
      setDeleteLand(null);
      fetchLands();
    } catch (err) {
      toast.error(err?.message || "Failed");
    } finally {
      setDeleting(false);
    }
  };
  const toggleFeatured = async (land) => {
    try {
      await landsApi.update(land._id || land.id, {
        ...land,
        featured: !land.featured,
      });
      fetchLands();
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
              <MapPin size={20} color="#ff6b6b" />
              <h1
                style={{
                  fontWeight: 800,
                  fontSize: "1.5rem",
                  color: "#0f172a",
                  margin: 0,
                }}
              >
                Land Listings
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
              Manage all land listings
            </p>
          </div>
          <button onClick={() => setCreateOpen(true)} style={S.btnPrimary}>
            <Plus size={16} /> Add Land
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
            {LAND_STATUS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
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
          <button onClick={fetchLands} style={S.btnIcon}>
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
                  color: "#ff6b6b",
                  animation: "spin 1s linear infinite",
                  display: "block",
                  margin: "0 auto 0.75rem",
                }}
              />
              <p style={{ color: "#94a3b8", margin: 0 }}>Loading…</p>
            </div>
          ) : lands.length === 0 ? (
            <div style={{ padding: "4rem", textAlign: "center" }}>
              <MapPin
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
                No lands found
              </p>
              <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.875rem" }}>
                Click "Add Land" to get started
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                    {[
                      "Estate",
                      "Location",
                      "Price",
                      "Title",
                      "Status",
                      "Featured",
                      "Views",
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
                  {lands.map((land) => (
                    <tr
                      key={land._id || land.id}
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
                          {land.feature_image ? (
                            <img
                              src={getImgUrl(land.feature_image)}
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
                              <MapPin size={18} color="#cbd5e1" />
                            </div>
                          )}
                          <div>
                            <p
                              style={{
                                fontWeight: 700,
                                fontSize: "0.875rem",
                                color: "#0f172a",
                                margin: "0 0 0.125rem",
                                maxWidth: "180px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {land.estate_name}
                            </p>
                            {land.size && (
                              <p
                                style={{
                                  fontSize: "0.75rem",
                                  color: "#94a3b8",
                                  margin: 0,
                                }}
                              >
                                {land.size}
                              </p>
                            )}
                          </div>
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
                          {land.location || "—"}
                        </p>
                        <p
                          style={{
                            fontSize: "0.75rem",
                            color: "#94a3b8",
                            margin: 0,
                          }}
                        >
                          {land.state || ""}
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
                          {formatPrice(land.price)}
                        </span>
                      </td>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <span
                          style={{
                            fontSize: "0.78rem",
                            color: "var(--color-text-secondary, #475569)",
                          }}
                        >
                          {LAND_TITLES.find((t) => t.value === land.title_type)
                            ?.label || land.title_type}
                        </span>
                      </td>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <StatusBadge status={land.status} />
                      </td>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <button
                          onClick={() => toggleFeatured(land)}
                          style={{
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            padding: "0.25rem",
                            color: land.featured ? "#f59e0b" : "#cbd5e1",
                          }}
                        >
                          {land.featured ? (
                            <Star size={18} fill="#f59e0b" />
                          ) : (
                            <StarOff size={18} />
                          )}
                        </button>
                      </td>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                          {land.views_count || 0}
                        </span>
                      </td>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <div style={{ display: "flex", gap: "0.375rem" }}>
                          <button
                            onClick={() => setEditLand(land)}
                            style={S.actionBtn}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteLand(land)}
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

        {/* ── Pagination ── */}
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          perPage={perPage}
          onPage={setPage}
          onPerPage={handlePerPage}
          label="listings"
        />
      </div>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add Land Listing"
        wide
      >
        <LandForm
          initial={EMPTY}
          onSave={handleCreate}
          onClose={() => setCreateOpen(false)}
          saving={saving}
        />
      </Modal>
      <Modal
        open={!!editLand}
        onClose={() => setEditLand(null)}
        title="Edit Land Listing"
        wide
      >
        {editLand && (
          <LandForm
            initial={editLand}
            onSave={handleUpdate}
            onClose={() => setEditLand(null)}
            saving={saving}
          />
        )}
      </Modal>
      <Modal
        open={!!deleteLand}
        onClose={() => setDeleteLand(null)}
        title="Delete Listing"
      >
        {deleteLand && (
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
              <strong style={{ color: "#0f172a" }}>
                {deleteLand.estate_name}
              </strong>
              ? This cannot be undone.
            </p>
            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                justifyContent: "center",
              }}
            >
              <button onClick={() => setDeleteLand(null)} style={S.btnOutline}>
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
    background: "#ff6b6b",
    color: "#fff",
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
};
