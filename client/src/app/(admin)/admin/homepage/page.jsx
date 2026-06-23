"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { popularAreasApi, partnersApi } from "@/lib/api";
import { toast } from "sonner";
import {
  MapPin,
  Building2,
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  RefreshCw,
  Eye,
  EyeOff,
  Upload,
  Link as LinkIcon,
  GripVertical,
  Image as ImageIcon,
  Globe,
  Check,
} from "lucide-react";

// ── Shared style tokens ───────────────────────────────────────────
const S = {
  page: {
    padding: "2rem",
    maxWidth: "1100px",
    fontFamily: "Inter, sans-serif",
  },
  card: {
    background: "var(--color-surface, white)",
    border: "1px solid var(--color-border, #E2E8F0)",
    borderRadius: "var(--radius-lg, 1rem)",
    padding: "1.5rem",
    marginBottom: "2rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
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
    fontFamily: "Inter, sans-serif",
  },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" },
  row: {
    display: "grid",
    gridTemplateColumns: "auto 1fr auto auto auto",
    alignItems: "center",
    gap: "0.875rem",
    padding: "0.875rem 1rem",
    borderRadius: "var(--radius, 0.75rem)",
    border: "1px solid var(--color-border, #E2E8F0)",
    marginBottom: "0.625rem",
    background: "var(--color-surface, white)",
  },
};

const focus = (e) =>
  (e.target.style.borderColor = "var(--color-primary, #FF6B6B)");
const blur = (e) =>
  (e.target.style.borderColor = "var(--color-border, #E2E8F0)");

// ── Image preview helper ──────────────────────────────────────────
function ImgPreview({ src, size = 48 }) {
  if (!src)
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "0.5rem",
          background: "var(--color-surface-3, #F1F5F9)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <ImageIcon
          size={16}
          style={{ color: "var(--color-text-muted, #94A3B8)" }}
        />
      </div>
    );
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      style={{
        width: size,
        height: size,
        borderRadius: "0.5rem",
        objectFit: "cover",
        flexShrink: 0,
        border: "1px solid var(--color-border, #E2E8F0)",
      }}
    />
  );
}

