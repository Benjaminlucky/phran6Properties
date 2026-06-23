"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { blogApi, mediaApi } from "@/lib/api";
import { API_URL } from "@/config/site";
import { toast } from "sonner";
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  RefreshCw,
  Loader2,
  Upload,
  Eye,
  EyeOff,
  Tag,
  FileText,
  Globe,
  Clock,
  BarChart2,
  FolderPlus,
  Check,
  Bold,
  Italic,
  Underline,
  Link2,
  Image as ImageIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading2,
  Heading3,
  Quote,
  Code,
  Highlighter,
  Minus,
  RotateCcw,
  RotateCw,
  Strikethrough,
} from "lucide-react";
import Pagination from "@/components/admin/Pagination";

// ── TipTap ────────────────────────────────────────────────────────
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TipTapImage from "@tiptap/extension-image";
import TipTapLink from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import UnderlineExt from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";

// ── Helpers ───────────────────────────────────────────────────────
function getImgUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_URL}/${path}`;
}

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

function calcReadingTime(html) {
  const text = html?.replace(/<[^>]*>/g, "") || "";
  return Math.max(1, Math.ceil(text.split(/\s+/).filter(Boolean).length / 200));
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ── Status badge ──────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    published: ["#dcfce7", "#15803d"],
    draft: ["#f1f5f9", "#475569"],
  };
  const [bg, color] = map[status] || map.draft;
  return (
    <span
      style={{
        background: bg,
        color,
        fontSize: "0.7rem",
        fontWeight: 700,
        padding: "0.2rem 0.6rem",
        borderRadius: "9999px",
        textTransform: "capitalize",
      }}
    >
      {status}
    </span>
  );
}

// ── Image upload ──────────────────────────────────────────────────
function ImageUpload({ label, value, onChange, folder = "blog" }) {
  const [uploading, setUploading] = useState(false);
  const ref = useRef(null);
  const url = getImgUrl(value);
  const upload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await mediaApi.upload(file, folder);
      if (res?.data?.file_path) onChange(res.data.file_path);
      else toast.error("Upload failed");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };
  return (
    <div>
      {label && (
        <label
          style={{
            display: "block",
            fontSize: "0.8125rem",
            fontWeight: 600,
            color: "var(--color-text-secondary, #475569)",
            marginBottom: "0.375rem",
          }}
        >
          {label}
        </label>
      )}
      <div
        style={{
          border: "1px dashed #CBD5E1",
          borderRadius: "var(--radius, 0.75rem)",
          padding: "1rem",
          background: "var(--color-surface-2, #F8FAFC)",
          cursor: "pointer",
          position: "relative",
        }}
        onClick={() => ref.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.style.borderColor = "var(--color-primary, #FF6B6B)";
        }}
        onDragLeave={(e) => {
          e.currentTarget.style.borderColor = "#CBD5E1";
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.style.borderColor = "#CBD5E1";
          upload(e.dataTransfer.files[0]);
        }}
      >
        {url ? (
          <div style={{ position: "relative" }}>
            <img
              src={url}
              alt=""
              style={{
                width: "100%",
                height: "160px",
                objectFit: "cover",
                borderRadius: "0.5rem",
              }}
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              style={{
                position: "absolute",
                top: "0.5rem",
                right: "0.5rem",
                width: "1.75rem",
                height: "1.75rem",
                borderRadius: "50%",
                background: "rgba(0,0,0,0.6)",
                border: "none",
                color: "white",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
            {uploading ? (
              <Loader2
                size={24}
                style={{
                  color: "var(--color-primary, #FF6B6B)",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto",
                }}
              />
            ) : (
              <Upload
                size={24}
                style={{
                  color: "var(--color-text-muted, #94A3B8)",
                  margin: "0 auto 0.5rem",
                }}
              />
            )}
            <p
              style={{
                fontSize: "0.8125rem",
                color: "var(--color-text-secondary, #64748B)",
                margin: 0,
              }}
            >
              {uploading ? "Uploading…" : "Click or drag to upload"}
            </p>
          </div>
        )}
        <input
          ref={ref}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => upload(e.target.files?.[0])}
        />
      </div>
    </div>
  );
}

// ── TipTap Toolbar ────────────────────────────────────────────────
function ToolbarBtn({ onClick, active, disabled, title, children }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "0.375rem",
        borderRadius: "0.375rem",
        border: "none",
        background: active ? "#E2E8F0" : "transparent",
        color: active ? "#0F172A" : "#64748B",
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {children}
    </button>
  );
}

function TipTapToolbar({ editor, onImageUpload }) {
  if (!editor) return null;
  const btn = (action, label, active, icon) => (
    <ToolbarBtn onClick={action} active={active} title={label}>
      {icon}
    </ToolbarBtn>
  );
  const addLink = () => {
    const url = window.prompt("Enter URL:");
    if (url)
      editor.chain().focus().setLink({ href: url, target: "_blank" }).run();
  };
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.125rem",
        padding: "0.5rem",
        borderBottom: "1px solid #E2E8F0",
        background: "var(--color-surface-2, #F8FAFC)",
        borderRadius: "0.75rem 0.75rem 0 0",
      }}
    >
      <ToolbarBtn
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo"
      >
        <RotateCcw size={14} />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo"
      >
        <RotateCw size={14} />
      </ToolbarBtn>
      <div
        style={{ width: "1px", background: "#E2E8F0", margin: "0 0.25rem" }}
      />
      {btn(
        () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        "Heading 2",
        editor.isActive("heading", { level: 2 }),
        <Heading2 size={14} />,
      )}
      {btn(
        () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        "Heading 3",
        editor.isActive("heading", { level: 3 }),
        <Heading3 size={14} />,
      )}
      <div
        style={{ width: "1px", background: "#E2E8F0", margin: "0 0.25rem" }}
      />
      {btn(
        () => editor.chain().focus().toggleBold().run(),
        "Bold",
        editor.isActive("bold"),
        <Bold size={14} />,
      )}
      {btn(
        () => editor.chain().focus().toggleItalic().run(),
        "Italic",
        editor.isActive("italic"),
        <Italic size={14} />,
      )}
      {btn(
        () => editor.chain().focus().toggleUnderline().run(),
        "Underline",
        editor.isActive("underline"),
        <Underline size={14} />,
      )}
      {btn(
        () => editor.chain().focus().toggleStrike().run(),
        "Strikethrough",
        editor.isActive("strike"),
        <Strikethrough size={14} />,
      )}
      {btn(
        () => editor.chain().focus().toggleHighlight().run(),
        "Highlight",
        editor.isActive("highlight"),
        <Highlighter size={14} />,
      )}
      {btn(
        () => editor.chain().focus().toggleCode().run(),
        "Inline Code",
        editor.isActive("code"),
        <Code size={14} />,
      )}
      <div
        style={{ width: "1px", background: "#E2E8F0", margin: "0 0.25rem" }}
      />
      {btn(
        () => editor.chain().focus().setTextAlign("left").run(),
        "Align Left",
        editor.isActive({ textAlign: "left" }),
        <AlignLeft size={14} />,
      )}
      {btn(
        () => editor.chain().focus().setTextAlign("center").run(),
        "Align Center",
        editor.isActive({ textAlign: "center" }),
        <AlignCenter size={14} />,
      )}
      {btn(
        () => editor.chain().focus().setTextAlign("right").run(),
        "Align Right",
        editor.isActive({ textAlign: "right" }),
        <AlignRight size={14} />,
      )}
      <div
        style={{ width: "1px", background: "#E2E8F0", margin: "0 0.25rem" }}
      />
      {btn(
        () => editor.chain().focus().toggleBulletList().run(),
        "Bullet List",
        editor.isActive("bulletList"),
        <List size={14} />,
      )}
      {btn(
        () => editor.chain().focus().toggleOrderedList().run(),
        "Numbered List",
        editor.isActive("orderedList"),
        <ListOrdered size={14} />,
      )}
      {btn(
        () => editor.chain().focus().toggleBlockquote().run(),
        "Blockquote",
        editor.isActive("blockquote"),
        <Quote size={14} />,
      )}
      {btn(
        () => editor.chain().focus().setHorizontalRule().run(),
        "Divider",
        false,
        <Minus size={14} />,
      )}
      <div
        style={{ width: "1px", background: "#E2E8F0", margin: "0 0.25rem" }}
      />
      {btn(addLink, "Add Link", editor.isActive("link"), <Link2 size={14} />)}
      <ToolbarBtn onClick={onImageUpload} title="Upload Image">
        <ImageIcon size={14} />
      </ToolbarBtn>
    </div>
  );
}

// ── TipTap Editor ─────────────────────────────────────────────────
function RichEditor({ value, onChange }) {
  const imgRef = useRef(null);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      UnderlineExt,
      Highlight,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TipTapLink.configure({ openOnClick: false }),
      TipTapImage.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({ placeholder: "Write your blog post here…" }),
      CharacterCount,
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        style:
          "min-height:400px;padding:1.25rem;outline:none;font-size:0.9375rem;line-height:1.8;color:#1e293b;",
      },
    },
  });

  useEffect(() => {
    if (editor && value !== undefined && editor.getHTML() !== value) {
      editor.commands.setContent(value || "", false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value === "" || value === "<p></p>"]);

  const handleImageUpload = async (file) => {
    if (!file || !editor) return;
    try {
      const res = await mediaApi.upload(file, "blog");
      const url = res?.data?.file_path;
      if (url)
        editor
          .chain()
          .focus()
          .setImage({ src: getImgUrl(url) })
          .run();
    } catch {
      toast.error("Image upload failed");
    }
  };

  const words = editor?.storage?.characterCount?.words?.() ?? 0;
  const readTime = Math.max(1, Math.ceil(words / 200));

  return (
    <div
      style={{
        border: "1px solid var(--color-border, #E2E8F0)",
        borderRadius: "var(--radius, 0.75rem)",
        overflow: "hidden",
        background: "var(--color-surface, white)",
      }}
    >
      <TipTapToolbar
        editor={editor}
        onImageUpload={() => imgRef.current?.click()}
      />
      <EditorContent editor={editor} />
      <div
        style={{
          padding: "0.5rem 1rem",
          borderTop: "1px solid #E2E8F0",
          background: "var(--color-surface-2, #F8FAFC)",
          display: "flex",
          gap: "1.5rem",
        }}
      >
        <span
          style={{
            fontSize: "0.75rem",
            color: "var(--color-text-muted, #94A3B8)",
          }}
        >
          {words} words
        </span>
        <span
          style={{
            fontSize: "0.75rem",
            color: "var(--color-text-muted, #94A3B8)",
          }}
        >
          {readTime} min read
        </span>
      </div>
      <input
        ref={imgRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          handleImageUpload(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <style>{`
        .ProseMirror p.is-editor-empty:first-child::before { content: attr(data-placeholder); color: #94A3B8; pointer-events: none; float: left; height: 0; }
        .ProseMirror h2 { font-size: 1.375rem; font-weight: 800; margin: 1.5rem 0 0.75rem; color: #0F172A; }
        .ProseMirror h3 { font-size: 1.125rem; font-weight: 700; margin: 1.25rem 0 0.5rem; color: #0F172A; }
        .ProseMirror blockquote { border-left: 3px solid #FF6B6B; padding-left: 1rem; color: #475569; font-style: italic; margin: 1rem 0; }
        .ProseMirror code { background: #F1F5F9; padding: 0.15rem 0.4rem; border-radius: 0.25rem; font-size: 0.875em; }
        .ProseMirror ul { list-style: disc; padding-left: 1.5rem; }
        .ProseMirror ol { list-style: decimal; padding-left: 1.5rem; }
        .ProseMirror img { max-width: 100%; border-radius: 0.5rem; margin: 0.75rem 0; }
        .ProseMirror hr { border: none; border-top: 1px solid #E2E8F0; margin: 1.5rem 0; }
        .ProseMirror a { color: #FF6B6B; text-decoration: underline; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ── Delete confirm modal ──────────────────────────────────────────
function DeleteModal({ item, onConfirm, onCancel, loading }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "var(--color-surface, white)",
          borderRadius: "var(--radius-lg, 1rem)",
          padding: "2rem",
          maxWidth: "420px",
          width: "100%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{
            width: "3rem",
            height: "3rem",
            borderRadius: "50%",
            background: "#FEF2F2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1rem",
          }}
        >
          <Trash2 size={20} style={{ color: "#EF4444" }} />
        </div>
        <h3
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 700,
            fontSize: "1.125rem",
            color: "var(--color-text, #0F172A)",
            textAlign: "center",
            marginBottom: "0.5rem",
          }}
        >
          Delete Post?
        </h3>
        <p
          style={{
            color: "var(--color-text-secondary, #64748B)",
            fontSize: "0.875rem",
            textAlign: "center",
            marginBottom: "1.5rem",
          }}
        >
          &ldquo;<strong>{item?.title}</strong>&rdquo; will be permanently
          deleted.
        </p>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "0.75rem",
              borderRadius: "var(--radius, 0.625rem)",
              border: "1px solid var(--color-border, #E2E8F0)",
              background: "var(--color-surface, white)",
              fontFamily: "var(--font-heading)",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: "pointer",
              color: "var(--color-text-secondary, #475569)",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex: 1,
              padding: "0.75rem",
              borderRadius: "var(--radius, 0.625rem)",
              border: "none",
              background: "#EF4444",
              color: "white",
              fontFamily: "var(--font-heading)",
              fontWeight: 700,
              fontSize: "0.875rem",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
          >
            {loading ? (
              <Loader2
                size={15}
                style={{ animation: "spin 1s linear infinite" }}
              />
            ) : (
              <Trash2 size={15} />
            )}{" "}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Categories Modal ──────────────────────────────────────────────
function CategoriesModal({ categories, onClose, onRefresh }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [renamingId, setRenamingId] = useState(null);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await blogApi.createCategory({ name: name.trim() });
      setName("");
      toast.success("Category created");
      onRefresh();
    } catch (err) {
      toast.error(err.message || "Failed to create category");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (cat) => {
    setEditingId(cat._id || cat.id);
    setEditingName(cat.name);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleRename = async (cat) => {
    const id = cat._id || cat.id;
    if (!editingName.trim() || editingName.trim() === cat.name) {
      cancelEdit();
      return;
    }
    setRenamingId(id);
    try {
      await blogApi.updateCategory(id, { name: editingName.trim() });
      toast.success("Category renamed");
      cancelEdit();
      onRefresh();
    } catch (err) {
      toast.error(err.message || "Failed to rename");
    } finally {
      setRenamingId(null);
    }
  };

  const handleDelete = async (id, catName) => {
    if (!confirm(`Delete "${catName}"? Posts will be uncategorized.`)) return;
    setDeletingId(id);
    try {
      await blogApi.deleteCategory(id);
      toast.success("Category deleted");
      onRefresh();
    } catch (err) {
      toast.error(err.message || "Failed");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "var(--color-surface, white)",
          borderRadius: "var(--radius-lg, 1rem)",
          width: "100%",
          maxWidth: "500px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid #E2E8F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Tag size={18} style={{ color: "var(--color-primary, #FF6B6B)" }} />
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 700,
                fontSize: "1.0625rem",
                color: "var(--color-text, #0F172A)",
                margin: 0,
              }}
            >
              Blog Categories
            </h2>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "var(--color-text-muted, #94A3B8)",
                background: "var(--color-surface-3, #F1F5F9)",
                padding: "0.1rem 0.5rem",
                borderRadius: "9999px",
              }}
            >
              {categories.length}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-text-secondary, #64748B)",
              padding: "0.25rem",
            }}
          >
            <X size={18} />
          </button>
        </div>
        <div style={{ padding: "1.25rem 1.5rem" }}>
          <div style={{ marginBottom: "1.25rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "var(--color-text-secondary, #64748B)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "0.5rem",
              }}
            >
              New Category
            </label>
            <div style={{ display: "flex", gap: "0.625rem" }}>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                placeholder="e.g. Market Updates"
                style={{
                  flex: 1,
                  padding: "0.625rem 0.875rem",
                  borderRadius: "var(--radius, 0.625rem)",
                  border: "1px solid var(--color-border, #E2E8F0)",
                  fontSize: "0.875rem",
                  outline: "none",
                  color: "var(--color-text, #0F172A)",
                }}
              />
              <button
                type="button"
                onClick={handleCreate}
                disabled={saving || !name.trim()}
                style={{
                  padding: "0.625rem 1.125rem",
                  borderRadius: "var(--radius, 0.625rem)",
                  border: "none",
                  background: saving || !name.trim() ? "#E2E8F0" : "#FF6B6B",
                  color: saving || !name.trim() ? "#94A3B8" : "white",
                  fontFamily: "var(--font-heading)",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: saving || !name.trim() ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  whiteSpace: "nowrap",
                }}
              >
                {saving ? (
                  <Loader2
                    size={14}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                ) : (
                  <FolderPlus size={14} />
                )}{" "}
                Add
              </button>
            </div>
          </div>
          <div
            style={{ borderTop: "1px solid #F1F5F9", marginBottom: "1rem" }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.375rem",
              maxHeight: "320px",
              overflowY: "auto",
            }}
          >
            {categories.length === 0 && (
              <div style={{ padding: "2rem 0", textAlign: "center" }}>
                <Tag
                  size={28}
                  style={{ color: "#E2E8F0", margin: "0 auto 0.75rem" }}
                />
                <p
                  style={{
                    color: "var(--color-text-muted, #94A3B8)",
                    fontSize: "0.875rem",
                    margin: 0,
                  }}
                >
                  No categories yet — create one above
                </p>
              </div>
            )}
            {categories.map((cat) => {
              const id = cat._id || cat.id;
              const isEditing = editingId === id;
              const isRenaming = renamingId === id;
              const isDeleting = deletingId === id;
              return (
                <div
                  key={id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.625rem",
                    padding: "0.625rem 0.875rem",
                    borderRadius: "var(--radius, 0.625rem)",
                    border: `1px solid ${isEditing ? "#FF6B6B" : "#E2E8F0"}`,
                    background: isEditing
                      ? "rgba(255,107,107,0.03)"
                      : "#F8FAFC",
                    transition: "border-color 150ms",
                  }}
                >
                  {isEditing ? (
                    <>
                      <input
                        autoFocus
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRename(cat);
                          if (e.key === "Escape") cancelEdit();
                        }}
                        style={{
                          flex: 1,
                          padding: "0.25rem 0.5rem",
                          borderRadius: "0.375rem",
                          border: "1px solid #FF6B6B",
                          fontSize: "0.875rem",
                          outline: "none",
                          color: "var(--color-text, #0F172A)",
                          background: "var(--color-surface, white)",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRename(cat)}
                        disabled={isRenaming}
                        title="Save rename"
                        style={{
                          padding: "0.375rem",
                          borderRadius: "0.375rem",
                          border: "1px solid #22C55E",
                          background: "#F0FDF4",
                          color: "#16A34A",
                          cursor: "pointer",
                          display: "flex",
                          flexShrink: 0,
                        }}
                      >
                        {isRenaming ? (
                          <Loader2
                            size={13}
                            style={{ animation: "spin 1s linear infinite" }}
                          />
                        ) : (
                          <Check size={13} />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        title="Cancel"
                        style={{
                          padding: "0.375rem",
                          borderRadius: "0.375rem",
                          border: "1px solid var(--color-border, #E2E8F0)",
                          background: "var(--color-surface, white)",
                          color: "var(--color-text-secondary, #64748B)",
                          cursor: "pointer",
                          display: "flex",
                          flexShrink: 0,
                        }}
                      >
                        <X size={13} />
                      </button>
                    </>
                  ) : (
                    <>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontWeight: 600,
                            fontSize: "0.875rem",
                            color: "var(--color-text, #0F172A)",
                            margin: 0,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {cat.name}
                        </p>
                        <p
                          style={{
                            fontSize: "0.7rem",
                            color: "var(--color-text-muted, #94A3B8)",
                            margin: 0,
                          }}
                        >
                          /{cat.slug}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => startEdit(cat)}
                        title="Rename"
                        style={{
                          padding: "0.375rem",
                          borderRadius: "0.375rem",
                          border: "1px solid var(--color-border, #E2E8F0)",
                          background: "var(--color-surface, white)",
                          color: "var(--color-text-secondary, #64748B)",
                          cursor: "pointer",
                          display: "flex",
                          flexShrink: 0,
                          transition: "all 150ms",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "#94A3B8";
                          e.currentTarget.style.color = "#0F172A";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor =
                            "var(--color-border, #E2E8F0)";
                          e.currentTarget.style.color = "#64748B";
                        }}
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(id, cat.name)}
                        disabled={isDeleting}
                        title="Delete"
                        style={{
                          padding: "0.375rem",
                          borderRadius: "0.375rem",
                          border: "1px solid #FEE2E2",
                          background: "#FEF2F2",
                          color: "#EF4444",
                          cursor: "pointer",
                          display: "flex",
                          flexShrink: 0,
                        }}
                      >
                        {isDeleting ? (
                          <Loader2
                            size={13}
                            style={{ animation: "spin 1s linear infinite" }}
                          />
                        ) : (
                          <Trash2 size={13} />
                        )}
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div
          style={{
            padding: "1rem 1.5rem",
            borderTop: "1px solid #E2E8F0",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "0.5rem 1.25rem",
              borderRadius: "var(--radius, 0.625rem)",
              border: "1px solid var(--color-border, #E2E8F0)",
              background: "var(--color-surface, white)",
              fontFamily: "var(--font-heading)",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: "pointer",
              color: "var(--color-text-secondary, #475569)",
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Blog Post Form ────────────────────────────────────────────────
const EMPTY_POST = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  cover_image: "",
  category_id: "",
  status: "draft",
  reading_time: 5,
  meta_title: "",
  meta_description: "",
};

function PostForm({ post, categories, onSave, onCancel }) {
  const isEdit = !!post?._id;
  const [form, setForm] = useState(() => {
    if (!post) return EMPTY_POST;
    return {
      title: post.title || "",
      slug: post.slug || "",
      excerpt: post.excerpt || "",
      content: post.content || "",
      cover_image: post.cover_image || "",
      category_id: post.category?._id || post.category || "",
      status: post.status || "draft",
      reading_time: post.reading_time || 5,
      meta_title: post.meta_title || "",
      meta_description: post.meta_description || "",
    };
  });
  const [saving, setSaving] = useState(false);
  const [slugEdited, setSlugEdited] = useState(isEdit);
  const [tab, setTab] = useState("content");
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const handleTitle = (v) => {
    set("title", v);
    if (!slugEdited) set("slug", slugify(v));
  };
  const handleContent = (html) => {
    set("content", html);
    set("reading_time", calcReadingTime(html));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form };
      if (form.status === "published" && !form.reading_time)
        payload.reading_time = calcReadingTime(form.content);
      if (isEdit) await blogApi.update(post._id, payload);
      else await blogApi.create(payload);
      toast.success(isEdit ? "Post updated" : "Post created");
      onSave();
    } catch (err) {
      toast.error(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "0.625rem 0.875rem",
    borderRadius: "var(--radius, 0.625rem)",
    border: "1px solid var(--color-border, #E2E8F0)",
    fontSize: "0.875rem",
    color: "var(--color-text, #0F172A)",
    outline: "none",
    background: "var(--color-surface, white)",
    boxSizing: "border-box",
  };
  const labelStyle = {
    display: "block",
    fontSize: "0.8125rem",
    fontWeight: 600,
    color: "var(--color-text-secondary, #475569)",
    marginBottom: "0.375rem",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        zIndex: 999,
        overflowY: "auto",
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "var(--color-surface, white)",
          borderRadius: "1.25rem",
          maxWidth: "900px",
          margin: "0 auto",
          boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{
            padding: "1.5rem 2rem",
            borderBottom: "1px solid #E2E8F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            background: "var(--color-surface, white)",
            borderRadius: "1.25rem 1.25rem 0 0",
            zIndex: 10,
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}
          >
            <FileText
              size={18}
              style={{ color: "var(--color-primary, #FF6B6B)" }}
            />
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 800,
                fontSize: "1.125rem",
                color: "var(--color-text, #0F172A)",
                margin: 0,
              }}
            >
              {isEdit ? "Edit Post" : "New Blog Post"}
            </h2>
          </div>
          <div
            style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}
          >
            <div
              style={{
                display: "flex",
                gap: "0.375rem",
                background: "var(--color-surface-3, #F1F5F9)",
                borderRadius: "var(--radius, 0.625rem)",
                padding: "0.25rem",
              }}
            >
              {["draft", "published"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set("status", s)}
                  style={{
                    padding: "0.375rem 0.875rem",
                    borderRadius: "0.5rem",
                    border: "none",
                    background:
                      form.status === s
                        ? s === "published"
                          ? "#22C55E"
                          : "white"
                        : "transparent",
                    color:
                      form.status === s
                        ? s === "published"
                          ? "white"
                          : "#0F172A"
                        : "#64748B",
                    fontFamily: "var(--font-heading)",
                    fontWeight: 600,
                    fontSize: "0.8125rem",
                    cursor: "pointer",
                    transition: "all 150ms",
                    textTransform: "capitalize",
                  }}
                >
                  {s === "published" ? (
                    <>
                      <Globe
                        size={12}
                        style={{ display: "inline", marginRight: "0.25rem" }}
                      />
                      Publish
                    </>
                  ) : (
                    <>
                      <EyeOff
                        size={12}
                        style={{ display: "inline", marginRight: "0.25rem" }}
                      />
                      Draft
                    </>
                  )}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={onCancel}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--color-text-secondary, #64748B)",
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "flex",
              gap: "0",
              borderBottom: "1px solid #E2E8F0",
              padding: "0 2rem",
            }}
          >
            {[
              ["content", "Content", <FileText size={14} />],
              ["seo", "SEO", <Globe size={14} />],
            ].map(([t, label, icon]) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  padding: "0.875rem 1.25rem",
                  border: "none",
                  borderBottom:
                    tab === t ? "2px solid #FF6B6B" : "2px solid transparent",
                  background: "none",
                  color: tab === t ? "#FF6B6B" : "#64748B",
                  fontFamily: "var(--font-heading)",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  marginBottom: "-1px",
                }}
              >
                {icon} {label}
              </button>
            ))}
          </div>
          <div style={{ padding: "2rem" }}>
            {tab === "content" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 280px",
                  gap: "2rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.25rem",
                  }}
                >
                  <div>
                    <label style={labelStyle}>Title *</label>
                    <input
                      value={form.title}
                      onChange={(e) => handleTitle(e.target.value)}
                      placeholder="Post title…"
                      style={{
                        ...inputStyle,
                        fontSize: "1rem",
                        fontWeight: 600,
                      }}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Slug</label>
                    <div style={{ position: "relative" }}>
                      <span
                        style={{
                          position: "absolute",
                          left: "0.875rem",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "var(--color-text-muted, #94A3B8)",
                          fontSize: "0.8125rem",
                        }}
                      >
                        /blog/
                      </span>
                      <input
                        value={form.slug}
                        onChange={(e) => {
                          setSlugEdited(true);
                          set("slug", slugify(e.target.value));
                        }}
                        placeholder="auto-generated"
                        style={{ ...inputStyle, paddingLeft: "3.25rem" }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Excerpt</label>
                    <textarea
                      value={form.excerpt}
                      onChange={(e) => set("excerpt", e.target.value)}
                      rows={2}
                      placeholder="Short summary shown in listings…"
                      style={{ ...inputStyle, resize: "vertical" }}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Content *</label>
                    <RichEditor value={form.content} onChange={handleContent} />
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.25rem",
                  }}
                >
                  <ImageUpload
                    label="Cover Image"
                    value={form.cover_image}
                    onChange={(v) => set("cover_image", v)}
                    folder="blog"
                  />
                  <div>
                    <label style={labelStyle}>Category</label>
                    <select
                      value={form.category_id}
                      onChange={(e) => set("category_id", e.target.value)}
                      style={{ ...inputStyle, cursor: "pointer" }}
                    >
                      <option value="">— No Category —</option>
                      {categories.map((c) => (
                        <option key={c._id || c.id} value={c._id || c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Reading Time (min)</label>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <input
                        type="number"
                        min={1}
                        max={60}
                        value={form.reading_time}
                        onChange={(e) =>
                          set("reading_time", parseInt(e.target.value) || 1)
                        }
                        style={{ ...inputStyle, width: "80px" }}
                      />
                      <span
                        style={{
                          fontSize: "0.8125rem",
                          color: "var(--color-text-muted, #94A3B8)",
                        }}
                      >
                        min read
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {tab === "seo" && (
              <div
                style={{
                  maxWidth: "600px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.25rem",
                }}
              >
                <div
                  style={{
                    padding: "1rem",
                    borderRadius: "var(--radius, 0.75rem)",
                    background: "var(--color-surface-2, #F8FAFC)",
                    border: "1px solid var(--color-border, #E2E8F0)",
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "var(--color-text-muted, #94A3B8)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      marginBottom: "0.75rem",
                    }}
                  >
                    Google Preview
                  </p>
                  <p
                    style={{
                      fontSize: "1rem",
                      color: "#1558d6",
                      fontWeight: 500,
                      marginBottom: "0.25rem",
                      lineHeight: 1.3,
                    }}
                  >
                    {form.meta_title || form.title || "Post Title"}
                  </p>
                  <p
                    style={{
                      fontSize: "0.8125rem",
                      color: "#006621",
                      marginBottom: "0.25rem",
                    }}
                  >
                    yoursite.com/blog/{form.slug || "post-slug"}
                  </p>
                  <p
                    style={{
                      fontSize: "0.8125rem",
                      color: "#545454",
                      lineHeight: 1.5,
                    }}
                  >
                    {form.meta_description ||
                      form.excerpt ||
                      "Meta description will appear here…"}
                  </p>
                </div>
                <div>
                  <label style={labelStyle}>
                    Meta Title{" "}
                    <span
                      style={{
                        color: "var(--color-text-muted, #94A3B8)",
                        fontWeight: 400,
                      }}
                    >
                      ({(form.meta_title || "").length}/60)
                    </span>
                  </label>
                  <input
                    value={form.meta_title}
                    onChange={(e) => set("meta_title", e.target.value)}
                    maxLength={60}
                    placeholder={form.title || "SEO title…"}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>
                    Meta Description{" "}
                    <span
                      style={{
                        color: "var(--color-text-muted, #94A3B8)",
                        fontWeight: 400,
                      }}
                    >
                      ({(form.meta_description || "").length}/160)
                    </span>
                  </label>
                  <textarea
                    value={form.meta_description}
                    onChange={(e) => set("meta_description", e.target.value)}
                    rows={3}
                    maxLength={160}
                    placeholder={form.excerpt || "SEO description…"}
                    style={{ ...inputStyle, resize: "vertical" }}
                  />
                </div>
              </div>
            )}
          </div>
          <div
            style={{
              padding: "1.25rem 2rem",
              borderTop: "1px solid #E2E8F0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "var(--color-surface-2, #F8FAFC)",
              borderRadius: "0 0 1.25rem 1.25rem",
            }}
          >
            <div
              style={{
                fontSize: "0.8125rem",
                color: "var(--color-text-muted, #94A3B8)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <Clock size={13} /> {form.reading_time} min read
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                type="button"
                onClick={onCancel}
                style={{
                  padding: "0.625rem 1.25rem",
                  borderRadius: "var(--radius, 0.625rem)",
                  border: "1px solid var(--color-border, #E2E8F0)",
                  background: "var(--color-surface, white)",
                  fontFamily: "var(--font-heading)",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  color: "var(--color-text-secondary, #475569)",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: "0.625rem 1.5rem",
                  borderRadius: "var(--radius, 0.625rem)",
                  border: "none",
                  background: saving
                    ? "rgba(255,107,107,0.5)"
                    : "linear-gradient(135deg, #FF6B6B 0%, #E85555 100%)",
                  color: "white",
                  fontFamily: "var(--font-heading)",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  cursor: saving ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  boxShadow: saving
                    ? "none"
                    : "0 4px 12px rgba(255,107,107,0.3)",
                }}
              >
                {saving ? (
                  <Loader2
                    size={15}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                ) : (
                  <Check size={15} />
                )}
                {saving ? "Saving…" : isEdit ? "Update Post" : "Save Post"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function AdminBlogPage() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(12); // ← replaces const PER_PAGE = 12
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showCats, setShowCats] = useState(false);

  const loadPosts = useCallback(
    async (p = page) => {
      setLoading(true);
      try {
        const params = { page: p, perPage }; // ← uses perPage state
        if (q) params.q = q;
        if (statusFilter) params.status = statusFilter;
        const res = await blogApi.adminGetAll(params);
        setPosts(res?.data || []);
        setTotal(res?.total || 0);
        setPage(p);
      } catch {
        toast.error("Failed to load posts");
      } finally {
        setLoading(false);
      }
    },
    [page, perPage, q, statusFilter], // ← perPage in deps
  );

  const loadCategories = async () => {
    try {
      const res = await blogApi.getCategories();
      setCategories(res?.data || []);
    } catch {}
  };

  useEffect(() => {
    loadPosts(1);
  }, [q, statusFilter]);
  useEffect(() => {
    loadCategories();
  }, []);

  // ── perPage change — reset to page 1 ─────────────────────────
  const handlePerPage = (n) => {
    setPerPage(n);
    loadPosts(1);
  };

  const openCreate = () => {
    setEditing({});
    setShowForm(true);
  };
  const openEdit = async (post) => {
    try {
      const res = await blogApi.adminGetById(post._id || post.id);
      setEditing(res?.data || post);
      setShowForm(true);
    } catch {
      setEditing(post);
      setShowForm(true);
    }
  };

  const handleSave = () => {
    setShowForm(false);
    setEditing(null);
    loadPosts(1);
    loadCategories();
  };
  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await blogApi.delete(deleting._id || deleting.id);
      toast.success("Post deleted");
      setDeleting(null);
      loadPosts(1);
    } catch (err) {
      toast.error(err.message || "Delete failed");
    } finally {
      setDeleteLoading(false);
    }
  };

  const totalPages = Math.ceil(total / perPage); // ← uses perPage state

  return (
    <AdminShell>
      <div style={{ padding: "2rem", maxWidth: "1200px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
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
                gap: "0.625rem",
                marginBottom: "0.25rem",
              }}
            >
              <BookOpen
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
                Blog Posts
              </h1>
            </div>
            <p
              style={{
                color: "var(--color-text-muted, #94A3B8)",
                fontSize: "0.875rem",
                margin: 0,
              }}
            >
              {total} post{total !== 1 ? "s" : ""} total
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              onClick={() => setShowCats(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.625rem 1rem",
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
              <Tag size={14} /> Categories
            </button>
            <button
              onClick={() => loadPosts(page)}
              style={{
                padding: "0.625rem",
                borderRadius: "var(--radius, 0.625rem)",
                border: "1px solid var(--color-border, #E2E8F0)",
                background: "var(--color-surface, white)",
                cursor: "pointer",
                color: "var(--color-text-secondary, #475569)",
              }}
            >
              <RefreshCw size={15} style={{ display: "block" }} />
            </button>
            <button
              onClick={openCreate}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.625rem 1.25rem",
                borderRadius: "var(--radius, 0.625rem)",
                border: "none",
                background: "linear-gradient(135deg, #FF6B6B 0%, #E85555 100%)",
                color: "white",
                fontFamily: "var(--font-heading)",
                fontWeight: 700,
                fontSize: "0.875rem",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(255,107,107,0.3)",
              }}
            >
              <Plus size={16} /> New Post
            </button>
          </div>
        </div>

        {/* Filters */}
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            marginBottom: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          <div style={{ position: "relative", flex: "1 1 240px" }}>
            <Search
              size={14}
              style={{
                position: "absolute",
                left: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--color-text-muted, #94A3B8)",
              }}
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search posts…"
              style={{
                width: "100%",
                paddingLeft: "2.25rem",
                paddingRight: "0.875rem",
                paddingTop: "0.625rem",
                paddingBottom: "0.625rem",
                borderRadius: "var(--radius, 0.625rem)",
                border: "1px solid var(--color-border, #E2E8F0)",
                fontSize: "0.875rem",
                outline: "none",
                color: "var(--color-text, #0F172A)",
                boxSizing: "border-box",
              }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "0.625rem 0.875rem",
              borderRadius: "var(--radius, 0.625rem)",
              border: "1px solid var(--color-border, #E2E8F0)",
              fontSize: "0.875rem",
              color: "var(--color-text-secondary, #475569)",
              background: "var(--color-surface, white)",
              cursor: "pointer",
              outline: "none",
            }}
          >
            <option value="">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>

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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 140px 120px 100px 80px 80px 100px",
              padding: "0.75rem 1.25rem",
              borderBottom: "1px solid #F1F5F9",
              background: "var(--color-surface-2, #F8FAFC)",
            }}
          >
            {[
              "Title",
              "Category",
              "Author",
              "Status",
              "Views",
              "Date",
              "Actions",
            ].map((h) => (
              <span
                key={h}
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: "var(--color-text-muted, #94A3B8)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {h}
              </span>
            ))}
          </div>

          {loading ? (
            <div style={{ padding: "3rem", textAlign: "center" }}>
              <Loader2
                size={28}
                style={{
                  color: "var(--color-primary, #FF6B6B)",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto",
                }}
              />
            </div>
          ) : posts.length === 0 ? (
            <div style={{ padding: "4rem", textAlign: "center" }}>
              <BookOpen
                size={40}
                style={{ color: "#E2E8F0", margin: "0 auto 1rem" }}
              />
              <p
                style={{
                  color: "var(--color-text-muted, #94A3B8)",
                  fontFamily: "var(--font-heading)",
                  fontWeight: 600,
                }}
              >
                No posts found
              </p>
              <button
                onClick={openCreate}
                style={{
                  marginTop: "1rem",
                  padding: "0.625rem 1.25rem",
                  borderRadius: "var(--radius, 0.625rem)",
                  border: "none",
                  background: "var(--color-primary, #FF6B6B)",
                  color: "white",
                  fontFamily: "var(--font-heading)",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                }}
              >
                Create your first post
              </button>
            </div>
          ) : (
            posts.map((post, i) => (
              <div
                key={post._id || post.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 140px 120px 100px 80px 80px 100px",
                  padding: "1rem 1.25rem",
                  borderBottom:
                    i < posts.length - 1 ? "1px solid #F8FAFC" : "none",
                  alignItems: "center",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#FAFAFA")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "white")
                }
              >
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.625rem",
                    }}
                  >
                    {post.cover_image && (
                      <img
                        src={getImgUrl(post.cover_image)}
                        alt=""
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "0.375rem",
                          objectFit: "cover",
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <p
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        color: "var(--color-text, #0F172A)",
                        margin: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {post.title}
                    </p>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--color-text-secondary, #64748B)",
                  }}
                >
                  {post.category?.name || post.category || (
                    <span style={{ color: "#CBD5E1" }}>—</span>
                  )}
                </span>
                <span
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--color-text-secondary, #64748B)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {post.author_name || "—"}
                </span>
                <StatusBadge status={post.status} />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    fontSize: "0.8125rem",
                    color: "var(--color-text-secondary, #64748B)",
                  }}
                >
                  <BarChart2
                    size={12}
                    style={{ color: "var(--color-text-muted, #94A3B8)" }}
                  />{" "}
                  {post.views_count || 0}
                </div>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--color-text-muted, #94A3B8)",
                  }}
                >
                  {formatDate(post.published_at || post.createdAt)}
                </span>
                <div style={{ display: "flex", gap: "0.375rem" }}>
                  <button
                    onClick={() => openEdit(post)}
                    title="Edit"
                    style={{
                      padding: "0.4rem",
                      borderRadius: "0.375rem",
                      border: "1px solid var(--color-border, #E2E8F0)",
                      background: "var(--color-surface, white)",
                      cursor: "pointer",
                      color: "var(--color-text-secondary, #475569)",
                      display: "flex",
                    }}
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => setDeleting(post)}
                    title="Delete"
                    style={{
                      padding: "0.4rem",
                      borderRadius: "0.375rem",
                      border: "1px solid #FEE2E2",
                      background: "#FEF2F2",
                      cursor: "pointer",
                      color: "#EF4444",
                      display: "flex",
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Pagination ── */}
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          perPage={perPage}
          onPage={(p) => loadPosts(p)}
          onPerPage={handlePerPage}
          label="posts"
        />
      </div>

      {/* Modals */}
      {showForm && (
        <PostForm
          post={editing}
          categories={categories}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}
      {deleting && (
        <DeleteModal
          item={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
          loading={deleteLoading}
        />
      )}
      {showCats && (
        <CategoriesModal
          categories={categories}
          onClose={() => setShowCats(false)}
          onRefresh={loadCategories}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AdminShell>
  );
}
