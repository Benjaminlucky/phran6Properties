"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { mediaApi } from "@/lib/api";
import { toast } from "sonner";
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  FolderOpen,
  Edit2,
  Check,
} from "lucide-react";

const FOLDERS = ["all", "lands", "houses", "blog", "general"];

function MediaCard({ item, onDelete, onAltSave, selected, onSelect }) {
  const [editAlt, setEditAlt] = useState(false);
  const [altText, setAltText] = useState(item.alt_text || "");
  const [saving, setSaving] = useState(false);
  const imgSrc = item.file_path || "";
  const sizeKb = (item.file_size / 1024).toFixed(1);

  const saveAlt = async () => {
    setSaving(true);
    try {
      await mediaApi.updateAlt(item.id, altText);
      toast.success("Alt text saved");
      setEditAlt(false);
      onAltSave(item.id, altText);
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        borderRadius: "0.875rem",
        border: `2px solid ${selected ? "#FF6B6B" : "#E2E8F0"}`,
        overflow: "hidden",
        background: "white",
        transition: "all 150ms",
        cursor: onSelect ? "pointer" : "default",
      }}
      onClick={() => onSelect && onSelect(item)}
      onMouseEnter={(e) => {
        if (!selected && !onSelect) return;
        e.currentTarget.style.borderColor = "#FF6B6B";
        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,107,107,0.15)";
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = "#E2E8F0";
          e.currentTarget.style.boxShadow = "none";
        }
      }}
    >
      {/* Image */}
      <div
        style={{
          aspectRatio: "4/3",
          background: "#F8FAFC",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <img
          src={imgSrc}
          alt={item.alt_text || item.filename}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
        {selected && (
          <div
            style={{
              position: "absolute",
              top: "0.5rem",
              right: "0.5rem",
              width: "1.5rem",
              height: "1.5rem",
              borderRadius: "50%",
              background: "#FF6B6B",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Check size={12} style={{ color: "white" }} />
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "0.75rem" }}>
        <p
          style={{
            fontFamily: "Plus Jakarta Sans, sans-serif",
            fontWeight: 600,
            fontSize: "0.75rem",
            color: "#0F172A",
            margin: "0 0 0.25rem",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={item.filename}
        >
          {item.filename}
        </p>
        <p
          style={{
            fontSize: "0.7rem",
            color: "#94A3B8",
            margin: "0 0 0.625rem",
          }}
        >
          {sizeKb} KB · {item.folder}
        </p>

        {/* Alt text */}
        {!onSelect &&
          (editAlt ? (
            <div style={{ display: "flex", gap: "0.375rem" }}>
              <input
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Alt text"
                style={{
                  flex: 1,
                  padding: "0.3rem 0.5rem",
                  borderRadius: "0.375rem",
                  border: "1px solid #E2E8F0",
                  fontSize: "0.75rem",
                  outline: "none",
                }}
              />
              <button
                onClick={saveAlt}
                disabled={saving}
                style={{
                  background: "#FF6B6B",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  padding: "0.3rem 0.5rem",
                  borderRadius: "0.375rem",
                  fontSize: "0.7rem",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {saving ? (
                  <Loader2
                    size={11}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                ) : (
                  <Check size={11} />
                )}
              </button>
              <button
                onClick={() => setEditAlt(false)}
                style={{
                  background: "#F1F5F9",
                  color: "#64748B",
                  border: "none",
                  cursor: "pointer",
                  padding: "0.3rem 0.5rem",
                  borderRadius: "0.375rem",
                }}
              >
                <X size={11} />
              </button>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontSize: "0.7rem",
                  color: item.alt_text ? "#475569" : "#CBD5E1",
                  fontStyle: item.alt_text ? "normal" : "italic",
                }}
              >
                {item.alt_text || "No alt text"}
              </span>
              <div style={{ display: "flex", gap: "0.25rem" }}>
                <button
                  onClick={() => setEditAlt(true)}
                  style={{
                    background: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    cursor: "pointer",
                    padding: "0.25rem",
                    borderRadius: "0.3rem",
                    color: "#64748B",
                    display: "inline-flex",
                  }}
                  title="Edit alt text"
                >
                  <Edit2 size={11} />
                </button>
                <button
                  onClick={() => onDelete(item)}
                  style={{
                    background: "#FFF5F5",
                    border: "1px solid #FCA5A5",
                    cursor: "pointer",
                    padding: "0.25rem",
                    borderRadius: "0.3rem",
                    color: "#EF4444",
                    display: "inline-flex",
                  }}
                  title="Delete"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

// ── Upload dropzone ───────────────────────────────────────────────
function UploadZone({ folder, onUploaded }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState([]);
  const inputRef = useRef(null);

  const uploadFiles = async (files) => {
    setUploading(true);
    const results = [];
    for (const file of files) {
      setProgress((p) => [...p, { name: file.name, done: false }]);
      try {
        await mediaApi.upload(file, folder);
        setProgress((p) =>
          p.map((x) => (x.name === file.name ? { ...x, done: true } : x)),
        );
        results.push(file.name);
      } catch (err) {
        toast.error(`Failed to upload ${file.name}: ${err.message}`);
      }
    }
    if (results.length) {
      toast.success(
        `${results.length} file${results.length > 1 ? "s" : ""} uploaded`,
      );
      onUploaded();
    }
    setUploading(false);
    setProgress([]);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (files.length) uploadFiles(files);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      style={{
        border: `2px dashed ${dragging ? "#FF6B6B" : "#E2E8F0"}`,
        borderRadius: "1rem",
        padding: "2rem",
        textAlign: "center",
        background: dragging ? "#FFF5F5" : "#F8FAFC",
        cursor: "pointer",
        transition: "all 150ms",
        marginBottom: "1.5rem",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const files = Array.from(e.target.files);
          if (files.length) uploadFiles(files);
        }}
      />
      {uploading ? (
        <div>
          <Loader2
            size={28}
            style={{
              color: "#FF6B6B",
              animation: "spin 1s linear infinite",
              margin: "0 auto 0.75rem",
            }}
          />
          <p
            style={{
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontWeight: 600,
              color: "#0F172A",
              margin: "0 0 0.5rem",
            }}
          >
            Uploading…
          </p>
          {progress.map((p) => (
            <p
              key={p.name}
              style={{
                fontSize: "0.8rem",
                color: p.done ? "#22C55E" : "#94A3B8",
                margin: "0.2rem 0",
              }}
            >
              {p.done ? "✓" : "…"} {p.name}
            </p>
          ))}
        </div>
      ) : (
        <>
          <Upload
            size={28}
            style={{
              color: "#CBD5E1",
              margin: "0 auto 0.75rem",
              display: "block",
            }}
          />
          <p
            style={{
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontWeight: 700,
              color: "#0F172A",
              margin: "0 0 0.25rem",
            }}
          >
            Drop images here or click to upload
          </p>
          <p style={{ fontSize: "0.8125rem", color: "#94A3B8", margin: 0 }}>
            JPEG, PNG, WebP — max 5MB each
          </p>
        </>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────
export default function MediaPage() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [folder, setFolder] = useState("all");

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, perPage: 20 };
      if (folder !== "all") params.folder = folder;
      const res = await mediaApi.getAll(params);
      setMedia(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      toast.error(err.message || "Failed to load media");
    } finally {
      setLoading(false);
    }
  }, [page, folder]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const handleDelete = async (item) => {
    if (!confirm(`Delete ${item.filename}?`)) return;
    try {
      await mediaApi.delete(item.id);
      toast.success("File deleted");
      fetch();
    } catch (err) {
      toast.error(err.message || "Delete failed");
    }
  };

  const handleAltSave = (id, alt) => {
    setMedia((m) => m.map((x) => (x.id === id ? { ...x, alt_text: alt } : x)));
  };

  return (
    <AdminShell>
      <div style={{ padding: "2rem" }}>
        {/* Header */}
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
              <ImageIcon size={20} style={{ color: "#FF6B6B" }} />
              <h1
                style={{
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 800,
                  fontSize: "1.5rem",
                  color: "#0F172A",
                  margin: 0,
                }}
              >
                Media Library
              </h1>
              <span
                style={{
                  background: "#F1F5F9",
                  color: "#475569",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  padding: "0.2rem 0.55rem",
                  borderRadius: "9999px",
                }}
              >
                {total}
              </span>
            </div>
            <p style={{ color: "#94A3B8", fontSize: "0.875rem", margin: 0 }}>
              Upload and manage property images
            </p>
          </div>
          <button
            onClick={fetch}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              borderRadius: "0.625rem",
              border: "1px solid #E2E8F0",
              background: "white",
              color: "#475569",
              fontFamily: "Plus Jakarta Sans, sans-serif",
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

        {/* Upload zone */}
        <UploadZone
          folder={folder === "all" ? "general" : folder}
          onUploaded={() => {
            setPage(1);
            fetch();
          }}
        />

        {/* Folder tabs */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginBottom: "1.25rem",
            flexWrap: "wrap",
          }}
        >
          {FOLDERS.map((f) => (
            <button
              key={f}
              onClick={() => {
                setFolder(f);
                setPage(1);
              }}
              style={{
                padding: "0.4rem 1rem",
                borderRadius: "9999px",
                border: `1px solid ${folder === f ? "#FF6B6B" : "#E2E8F0"}`,
                background: folder === f ? "#FFECEC" : "white",
                color: folder === f ? "#FF6B6B" : "#475569",
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 600,
                fontSize: "0.8125rem",
                cursor: "pointer",
                transition: "all 150ms",
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
              }}
            >
              <FolderOpen size={12} />{" "}
              {f === "all"
                ? "All Files"
                : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: "1rem",
            }}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                style={{
                  borderRadius: "0.875rem",
                  overflow: "hidden",
                  border: "1px solid #E2E8F0",
                }}
              >
                <div
                  style={{
                    aspectRatio: "4/3",
                    background:
                      "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1.5s infinite",
                  }}
                />
                <div style={{ padding: "0.75rem" }}>
                  <div
                    style={{
                      height: "0.75rem",
                      background: "#F1F5F9",
                      borderRadius: "0.25rem",
                      marginBottom: "0.4rem",
                    }}
                  />
                  <div
                    style={{
                      height: "0.625rem",
                      background: "#F1F5F9",
                      borderRadius: "0.25rem",
                      width: "60%",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : media.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem" }}>
            <ImageIcon
              size={40}
              style={{ margin: "0 auto 1rem", opacity: 0.2, display: "block" }}
            />
            <p
              style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 700,
                color: "#475569",
                margin: "0 0 0.25rem",
              }}
            >
              No files yet
            </p>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "#94A3B8" }}>
              Upload images above to get started
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: "1rem",
            }}
          >
            {media.map((item) => (
              <MediaCard
                key={item.id}
                item={item}
                onDelete={handleDelete}
                onAltSave={handleAltSave}
                selected={false}
                onSelect={null}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "1.5rem",
              flexWrap: "wrap",
              gap: "0.75rem",
            }}
          >
            <p style={{ fontSize: "0.8rem", color: "#94A3B8", margin: 0 }}>
              Page {page} of {totalPages} — {total} files
            </p>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  background: "white",
                  color: "#475569",
                  border: "1px solid #E2E8F0",
                  cursor: "pointer",
                  padding: "0.4rem 0.625rem",
                  borderRadius: "0.5rem",
                  display: "inline-flex",
                }}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  background: "white",
                  color: "#475569",
                  border: "1px solid #E2E8F0",
                  cursor: "pointer",
                  padding: "0.4rem 0.625rem",
                  borderRadius: "0.5rem",
                  display: "inline-flex",
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      `}</style>
    </AdminShell>
  );
}