// ── Modal shell ───────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--color-surface, white)",
          borderRadius: "var(--radius-lg, 1rem)",
          padding: "1.75rem",
          width: "100%",
          maxWidth: "520px",
          boxShadow: "0 24px 48px rgba(0,0,0,0.15)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.5rem",
          }}
        >
          <h3
            style={{
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontWeight: 700,
              fontSize: "1rem",
              color: "var(--color-text, #0F172A)",
              margin: 0,
            }}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "var(--color-surface-3, #F1F5F9)",
              border: "none",
              borderRadius: "0.5rem",
              padding: "0.375rem",
              cursor: "pointer",
              color: "var(--color-text-secondary, #64748B)",
              display: "flex",
            }}
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── File upload field ─────────────────────────────────────────────
function ImageUploadField({
  label,
  currentUrl,
  fileRef,
  previewUrl,
  setPreviewUrl,
  hint,
}) {
  return (
    <div>
      <label style={S.label}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
        <ImgPreview src={previewUrl || currentUrl} size={56} />
        <div style={{ flex: 1 }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 0.875rem",
              border: "1px dashed #CBD5E1",
              borderRadius: "var(--radius, 0.625rem)",
              cursor: "pointer",
              fontSize: "0.8125rem",
              color: "var(--color-text-secondary, #64748B)",
              background: "var(--color-surface-2, #F8FAFC)",
            }}
          >
            <Upload size={14} />
            {previewUrl || currentUrl ? "Change image" : "Upload image"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: "none" }}
              ref={fileRef}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setPreviewUrl(URL.createObjectURL(f));
              }}
            />
          </label>
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
        {(previewUrl || currentUrl) && (
          <button
            type="button"
            onClick={() => {
              setPreviewUrl("");
              if (fileRef.current) fileRef.current.value = "";
            }}
            style={{
              background: "#FEE2E2",
              border: "none",
              borderRadius: "0.5rem",
              padding: "0.375rem",
              cursor: "pointer",
              color: "#EF4444",
              display: "flex",
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// POPULAR AREAS SECTION
// ════════════════════════════════════════════════════════════════
function PopularAreasSection() {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(null); // null | "create" | { ...area }
  const [deleting, setDeleting] = useState(null);

  // Form state
  const [form, setForm] = useState({
    name: "",
    location: "",
    count: "",
    link_path: "",
    sort_order: "0",
    is_active: true,
  });
  const [previewUrl, setPreviewUrl] = useState("");
  const fileRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await popularAreasApi.getAll();
      setAreas(res?.data || []);
    } catch {
      toast.error("Failed to load popular areas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setForm({
      name: "",
      location: "",
      count: "",
      link_path: "",
      sort_order: String(areas.length),
      is_active: true,
    });
    setPreviewUrl("");
    if (fileRef.current) fileRef.current.value = "";
    setModal("create");
  };

  const openEdit = (area) => {
    setForm({
      name: area.name,
      location: area.location,
      count: area.count || "",
      link_path: area.link_path || "",
      sort_order: String(area.sort_order ?? 0),
      is_active: area.is_active !== false,
    });
    setPreviewUrl("");
    if (fileRef.current) fileRef.current.value = "";
    setModal(area);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error("Name is required");
    if (!form.location.trim()) return toast.error("Location is required");

    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      // If user cleared the image entirely, send empty string
      if (fileRef.current?.files?.[0]) {
        fd.append("image", fileRef.current.files[0]);
      } else if (!previewUrl && modal !== "create" && !modal?.image_url) {
        fd.append("image_url", "");
      }

      let res;
      if (modal === "create") {
        res = await popularAreasApi.create(fd);
      } else {
        res = await popularAreasApi.update(modal._id, fd);
      }

      if (!res?.success) throw new Error(res?.message || "Failed");
      toast.success(modal === "create" ? "Area created" : "Area updated");
      setModal(null);
      load();
    } catch (err) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      const res = await popularAreasApi.delete(id);
      if (!res?.success) throw new Error(res?.message || "Failed");
      toast.success("Area deleted");
      setAreas((p) => p.filter((a) => a._id !== id));
    } catch (err) {
      toast.error(err.message || "Failed to delete");
    } finally {
      setDeleting(null);
    }
  };

  const toggleActive = async (area) => {
    try {
      const fd = new FormData();
      fd.append("is_active", String(!area.is_active));
      const res = await popularAreasApi.update(area._id, fd);
      if (!res?.success) throw new Error(res?.message);
      setAreas((p) =>
        p.map((a) =>
          a._id === area._id ? { ...a, is_active: !area.is_active } : a,
        ),
      );
    } catch (err) {
      toast.error(err.message || "Failed");
    }
  };

  return (
    <>
      <div style={S.card}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.25rem",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}
          >
            <MapPin
              size={18}
              style={{ color: "var(--color-primary, #FF6B6B)" }}
            />
            <h2
              style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 700,
                fontSize: "1rem",
                color: "var(--color-text, #0F172A)",
                margin: 0,
              }}
            >
              Popular Areas
            </h2>
            <span
              style={{
                background: "var(--color-surface-3, #F1F5F9)",
                borderRadius: "999px",
                padding: "0.15rem 0.6rem",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "var(--color-text-secondary, #64748B)",
              }}
            >
              {areas.length}
            </span>
          </div>
          <div style={{ display: "flex", gap: "0.625rem" }}>
            <button
              onClick={load}
              style={{
                background: "none",
                border: "1px solid var(--color-border, #E2E8F0)",
                borderRadius: "var(--radius, 0.625rem)",
                padding: "0.5rem",
                cursor: "pointer",
                color: "var(--color-text-secondary, #64748B)",
                display: "flex",
              }}
              title="Refresh"
            >
              <RefreshCw size={15} />
            </button>
            <button
              onClick={openCreate}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                background: "var(--color-primary, #FF6B6B)",
                color: "white",
                border: "none",
                borderRadius: "var(--radius, 0.625rem)",
                padding: "0.5rem 1rem",
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 600,
                fontSize: "0.8125rem",
                cursor: "pointer",
              }}
            >
              <Plus size={15} /> Add Area
            </button>
          </div>
        </div>

        <p
          style={{
            fontSize: "0.8125rem",
            color: "var(--color-text-secondary, #64748B)",
            marginBottom: "1.25rem",
          }}
        >
          These appear on the public homepage under &ldquo;Explore Our Most
          Popular Areas&rdquo;. Show/hide with the eye toggle. Up to 6 are
          displayed.
        </p>

        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "2rem",
            }}
          >
            <Loader2
              size={20}
              style={{
                animation: "spin 1s linear infinite",
                color: "var(--color-primary, #FF6B6B)",
              }}
            />
          </div>
        ) : areas.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "2rem",
              color: "var(--color-text-muted, #94A3B8)",
              fontSize: "0.875rem",
            }}
          >
            No areas yet. Add your first popular area.
          </div>
        ) : (
          <div>
            {areas.map((area) => (
              <div
                key={area._id}
                style={{ ...S.row, opacity: area.is_active ? 1 : 0.55 }}
              >
                <GripVertical
                  size={14}
                  style={{ color: "#CBD5E1", cursor: "grab" }}
                />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    minWidth: 0,
                  }}
                >
                  <ImgPreview src={area.image_url} size={44} />
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        fontFamily: "Plus Jakarta Sans, sans-serif",
                        fontWeight: 700,
                        fontSize: "0.875rem",
                        color: "var(--color-text, #0F172A)",
                        margin: 0,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {area.name}
                    </p>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--color-text-secondary, #64748B)",
                        margin: 0,
                      }}
                    >
                      {area.location}
                      {area.count ? ` · ${area.count}` : ""}
                    </p>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    padding: "0.2rem 0.6rem",
                    borderRadius: "999px",
                    background: area.is_active ? "#DCFCE7" : "#F1F5F9",
                    color: area.is_active ? "#16A34A" : "#94A3B8",
                  }}
                >
                  {area.is_active ? "Active" : "Hidden"}
                </span>
                <button
                  onClick={() => toggleActive(area)}
                  style={{
                    background: "none",
                    border: "1px solid var(--color-border, #E2E8F0)",
                    borderRadius: "0.5rem",
                    padding: "0.375rem",
                    cursor: "pointer",
                    color: "var(--color-text-secondary, #64748B)",
                    display: "flex",
                  }}
                  title={area.is_active ? "Hide" : "Show"}
                >
                  {area.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <div style={{ display: "flex", gap: "0.375rem" }}>
                  <button
                    onClick={() => openEdit(area)}
                    style={{
                      background: "var(--color-surface-3, #F1F5F9)",
                      border: "none",
                      borderRadius: "0.5rem",
                      padding: "0.375rem 0.625rem",
                      cursor: "pointer",
                      color: "var(--color-text-secondary, #475569)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                    }}
                  >
                    <Edit2 size={13} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(area._id)}
                    disabled={deleting === area._id}
                    style={{
                      background: "#FEE2E2",
                      border: "none",
                      borderRadius: "0.5rem",
                      padding: "0.375rem 0.625rem",
                      cursor: "pointer",
                      color: "#EF4444",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      opacity: deleting === area._id ? 0.6 : 1,
                    }}
                  >
                    {deleting === area._id ? (
                      <Loader2
                        size={13}
                        style={{ animation: "spin 1s linear infinite" }}
                      />
                    ) : (
                      <Trash2 size={13} />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal !== null && (
        <Modal
          title={modal === "create" ? "Add Popular Area" : "Edit Popular Area"}
          onClose={() => setModal(null)}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div style={S.grid2}>
              <div>
                <label style={S.label}>Area Name *</label>
                <input
                  style={S.input}
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="e.g. Lekki Phase 1"
                  onFocus={focus}
                  onBlur={blur}
                />
              </div>
              <div>
                <label style={S.label}>City / State *</label>
                <input
                  style={S.input}
                  value={form.location}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, location: e.target.value }))
                  }
                  placeholder="e.g. Lagos"
                  onFocus={focus}
                  onBlur={blur}
                />
              </div>
            </div>

            <div style={S.grid2}>
              <div>
                <label style={S.label}>Property Count Label</label>
                <input
                  style={S.input}
                  value={form.count}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, count: e.target.value }))
                  }
                  placeholder="e.g. 24 Properties"
                  onFocus={focus}
                  onBlur={blur}
                />
              </div>
              <div>
                <label style={S.label}>Sort Order</label>
                <input
                  type="number"
                  style={S.input}
                  value={form.sort_order}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, sort_order: e.target.value }))
                  }
                  min="0"
                  onFocus={focus}
                  onBlur={blur}
                />
              </div>
            </div>

            <div>
              <label style={S.label}>Custom Link Path (optional)</label>
              <div style={{ position: "relative" }}>
                <LinkIcon
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
                  style={{ ...S.input, paddingLeft: "2.25rem" }}
                  value={form.link_path}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, link_path: e.target.value }))
                  }
                  placeholder="/lands?location=Lekki+Phase+1"
                  onFocus={focus}
                  onBlur={blur}
                />
              </div>
              <p
                style={{
                  fontSize: "0.7rem",
                  color: "var(--color-text-muted, #94A3B8)",
                  marginTop: "0.25rem",
                }}
              >
                Leave blank to auto-generate from the area name.
              </p>
            </div>

            <ImageUploadField
              label="Area Image"
              currentUrl={modal !== "create" ? modal.image_url : ""}
              fileRef={fileRef}
              previewUrl={previewUrl}
              setPreviewUrl={setPreviewUrl}
              hint="JPG, PNG or WebP. Displayed as a 256×256 card background."
            />

            <div
              style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}
            >
              <button
                type="button"
                onClick={() =>
                  setForm((p) => ({ ...p, is_active: !p.is_active }))
                }
                style={{
                  width: "2.25rem",
                  height: "1.25rem",
                  borderRadius: "999px",
                  border: "none",
                  background: form.is_active ? "#FF6B6B" : "#E2E8F0",
                  cursor: "pointer",
                  position: "relative",
                  transition: "background 200ms",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: "2px",
                    left: form.is_active ? "calc(100% - 1.05rem)" : "2px",
                    width: "1rem",
                    height: "1rem",
                    borderRadius: "50%",
                    background: "var(--color-surface, white)",
                    transition: "left 200ms",
                    display: "block",
                  }}
                />
              </button>
              <label
                style={{
                  fontSize: "0.875rem",
                  color: "var(--color-text-secondary, #475569)",
                  cursor: "pointer",
                }}
                onClick={() =>
                  setForm((p) => ({ ...p, is_active: !p.is_active }))
                }
              >
                {form.is_active
                  ? "Visible on homepage"
                  : "Hidden from homepage"}
              </label>
            </div>

            <div
              style={{ display: "flex", gap: "0.625rem", marginTop: "0.5rem" }}
            >
              <button
                onClick={() => setModal(null)}
                style={{
                  flex: 1,
                  padding: "0.625rem",
                  borderRadius: "var(--radius, 0.625rem)",
                  border: "1px solid var(--color-border, #E2E8F0)",
                  background: "var(--color-surface, white)",
                  color: "var(--color-text-secondary, #475569)",
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: "0.625rem",
                  borderRadius: "var(--radius, 0.625rem)",
                  border: "none",
                  background: "var(--color-primary, #FF6B6B)",
                  color: "white",
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem",
                  opacity: saving ? 0.7 : 1,
                }}
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
                  <>
                    <Check size={14} />{" "}
                    {modal === "create" ? "Create Area" : "Save Changes"}
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

