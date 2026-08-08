"use client";

// Split out of the blog admin page so `@tiptap/react`, `@tiptap/starter-kit`
// and the nine `@tiptap/extension-*` packages land in their own lazily-loaded
// chunk instead of the initial /admin/blog bundle. The page pulls this in via
// next/dynamic with ssr:false — a rich-text editor renders nothing meaningful
// without JS, and it only mounts once the post form modal is opened.

import { useEffect, useRef } from "react";
import { mediaApi } from "@/lib/api";
import { API_URL } from "@/config/site";
import { toast } from "sonner";
import {
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

function getImgUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_URL}/${path}`;
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
export default function RichEditor({ value, onChange }) {
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
