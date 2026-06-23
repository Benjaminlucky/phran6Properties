"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { enquiriesApi } from "@/lib/api";
import { toast } from "sonner";
import {
  MessageSquare,
  RefreshCw,
  Search,
  X,
  Loader2,
  Phone,
  Mail,
  MessageCircle,
  CheckCircle,
  Eye,
  Trash2,
  Download,
  CheckSquare,
  Square,
  MapPin,
  Home,
  Globe,
  Check,
  StickyNote,
  Tag,
} from "lucide-react";
import Pagination from "@/components/admin/Pagination";

// ── Constants ─────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  {
    value: "",
    label: "All",
    color: "var(--color-text-secondary, #475569)",
    bg: "#F1F5F9",
  },
  { value: "new", label: "New", color: "#16A34A", bg: "#DCFCE7" },
  { value: "read", label: "Read", color: "#0369A1", bg: "#E0F2FE" },
  { value: "replied", label: "Replied", color: "#92400E", bg: "#FEF9C3" },
  {
    value: "closed",
    label: "Closed",
    color: "var(--color-text-secondary, #64748B)",
    bg: "#F1F5F9",
  },
];

const LISTING_ICONS = {
  land: <MapPin size={11} />,
  house: <Home size={11} />,
  general: <Globe size={11} />,
};

// ── Helpers ───────────────────────────────────────────────────────
function buildWhatsAppLink(phone, message) {
  const digits = (phone || "").replace(/\D/g, "");
  const num = digits.startsWith("0") ? "234" + digits.slice(1) : digits;
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function fmtDateTime(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getId(e) {
  return e._id || e.id;
}

function fullName(e) {
  return [e.first_name, e.last_name].filter(Boolean).join(" ") || "Unknown";
}

// ── Status badge ──────────────────────────────────────────────────
function StatusBadge({ status }) {
  const s = STATUS_OPTIONS.find((o) => o.value === status) || STATUS_OPTIONS[1];
  return (
    <span
      style={{
        fontSize: "0.68rem",
        fontWeight: 700,
        padding: "0.2rem 0.625rem",
        borderRadius: "9999px",
        background: s.bg,
        color: s.color,
        fontFamily: "var(--font-heading)",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        whiteSpace: "nowrap",
      }}
    >
      {s.label || status}
    </span>
  );
}

// ── Listing type badge ────────────────────────────────────────────
function ListingBadge({ type }) {
  if (!type || type === "general")
    return (
      <span
        style={{
          color: "var(--color-text-muted, #94A3B8)",
          fontSize: "0.8rem",
        }}
      >
        General
      </span>
    );
  const colors = {
    land: ["#FEF9C3", "#92400E"],
    house: ["#E0F2FE", "#0369A1"],
  };
  const [bg, color] = colors[type] || ["#F1F5F9", "#475569"];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.25rem",
        fontSize: "0.7rem",
        fontWeight: 700,
        padding: "0.2rem 0.5rem",
        borderRadius: "9999px",
        background: bg,
        color,
        fontFamily: "var(--font-heading)",
        textTransform: "capitalize",
      }}
    >
      {LISTING_ICONS[type]} {type}
    </span>
  );
}