// ════════════════════════════════════════════════════════════════
// PARTNERS SECTION
// ════════════════════════════════════════════════════════════════
function PartnersSection() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const [form, setForm] = useState({
    name: "",
    website: "",
    sort_order: "0",
    is_active: true,
  });
  const [previewUrl, setPreviewUrl] = useState("");
  const fileRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await partnersApi.getAll();
      setPartners(res?.data || []);
    } catch {
      toast.error("Failed to load partners");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setForm({
      name: "",
      website: "",
      sort_order: String(partners.length),
      is_active: true,
    });
    setPreviewUrl("");
    if (fileRef.current) fileRef.current.value = "";
    setModal("create");
  };

  const openEdit = (partner) => {
    setForm({
      name: partner.name,
      website: partner.website || "",
      sort_order: String(partner.sort_order ?? 0),
      is_active: partner.is_active !== false,
    });
    setPreviewUrl("");
    if (fileRef.current) fileRef.current.value = "";
    setModal(partner);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error("Name is required");

    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (fileRef.current?.files?.[0]) {
        fd.append("logo", fileRef.current.files[0]);
      } else if (!previewUrl && modal !== "create" && !modal?.logo_url) {
        fd.append("logo_url", "");
      }

      let res;
      if (modal === "create") {
        res = await partnersApi.create(fd);
      } else {
        res = await partnersApi.update(modal._id, fd);
      }

      if (!res?.success) throw new Error(res?.message || "Failed");
      toast.success(modal === "create" ? "Partner created" : "Partner updated");
      setModal(null);
      load();
    } catch (err) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      const res = await partnersApi.delete(id);
      if (!res?.success) throw new Error(res?.message || "Failed");
      toast.success("Partner deleted");
      setPartners((p) => p.filter((x) => x._id !== id));
    } catch (err) {
      toast.error(err.message || "Failed to delete");
    } finally {
      setDeleting(null);
    }
  };

  const toggleActive = async (partner) => {
    try {
      const fd = new FormData();
      fd.append("is_active", String(!partner.is_active));
      const res = await partnersApi.update(partner._id, fd);
      if (!res?.success) throw new Error(res?.message);
      setPartners((p) =>
        p.map((x) =>
          x._id === partner._id ? { ...x, is_active: !partner.is_active } : x,
        ),
      );
    } catch (err) {
      toast.error(err.message || "Failed");
    }
  };

  return (
    <>
      <div style={S.card}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.25rem",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}
          >
            <Building2
              size={18}
              style={{ color: "var(--color-primary, #FF6B6B)" }}
            />
            <h2
              style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 700,
                fontSize: "1rem",
                color: "var(--color-text, #0F172A)",
                margin: 0,
              }}
            >
              Partners & Logos
            </h2>
            <span
              style={{
                background: "var(--color-surface-3, #F1F5F9)",
                borderRadius: "999px",
                padding: "0.15rem 0.6rem",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "var(--color-text-secondary, #64748B)",
              }}
            >
              {partners.length}
            </span>
          </div>
          <div style={{ display: "flex", gap: "0.625rem" }}>
            <button
              onClick={load}
              style={{
                background: "none",
                border: "1px solid var(--color-border, #E2E8F0)",
                borderRadius: "var(--radius, 0.625rem)",
                padding: "0.5rem",
                cursor: "pointer",
                color: "var(--color-text-secondary, #64748B)",
                display: "flex",
              }}
              title="Refresh"
            >
              <RefreshCw size={15} />
            </button>
            <button
              onClick={openCreate}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                background: "var(--color-primary, #FF6B6B)",
                color: "white",
                border: "none",
                borderRadius: "var(--radius, 0.625rem)",
                padding: "0.5rem 1rem",
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 600,
                fontSize: "0.8125rem",
                cursor: "pointer",
              }}
            >
              <Plus size={15} /> Add Partner
            </button>
          </div>
        </div>

        <p
          style={{
            fontSize: "0.8125rem",
            color: "var(--color-text-secondary, #64748B)",
            marginBottom: "1.25rem",
          }}
        >
          Logos displayed in the &ldquo;Our Partners&rdquo; strip on the
          homepage. Upload a logo or the company name will be displayed as text.
        </p>

        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "2rem",
            }}
          >
            <Loader2
              size={20}
              style={{
                animation: "spin 1s linear infinite",
                color: "var(--color-primary, #FF6B6B)",
              }}
            />
          </div>
        ) : partners.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "2rem",
              color: "var(--color-text-muted, #94A3B8)",
              fontSize: "0.875rem",
            }}
          >
            No partners yet. Add your first partner.
          </div>
        ) : (
          <div>
            {partners.map((partner) => (
              <div
                key={partner._id}
                style={{ ...S.row, opacity: partner.is_active ? 1 : 0.55 }}
              >
                <GripVertical
                  size={14}
                  style={{ color: "#CBD5E1", cursor: "grab" }}
                />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    minWidth: 0,
                  }}
                >
                  {partner.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={partner.logo_url}
                      alt={partner.name}
                      style={{
                        height: "32px",
                        maxWidth: "100px",
                        objectFit: "contain",
                        borderRadius: "0.375rem",
                        background: "var(--color-surface-2, #F8FAFC)",
                        padding: "2px",
                        border: "1px solid var(--color-border, #E2E8F0)",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        height: "32px",
                        padding: "0 0.5rem",
                        background: "var(--color-surface-3, #F1F5F9)",
                        borderRadius: "0.375rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: "var(--color-text-secondary, #475569)",
                        fontFamily: "Plus Jakarta Sans, sans-serif",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {partner.name}
                    </div>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        fontFamily: "Plus Jakarta Sans, sans-serif",
                        fontWeight: 700,
                        fontSize: "0.875rem",
                        color: "var(--color-text, #0F172A)",
                        margin: 0,
                      }}
                    >
                      {partner.name}
                    </p>
                    {partner.website && (
                      <p
                        style={{
                          fontSize: "0.7rem",
                          color: "var(--color-text-muted, #94A3B8)",
                          margin: 0,
                          display: "flex",
                          alignItems: "center",
                          gap: "0.2rem",
                        }}
                      >
                        <Globe size={10} /> {partner.website}
                      </p>
                    )}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    padding: "0.2rem 0.6rem",
                    borderRadius: "999px",
                    background: partner.is_active ? "#DCFCE7" : "#F1F5F9",
                    color: partner.is_active ? "#16A34A" : "#94A3B8",
                  }}
                >
                  {partner.is_active ? "Active" : "Hidden"}
                </span>
                <button
                  onClick={() => toggleActive(partner)}
                  style={{
                    background: "none",
                    border: "1px solid var(--color-border, #E2E8F0)",
                    borderRadius: "0.5rem",
                    padding: "0.375rem",
                    cursor: "pointer",
                    color: "var(--color-text-secondary, #64748B)",
                    display: "flex",
                  }}
                  title={partner.is_active ? "Hide" : "Show"}
                >
                  {partner.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <div style={{ display: "flex", gap: "0.375rem" }}>
                  <button
                    onClick={() => openEdit(partner)}
                    style={{
                      background: "var(--color-surface-3, #F1F5F9)",
                      border: "none",
                      borderRadius: "0.5rem",
                      padding: "0.375rem 0.625rem",
                      cursor: "pointer",
                      color: "var(--color-text-secondary, #475569)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                    }}
                  >
                    <Edit2 size={13} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(partner._id)}
                    disabled={deleting === partner._id}
                    style={{
                      background: "#FEE2E2",
                      border: "none",
                      borderRadius: "0.5rem",
                      padding: "0.375rem 0.625rem",
                      cursor: "pointer",
                      color: "#EF4444",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      opacity: deleting === partner._id ? 0.6 : 1,
                    }}
                  >
                    {deleting === partner._id ? (
                      <Loader2
                        size={13}
                        style={{ animation: "spin 1s linear infinite" }}
                      />
                    ) : (
                      <Trash2 size={13} />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal !== null && (
        <Modal
          title={modal === "create" ? "Add Partner" : "Edit Partner"}
          onClose={() => setModal(null)}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div style={S.grid2}>
              <div>
                <label style={S.label}>Company Name *</label>
                <input
                  style={S.input}
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="e.g. Veritasi Homes"
                  onFocus={focus}
                  onBlur={blur}
                />
              </div>
              <div>
                <label style={S.label}>Sort Order</label>
                <input
                  type="number"
                  style={S.input}
                  value={form.sort_order}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, sort_order: e.target.value }))
                  }
                  min="0"
                  onFocus={focus}
                  onBlur={blur}
                />
              </div>
            </div>

            <div>
              <label style={S.label}>Website URL (optional)</label>
              <div style={{ position: "relative" }}>
                <Globe
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
                  style={{ ...S.input, paddingLeft: "2.25rem" }}
                  value={form.website}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, website: e.target.value }))
                  }
                  placeholder="https://example.com"
                  onFocus={focus}
                  onBlur={blur}
                />
              </div>
            </div>

            <ImageUploadField
              label="Logo Image"
              currentUrl={modal !== "create" ? modal.logo_url : ""}
              fileRef={fileRef}
              previewUrl={previewUrl}
              setPreviewUrl={setPreviewUrl}
              hint="PNG with transparent background recommended. Displayed at 120×40px."
            />

            <div
              style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}
            >
              <button
                type="button"
                onClick={() =>
                  setForm((p) => ({ ...p, is_active: !p.is_active }))
                }
                style={{
                  width: "2.25rem",
                  height: "1.25rem",
                  borderRadius: "999px",
                  border: "none",
                  background: form.is_active ? "#FF6B6B" : "#E2E8F0",
                  cursor: "pointer",
                  position: "relative",
                  transition: "background 200ms",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: "2px",
                    left: form.is_active ? "calc(100% - 1.05rem)" : "2px",
                    width: "1rem",
                    height: "1rem",
                    borderRadius: "50%",
                    background: "var(--color-surface, white)",
                    transition: "left 200ms",
                    display: "block",
                  }}
                />
              </button>
              <label
                style={{
                  fontSize: "0.875rem",
                  color: "var(--color-text-secondary, #475569)",
                  cursor: "pointer",
                }}
                onClick={() =>
                  setForm((p) => ({ ...p, is_active: !p.is_active }))
                }
              >
                {form.is_active
                  ? "Visible on homepage"
                  : "Hidden from homepage"}
              </label>
            </div>

            <div
              style={{ display: "flex", gap: "0.625rem", marginTop: "0.5rem" }}
            >
              <button
                onClick={() => setModal(null)}
                style={{
                  flex: 1,
                  padding: "0.625rem",
                  borderRadius: "var(--radius, 0.625rem)",
                  border: "1px solid var(--color-border, #E2E8F0)",
                  background: "var(--color-surface, white)",
                  color: "var(--color-text-secondary, #475569)",
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: "0.625rem",
                  borderRadius: "var(--radius, 0.625rem)",
                  border: "none",
                  background: "var(--color-primary, #FF6B6B)",
                  color: "white",
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem",
                  opacity: saving ? 0.7 : 1,
                }}
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
                  <>
                    <Check size={14} />{" "}
                    {modal === "create" ? "Add Partner" : "Save Changes"}
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

// ════════════════════════════════════════════════════════════════
// PAGE
// ════════════════════════════════════════════════════════════════
export default function HomepagePage() {
  return (
    <AdminShell>
      <div style={S.page}>
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1
            style={{
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontWeight: 800,
              fontSize: "1.5rem",
              color: "var(--color-text, #0F172A)",
              marginBottom: "0.375rem",
            }}
          >
            Homepage Content
          </h1>
          <p
            style={{
              color: "var(--color-text-secondary, #64748B)",
              fontSize: "0.9rem",
            }}
          >
            Manage Popular Areas and Partner logos displayed on the public
            homepage.
          </p>
        </div>

        <PopularAreasSection />
        <PartnersSection />
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AdminShell>
  );
}