// ── Detail modal ──────────────────────────────────────────────────
function EnquiryModal({ enquiry, onClose, onUpdate }) {
  const [status, setStatus] = useState(enquiry.status);
  const [notes, setNotes] = useState(enquiry.notes || "");
  const [saving, setSaving] = useState(false);
  const name = fullName(enquiry);

  useEffect(() => {
    if (enquiry.status === "new") {
      enquiriesApi.update(getId(enquiry), { status: "read" }).catch(() => {});
      setStatus("read");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await enquiriesApi.update(getId(enquiry), { status, notes });
      toast.success("Enquiry updated");
      onUpdate();
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const waMsg = `Hello ${enquiry.first_name}, thank you for your enquiry${enquiry.listing_type && enquiry.listing_type !== "general" ? ` about this ${enquiry.listing_type}` : ""}. `;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(15,23,42,0.65)",
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
          background: "var(--color-surface, white)",
          borderRadius: "var(--radius-lg, 1rem)",
          width: "100%",
          maxWidth: "580px",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid #E2E8F0",
            position: "sticky",
            top: 0,
            background: "var(--color-surface, white)",
            zIndex: 2,
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <div
              style={{
                width: "2.25rem",
                height: "2.25rem",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #FF6B6B, #0F172A)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  color: "white",
                  fontSize: "0.875rem",
                  fontWeight: 700,
                }}
              >
                {name.charAt(0)}
              </span>
            </div>
            <div>
              <h3
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 700,
                  fontSize: "1rem",
                  color: "var(--color-text, #0F172A)",
                  margin: 0,
                }}
              >
                {name}
              </h3>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--color-text-muted, #94A3B8)",
                  margin: 0,
                }}
              >
                {fmtDateTime(enquiry.createdAt || enquiry.created_at)}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <StatusBadge status={status} />
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--color-text-muted, #94A3B8)",
                padding: "0.25rem",
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div
          style={{
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
          }}
        >
          {/* Contact card */}
          <div
            style={{
              background: "var(--color-surface-2, #F8FAFC)",
              borderRadius: "var(--radius, 0.75rem)",
              padding: "1rem 1.25rem",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.75rem",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}
            >
              <Phone
                size={14}
                style={{
                  color: "var(--color-primary, #FF6B6B)",
                  flexShrink: 0,
                }}
              />
              <div>
                <p
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--color-text-muted, #94A3B8)",
                    margin: 0,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Phone
                </p>
                <a
                  href={"tel:" + enquiry.phone}
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--color-text, #0F172A)",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  {enquiry.phone}
                </a>
              </div>
            </div>
            {enquiry.email && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.625rem",
                }}
              >
                <Mail
                  size={14}
                  style={{
                    color: "var(--color-primary, #FF6B6B)",
                    flexShrink: 0,
                  }}
                />
                <div>
                  <p
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--color-text-muted, #94A3B8)",
                      margin: 0,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    Email
                  </p>
                  <a
                    href={"mailto:" + enquiry.email}
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--color-text, #0F172A)",
                      fontWeight: 600,
                      textDecoration: "none",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      display: "block",
                      maxWidth: "180px",
                    }}
                  >
                    {enquiry.email}
                  </a>
                </div>
              </div>
            )}
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}
            >
              <Tag
                size={14}
                style={{
                  color: "var(--color-primary, #FF6B6B)",
                  flexShrink: 0,
                }}
              />
              <div>
                <p
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--color-text-muted, #94A3B8)",
                    margin: 0,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Type
                </p>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--color-text, #0F172A)",
                    fontWeight: 600,
                    margin: 0,
                  }}
                >
                  {enquiry.inquiry_type || "General"}
                </p>
              </div>
            </div>
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}
            >
              <Globe
                size={14}
                style={{
                  color: "var(--color-primary, #FF6B6B)",
                  flexShrink: 0,
                }}
              />
              <div>
                <p
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--color-text-muted, #94A3B8)",
                    margin: 0,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Source
                </p>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--color-text, #0F172A)",
                    fontWeight: 600,
                    margin: 0,
                    textTransform: "capitalize",
                  }}
                >
                  {(enquiry.source || "website").replace(/_/g, " ")}
                </p>
              </div>
            </div>
          </div>

          {/* Linked listing */}
          {enquiry.listing_type && enquiry.listing_type !== "general" && (
            <div
              style={{
                padding: "0.875rem 1.125rem",
                borderRadius: "var(--radius, 0.75rem)",
                border: "1px solid var(--color-border, #E2E8F0)",
                background: "#FAFAFA",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <div
                style={{
                  width: "2rem",
                  height: "2rem",
                  borderRadius: "0.5rem",
                  background:
                    enquiry.listing_type === "land" ? "#FEF9C3" : "#E0F2FE",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {enquiry.listing_type === "land" ? (
                  <MapPin size={14} style={{ color: "#92400E" }} />
                ) : (
                  <Home size={14} style={{ color: "#0369A1" }} />
                )}
              </div>
              <div>
                <p
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--color-text-muted, #94A3B8)",
                    margin: 0,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Linked {enquiry.listing_type}
                </p>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--color-text, #0F172A)",
                    fontWeight: 600,
                    margin: 0,
                  }}
                >
                  {enquiry.listing_id
                    ? String(enquiry.listing_id).slice(-8).toUpperCase()
                    : "—"}
                </p>
              </div>
            </div>
          )}

          {/* Message */}
          <div>
            <p
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 700,
                fontSize: "0.75rem",
                color: "var(--color-text-secondary, #64748B)",
                marginBottom: "0.5rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Message
            </p>
            <div
              style={{
                background: "var(--color-surface-2, #F8FAFC)",
                borderRadius: "var(--radius, 0.75rem)",
                padding: "1rem 1.25rem",
                fontSize: "0.9375rem",
                color: "var(--color-text, #0F172A)",
                lineHeight: 1.75,
                whiteSpace: "pre-wrap",
                border: "1px solid #F1F5F9",
              }}
            >
              {enquiry.message}
            </div>
          </div>

          {/* Status */}
          <div>
            <p
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 700,
                fontSize: "0.75rem",
                color: "var(--color-text-secondary, #64748B)",
                marginBottom: "0.625rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Update Status
            </p>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {STATUS_OPTIONS.filter((s) => s.value).map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStatus(s.value)}
                  style={{
                    padding: "0.4rem 1rem",
                    borderRadius: "9999px",
                    border: `1px solid ${status === s.value ? s.color : "#E2E8F0"}`,
                    background: status === s.value ? s.bg : "white",
                    color: status === s.value ? s.color : "#64748B",
                    fontFamily: "var(--font-heading)",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    transition: "all 150ms",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                  }}
                >
                  {status === s.value && <Check size={11} />} {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <p
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 700,
                fontSize: "0.75rem",
                color: "var(--color-text-secondary, #64748B)",
                marginBottom: "0.5rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
              }}
            >
              <StickyNote size={12} /> Internal Notes
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add private notes about this enquiry…"
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "var(--radius, 0.625rem)",
                border: "1px solid var(--color-border, #E2E8F0)",
                fontSize: "0.875rem",
                color: "var(--color-text, #0F172A)",
                resize: "vertical",
                outline: "none",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "var(--color-primary, #FF6B6B)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "var(--color-border, #E2E8F0)")
              }
            />
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <a
              href={buildWhatsAppLink(enquiry.phone, waMsg)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 1.25rem",
                borderRadius: "var(--radius, 0.75rem)",
                border: "none",
                background: "linear-gradient(135deg, #128C7E 0%, #25D366 100%)",
                color: "white",
                fontFamily: "var(--font-heading)",
                fontWeight: 700,
                fontSize: "0.875rem",
                textDecoration: "none",
                boxShadow: "0 4px 12px rgba(37,211,102,0.3)",
              }}
            >
              <MessageCircle size={15} /> Reply on WhatsApp
            </a>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                flex: 1,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                padding: "0.75rem 1.25rem",
                borderRadius: "var(--radius, 0.75rem)",
                border: "none",
                background: saving
                  ? "rgba(255,107,107,0.5)"
                  : "linear-gradient(135deg, #FF6B6B 0%, #E85555 100%)",
                color: "white",
                fontFamily: "var(--font-heading)",
                fontWeight: 700,
                fontSize: "0.875rem",
                cursor: saving ? "not-allowed" : "pointer",
                boxShadow: saving
                  ? "none"
                  : "0 4px 12px rgba(255,107,107,0.25)",
              }}
            >
              {saving ? (
                <Loader2
                  size={14}
                  style={{ animation: "spin 1s linear infinite" }}
                />
              ) : (
                <CheckCircle size={14} />
              )}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── CSV export ────────────────────────────────────────────────────
function exportCSV(rows) {
  const headers = [
    "Name",
    "Phone",
    "Email",
    "Type",
    "Source",
    "Listing",
    "Status",
    "Message",
    "Date",
  ];
  const escape = (v) => `"${String(v || "").replace(/"/g, '""')}"`;
  const lines = [
    headers.join(","),
    ...rows.map((e) =>
      [
        fullName(e),
        e.phone,
        e.email || "",
        e.inquiry_type || "General",
        e.source || "website",
        e.listing_type || "general",
        e.status,
        e.message,
        fmtDate(e.createdAt || e.created_at),
      ]
        .map(escape)
        .join(","),
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Main page ─────────────────────────────────────────────────────
export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [newCount, setNewCount] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(null);

  // Bulk select
  const [checked, setChecked] = useState(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  const fetchData = useCallback(
    async (p = page, status = filterStatus, q = search, pp = perPage) => {
      setLoading(true);
      try {
        const params = { page: p, perPage: pp };
        if (status) params.status = status;
        if (q) params.q = q;
        const res = await enquiriesApi.adminGetAll(params);
        setEnquiries(res.data || []);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);
        setPage(p);
        setNewCount(
          res.newCount ??
            (res.data || []).filter((e) => e.status === "new").length,
        );
      } catch (err) {
        toast.error(err.message || "Failed to load enquiries");
      } finally {
        setLoading(false);
        setChecked(new Set());
      }
    },
    [page, filterStatus, search, perPage],
  );

  useEffect(() => {
    fetchData(1, filterStatus, search, perPage);
  }, [filterStatus]);

  useEffect(() => {
    fetchData(1);
  }, []);

  // Search debounce
  const searchTimer = useRef(null);
  const handleSearch = (v) => {
    setSearch(v);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(
      () => fetchData(1, filterStatus, v, perPage),
      400,
    );
  };

  // ── perPage change ────────────────────────────────────────────
  const handlePerPage = (n) => {
    setPerPage(n);
    fetchData(1, filterStatus, search, n);
  };

  // ── Delete ────────────────────────────────────────────────────
  const handleDelete = async (enquiry) => {
    if (
      !confirm(`Delete enquiry from ${enquiry.first_name}? Cannot be undone.`)
    )
      return;
    setDeleting(getId(enquiry));
    try {
      await enquiriesApi.delete(getId(enquiry));
      toast.success("Enquiry deleted");
      fetchData(page, filterStatus, search, perPage);
    } catch (err) {
      toast.error(err.message || "Delete failed");
    } finally {
      setDeleting(null);
    }
  };

  // ── Bulk select ───────────────────────────────────────────────
  const allIds = enquiries.map(getId);
  const allChecked = allIds.length > 0 && allIds.every((id) => checked.has(id));
  const someChecked = checked.size > 0;

  const toggleAll = () => {
    if (allChecked) setChecked(new Set());
    else setChecked(new Set(allIds));
  };
  const toggleOne = (id) => {
    const next = new Set(checked);
    next.has(id) ? next.delete(id) : next.add(id);
    setChecked(next);
  };

  // ── Bulk mark as read ─────────────────────────────────────────
  const handleBulkRead = async () => {
    if (!checked.size) return;
    setBulkLoading(true);
    try {
      await Promise.all(
        [...checked].map((id) => enquiriesApi.update(id, { status: "read" })),
      );
      toast.success(`${checked.size} enquiries marked as read`);
      fetchData(page, filterStatus, search, perPage);
    } catch {
      toast.error("Bulk update failed");
    } finally {
      setBulkLoading(false);
    }
  };

  // ── Bulk export CSV ───────────────────────────────────────────
  const handleExportSelected = () => {
    const rows = checked.size
      ? enquiries.filter((e) => checked.has(getId(e)))
      : enquiries;
    exportCSV(rows);
    toast.success(`Exported ${rows.length} rows`);
  };

  return (
    <AdminShell newEnquiries={newCount}>
      <div style={{ padding: "2rem", maxWidth: "1300px" }}>
        {/* Page header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
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
              <MessageSquare
                size={20}
                style={{ color: "var(--color-primary, #FF6B6B)" }}
              />
              <h1
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 800,
                  fontSize: "1.5rem",
                  color: "var(--color-text, #0F172A)",
                  margin: 0,
                }}
              >
                Enquiries
              </h1>
              <span
                style={{
                  background: "var(--color-surface-3, #F1F5F9)",
                  color: "var(--color-text-secondary, #475569)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  padding: "0.2rem 0.55rem",
                  borderRadius: "9999px",
                }}
              >
                {total}
              </span>
              {newCount > 0 && (
                <span
                  style={{
                    background: "#DCFCE7",
                    color: "#16A34A",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    padding: "0.2rem 0.55rem",
                    borderRadius: "9999px",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                >
                  {newCount} new
                </span>
              )}
            </div>
            <p
              style={{
                color: "var(--color-text-muted, #94A3B8)",
                fontSize: "0.875rem",
                margin: 0,
              }}
            >
              Manage customer enquiries and leads
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap" }}>
            <button
              onClick={handleExportSelected}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1rem",
                borderRadius: "var(--radius, 0.625rem)",
                border: "1px solid var(--color-border, #E2E8F0)",
                background: "var(--color-surface, white)",
                color: "var(--color-text-secondary, #475569)",
                fontFamily: "var(--font-heading)",
                fontWeight: 600,
                fontSize: "0.8125rem",
                cursor: "pointer",
              }}
            >
              <Download size={14} /> Export{" "}
              {checked.size ? `(${checked.size})` : "CSV"}
            </button>
            <button
              onClick={() => fetchData(page, filterStatus, search, perPage)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1rem",
                borderRadius: "var(--radius, 0.625rem)",
                border: "1px solid var(--color-border, #E2E8F0)",
                background: "var(--color-surface, white)",
                color: "var(--color-text-secondary, #475569)",
                fontFamily: "var(--font-heading)",
                fontWeight: 600,
                fontSize: "0.8125rem",
                cursor: "pointer",
              }}
            >
              <RefreshCw
                size={13}
                style={{
                  animation: loading ? "spin 1s linear infinite" : "none",
                }}
              />{" "}
              Refresh
            </button>
          </div>
        </div>

        {/* Status filter tabs */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginBottom: "1.25rem",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {STATUS_OPTIONS.map((s) => {
            const active = filterStatus === s.value;
            return (
              <button
                key={s.value}
                onClick={() => {
                  setFilterStatus(s.value);
                  setPage(1);
                }}
                style={{
                  padding: "0.4rem 1rem",
                  borderRadius: "9999px",
                  border: `1px solid ${active ? s.color || "#FF6B6B" : "#E2E8F0"}`,
                  background: active ? s.bg || "#FFECEC" : "white",
                  color: active ? s.color || "#FF6B6B" : "#475569",
                  fontFamily: "var(--font-heading)",
                  fontWeight: 600,
                  fontSize: "0.8125rem",
                  cursor: "pointer",
                  transition: "all 150ms",
                }}
              >
                {s.label}
              </button>
            );
          })}

          {/* Search */}
          <div style={{ position: "relative", marginLeft: "auto" }}>
            <Search
              size={13}
              style={{
                position: "absolute",
                left: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--color-text-muted, #94A3B8)",
              }}
            />
            <input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search name, phone, email…"
              style={{
                paddingLeft: "2.25rem",
                paddingRight: "0.875rem",
                paddingTop: "0.5rem",
                paddingBottom: "0.5rem",
                borderRadius: "9999px",
                border: "1px solid var(--color-border, #E2E8F0)",
                fontSize: "0.8125rem",
                outline: "none",
                color: "var(--color-text, #0F172A)",
                width: "240px",
              }}
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  fetchData(1, filterStatus, "", perPage);
                }}
                style={{
                  position: "absolute",
                  right: "0.625rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-text-muted, #94A3B8)",
                  padding: 0,
                }}
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Bulk action bar */}
        {someChecked && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.75rem 1.25rem",
              borderRadius: "var(--radius, 0.75rem)",
              background: "#EFF6FF",
              border: "1px solid #BFDBFE",
              marginBottom: "1rem",
            }}
          >
            <span
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#1D4ED8",
              }}
            >
              {checked.size} selected
            </span>
            <button
              onClick={handleBulkRead}
              disabled={bulkLoading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
                padding: "0.375rem 0.875rem",
                borderRadius: "0.5rem",
                border: "none",
                background: "#1D4ED8",
                color: "white",
                fontFamily: "var(--font-heading)",
                fontWeight: 600,
                fontSize: "0.8rem",
                cursor: "pointer",
              }}
            >
              {bulkLoading ? (
                <Loader2
                  size={12}
                  style={{ animation: "spin 1s linear infinite" }}
                />
              ) : (
                <Eye size={12} />
              )}{" "}
              Mark as Read
            </button>
            <button
              onClick={handleExportSelected}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
                padding: "0.375rem 0.875rem",
                borderRadius: "0.5rem",
                border: "1px solid #BFDBFE",
                background: "var(--color-surface, white)",
                color: "#1D4ED8",
                fontFamily: "var(--font-heading)",
                fontWeight: 600,
                fontSize: "0.8rem",
                cursor: "pointer",
              }}
            >
              <Download size={12} /> Export Selected
            </button>
            <button
              onClick={() => setChecked(new Set())}
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--color-text-secondary, #64748B)",
              }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Table */}
        <div
          style={{
            background: "var(--color-surface, white)",
            borderRadius: "var(--radius-lg, 1rem)",
            border: "1px solid var(--color-border, #E2E8F0)",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          {loading ? (
            <div style={{ padding: "4rem", textAlign: "center" }}>
              <Loader2
                size={28}
                style={{
                  color: "var(--color-primary, #FF6B6B)",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto 0.75rem",
                  display: "block",
                }}
              />
              <p
                style={{
                  color: "var(--color-text-muted, #94A3B8)",
                  margin: 0,
                  fontSize: "0.875rem",
                }}
              >
                Loading enquiries…
              </p>
            </div>
          ) : enquiries.length === 0 ? (
            <div style={{ padding: "4rem", textAlign: "center" }}>
              <MessageSquare
                size={36}
                style={{
                  margin: "0 auto 1rem",
                  opacity: 0.2,
                  display: "block",
                }}
              />
              <p
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 700,
                  color: "var(--color-text-secondary, #475569)",
                  margin: "0 0 0.25rem",
                }}
              >
                No enquiries found
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.875rem",
                  color: "var(--color-text-muted, #94A3B8)",
                }}
              >
                Try a different filter
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px solid #F1F5F9",
                      background: "var(--color-surface-2, #F8FAFC)",
                    }}
                  >
                    <th
                      style={{ padding: "0.75rem 0.875rem", width: "2.5rem" }}
                    >
                      <button
                        onClick={toggleAll}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: allChecked ? "#3B82F6" : "#CBD5E1",
                          display: "flex",
                        }}
                      >
                        {allChecked ? (
                          <CheckSquare size={16} />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                    </th>
                    {[
                      "Customer",
                      "Contact",
                      "Type",
                      "Listing",
                      "Source",
                      "Status",
                      "Date",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "0.75rem 1rem",
                          textAlign: "left",
                          fontSize: "0.68rem",
                          fontFamily: "var(--font-heading)",
                          fontWeight: 700,
                          color: "var(--color-text-muted, #94A3B8)",
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
                  {enquiries.map((e) => {
                    const id = getId(e);
                    const name = fullName(e);
                    const isNew = e.status === "new";
                    return (
                      <tr
                        key={id}
                        style={{
                          borderBottom: "1px solid #F8FAFC",
                          background: checked.has(id)
                            ? "#EFF6FF"
                            : isNew
                              ? "rgba(220,252,231,0.3)"
                              : "transparent",
                          transition: "background 100ms",
                        }}
                        onMouseEnter={(el) => {
                          if (!checked.has(id))
                            el.currentTarget.style.background = "#FAFBFF";
                        }}
                        onMouseLeave={(el) => {
                          el.currentTarget.style.background = checked.has(id)
                            ? "#EFF6FF"
                            : isNew
                              ? "rgba(220,252,231,0.3)"
                              : "transparent";
                        }}
                      >
                        <td style={{ padding: "0.875rem 0.875rem" }}>
                          <button
                            onClick={() => toggleOne(id)}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              color: checked.has(id) ? "#3B82F6" : "#CBD5E1",
                              display: "flex",
                            }}
                          >
                            {checked.has(id) ? (
                              <CheckSquare size={15} />
                            ) : (
                              <Square size={15} />
                            )}
                          </button>
                        </td>
                        <td style={{ padding: "0.875rem 1rem" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.625rem",
                            }}
                          >
                            <div
                              style={{
                                width: "1.875rem",
                                height: "1.875rem",
                                borderRadius: "50%",
                                background:
                                  "linear-gradient(135deg, #FF6B6B, #0F172A)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              <span
                                style={{
                                  color: "white",
                                  fontSize: "0.7rem",
                                  fontWeight: 700,
                                }}
                              >
                                {name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p
                                style={{
                                  fontFamily: "var(--font-heading)",
                                  fontWeight: 600,
                                  fontSize: "0.875rem",
                                  color: "var(--color-text, #0F172A)",
                                  margin: 0,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {name}
                              </p>
                              {isNew && (
                                <span
                                  style={{
                                    fontSize: "0.65rem",
                                    fontWeight: 700,
                                    color: "#16A34A",
                                    background: "#DCFCE7",
                                    padding: "0 0.4rem",
                                    borderRadius: "9999px",
                                  }}
                                >
                                  NEW
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "0.875rem 1rem" }}>
                          <p
                            style={{
                              fontSize: "0.8125rem",
                              color: "var(--color-text, #0F172A)",
                              margin: 0,
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {e.phone}
                          </p>
                          {e.email && (
                            <p
                              style={{
                                fontSize: "0.75rem",
                                color: "var(--color-text-muted, #94A3B8)",
                                margin: 0,
                                maxWidth: "160px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {e.email}
                            </p>
                          )}
                        </td>
                        <td style={{ padding: "0.875rem 1rem" }}>
                          <span
                            style={{
                              fontSize: "0.8125rem",
                              color: "var(--color-text-secondary, #475569)",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {e.inquiry_type || "General"}
                          </span>
                        </td>
                        <td style={{ padding: "0.875rem 1rem" }}>
                          <ListingBadge type={e.listing_type} />
                        </td>
                        <td style={{ padding: "0.875rem 1rem" }}>
                          <span
                            style={{
                              fontSize: "0.8rem",
                              color: "var(--color-text-secondary, #64748B)",
                              textTransform: "capitalize",
                            }}
                          >
                            {(e.source || "website").replace(/_/g, " ")}
                          </span>
                        </td>
                        <td style={{ padding: "0.875rem 1rem" }}>
                          <StatusBadge status={e.status} />
                        </td>
                        <td style={{ padding: "0.875rem 1rem" }}>
                          <span
                            style={{
                              fontSize: "0.8rem",
                              color: "var(--color-text-muted, #94A3B8)",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {fmtDate(e.createdAt || e.created_at)}
                          </span>
                        </td>
                        <td style={{ padding: "0.875rem 1rem" }}>
                          <div style={{ display: "flex", gap: "0.375rem" }}>
                            <button
                              onClick={() => setSelected(e)}
                              title="View"
                              style={{
                                background: "var(--color-surface-2, #F8FAFC)",
                                color: "var(--color-text-secondary, #475569)",
                                border:
                                  "1px solid var(--color-border, #E2E8F0)",
                                cursor: "pointer",
                                padding: "0.4rem",
                                borderRadius: "0.375rem",
                                display: "inline-flex",
                              }}
                            >
                              <Eye size={13} />
                            </button>
                            <a
                              href={buildWhatsAppLink(
                                e.phone,
                                `Hello ${e.first_name}, thank you for your enquiry. `,
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="WhatsApp"
                              style={{
                                background: "#F0FFF4",
                                color: "#16A34A",
                                border: "1px solid #BBF7D0",
                                padding: "0.4rem",
                                borderRadius: "0.375rem",
                                display: "inline-flex",
                                textDecoration: "none",
                              }}
                            >
                              <MessageCircle size={13} />
                            </a>
                            <button
                              onClick={() => handleDelete(e)}
                              disabled={deleting === id}
                              title="Delete"
                              style={{
                                background: "#FFF5F5",
                                color: "#EF4444",
                                border: "1px solid #FCA5A5",
                                cursor: "pointer",
                                padding: "0.4rem",
                                borderRadius: "0.375rem",
                                display: "inline-flex",
                              }}
                            >
                              {deleting === id ? (
                                <Loader2
                                  size={13}
                                  style={{
                                    animation: "spin 1s linear infinite",
                                  }}
                                />
                              ) : (
                                <Trash2 size={13} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
          onPage={(p) => fetchData(p, filterStatus, search, perPage)}
          onPerPage={handlePerPage}
          label="enquiries"
        />
      </div>

      {selected && (
        <EnquiryModal
          enquiry={selected}
          onClose={() => setSelected(null)}
          onUpdate={() => fetchData(page, filterStatus, search, perPage)}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AdminShell>
  );
}
