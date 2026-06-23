"use client";

import { useState, useEffect, useCallback } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { aboutApi } from "@/lib/api";
import { toast } from "sonner";
import {
  Save,
  Plus,
  Trash2,
  Loader2,
  Info,
  User,
  Target,
  Star,
  CheckCircle,
  BarChart2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";

// ── Style constants ───────────────────────────────────────────────
const S = {
  input: {
    width: "100%",
    padding: "0.625rem 0.875rem",
    borderRadius: "var(--radius, 0.625rem)",
    border: "1px solid var(--color-border, #E2E8F0)",
    fontSize: "0.875rem",
    color: "var(--color-text, #0F172A)",
    outline: "none",
    fontFamily: "Inter, sans-serif",
    background: "var(--color-surface, white)",
    boxSizing: "border-box",
    transition: "border-color 150ms",
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
  card: {
    background: "var(--color-surface, white)",
    border: "1px solid var(--color-border, #E2E8F0)",
    borderRadius: "var(--radius-lg, 1rem)",
    padding: "1.5rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    marginBottom: "1.5rem",
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

// ── Collapsible section ───────────────────────────────────────────
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

// ── Text input row ────────────────────────────────────────────────
function Field({
  label,
  value,
  onChange,
  placeholder,
  hint,
  textarea,
  rows = 4,
}) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label style={S.label}>{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          style={{ ...S.input, resize: "vertical" }}
          onFocus={focus}
          onBlur={blur}
        />
      ) : (
        <input
          value={value}
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

// ── Repeatable item (values, why us, stats) ───────────────────────
function RepeatableList({ items, onChange, fields, addLabel }) {
  const add = () => {
    const empty = Object.fromEntries(fields.map((f) => [f.key, ""]));
    onChange([...items, empty]);
  };
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i, key, val) => {
    const next = [...items];
    next[i] = { ...next[i], [key]: val };
    onChange(next);
  };

  return (
    <div>
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            background: "var(--color-surface-2, #F8FAFC)",
            border: "1px solid var(--color-border, #E2E8F0)",
            borderRadius: "var(--radius, 0.75rem)",
            padding: "1rem",
            marginBottom: "0.875rem",
            position: "relative",
          }}
        >
          <button
            onClick={() => remove(i)}
            style={{
              position: "absolute",
              top: "0.75rem",
              right: "0.75rem",
              background: "#FEF2F2",
              border: "1px solid #FCA5A5",
              borderRadius: "0.375rem",
              padding: "0.25rem 0.5rem",
              cursor: "pointer",
              color: "#EF4444",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Trash2 size={12} />
          </button>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: fields.length > 1 ? "1fr 2fr" : "1fr",
              gap: "0.75rem",
              paddingRight: "2.5rem",
            }}
          >
            {fields.map((f) => (
              <div key={f.key}>
                <label style={{ ...S.label, marginBottom: "0.25rem" }}>
                  {f.label}
                </label>
                {f.textarea ? (
                  <textarea
                    value={item[f.key] || ""}
                    onChange={(e) => update(i, f.key, e.target.value)}
                    placeholder={f.placeholder}
                    rows={3}
                    style={{ ...S.input, resize: "vertical" }}
                    onFocus={focus}
                    onBlur={blur}
                  />
                ) : (
                  <input
                    value={item[f.key] || ""}
                    onChange={(e) => update(i, f.key, e.target.value)}
                    placeholder={f.placeholder}
                    style={S.input}
                    onFocus={focus}
                    onBlur={blur}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      <button
        onClick={add}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.375rem",
          padding: "0.5rem 1rem",
          borderRadius: "var(--radius, 0.625rem)",
          border: "1px dashed #CBD5E1",
          background: "transparent",
          color: "var(--color-text-secondary, #64748B)",
          cursor: "pointer",
          fontSize: "0.8125rem",
          fontWeight: 600,
          fontFamily: "Plus Jakarta Sans, sans-serif",
        }}
      >
        <Plus size={14} /> {addLabel}
      </button>
    </div>
  );
}

// ── Team member editor ────────────────────────────────────────────
function TeamEditor({ team, onChange }) {
  const add = () =>
    onChange([
      ...team,
      {
        name: "",
        role: "",
        bio: "",
        photo: "",
        linkedin: "",
        twitter: "",
        email: "",
      },
    ]);
  const remove = (i) => onChange(team.filter((_, idx) => idx !== i));
  const update = (i, key, val) => {
    const next = [...team];
    next[i] = { ...next[i], [key]: val };
    onChange(next);
  };

  return (
    <div>
      {team.map((member, i) => (
        <div
          key={i}
          style={{
            background: "var(--color-surface-2, #F8FAFC)",
            border: "1px solid var(--color-border, #E2E8F0)",
            borderRadius: "0.875rem",
            padding: "1.25rem",
            marginBottom: "1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "1rem",
            }}
          >
            <span
              style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 700,
                fontSize: "0.875rem",
                color: "var(--color-text, #0F172A)",
              }}
            >
              Team Member {i + 1}
            </span>
            <button
              onClick={() => remove(i)}
              style={{
                background: "#FEF2F2",
                border: "1px solid #FCA5A5",
                borderRadius: "0.375rem",
                padding: "0.25rem 0.625rem",
                cursor: "pointer",
                color: "#EF4444",
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                fontSize: "0.75rem",
              }}
            >
              <Trash2 size={11} /> Remove
            </button>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.75rem",
              marginBottom: "0.75rem",
            }}
          >
            {[
              {
                key: "name",
                label: "Full Name",
                placeholder: "e.g. Chukwuemeka Obi",
              },
              {
                key: "role",
                label: "Role / Title",
                placeholder: "e.g. Head of Sales",
              },
            ].map((f) => (
              <div key={f.key}>
                <label style={S.label}>{f.label}</label>
                <input
                  value={member[f.key] || ""}
                  onChange={(e) => update(i, f.key, e.target.value)}
                  placeholder={f.placeholder}
                  style={S.input}
                  onFocus={focus}
                  onBlur={blur}
                />
              </div>
            ))}
          </div>
          <div style={{ marginBottom: "0.75rem" }}>
            <label style={S.label}>Short Bio</label>
            <textarea
              value={member.bio || ""}
              onChange={(e) => update(i, "bio", e.target.value)}
              placeholder="Brief description of their background and expertise..."
              rows={3}
              style={{ ...S.input, resize: "vertical" }}
              onFocus={focus}
              onBlur={blur}
            />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "0.75rem",
            }}
          >
            {[
              { key: "linkedin", label: "LinkedIn URL" },
              { key: "twitter", label: "Twitter URL" },
              { key: "email", label: "Email" },
            ].map((f) => (
              <div key={f.key}>
                <label style={S.label}>{f.label}</label>
                <input
                  value={member[f.key] || ""}
                  onChange={(e) => update(i, f.key, e.target.value)}
                  placeholder={
                    f.key === "email" ? "name@company.com" : "https://..."
                  }
                  style={S.input}
                  onFocus={focus}
                  onBlur={blur}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
      <button
        onClick={add}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.375rem",
          padding: "0.5rem 1rem",
          borderRadius: "var(--radius, 0.625rem)",
          border: "1px dashed #CBD5E1",
          background: "transparent",
          color: "var(--color-text-secondary, #64748B)",
          cursor: "pointer",
          fontSize: "0.8125rem",
          fontWeight: 600,
          fontFamily: "Plus Jakarta Sans, sans-serif",
        }}
      >
        <Plus size={14} /> Add Team Member
      </button>
    </div>
  );
}

// ── Empty state defaults ──────────────────────────────────────────
const DEFAULTS = {
  headline: "",
  subheadline: "",
  story_title: "",
  story_body: "",
  founded: "",
  story_image: "",
  mission: "",
  vision: "",
  stats: [
    { value: "500+", label: "Properties Listed" },
    { value: "2,000+", label: "Happy Clients" },
    { value: "15+", label: "States Covered" },
    { value: "5+", label: "Years Experience" },
  ],
  values: [
    { title: "Transparency", description: "" },
    { title: "Trust", description: "" },
  ],
  why_us: [{ title: "", description: "" }],
  team: [],
};

// ── Main page ─────────────────────────────────────────────────────
export default function AdminAboutPage() {
  const [data, setData] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await aboutApi.get();
      const d = res?.data || {};
      setData({ ...DEFAULTS, ...d });
    } catch {
      setData(DEFAULTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const set = (key, val) => setData((p) => ({ ...p, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await aboutApi.save(data);
      toast.success("About page saved successfully");
    } catch (err) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
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
          Loading about page data...
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div style={{ padding: "2rem", maxWidth: "860px" }}>
        {/* ── Header ── */}
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
              <Info
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
                About Page
              </h1>
            </div>
            <p
              style={{
                color: "var(--color-text-muted, #94A3B8)",
                fontSize: "0.875rem",
                margin: 0,
              }}
            >
              Manage your brand story, team, values, and all about page content.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.625rem" }}>
            <a
              href="/about"
              target="_blank"
              rel="noopener noreferrer"
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
                textDecoration: "none",
              }}
            >
              <ExternalLink size={13} /> Preview
            </a>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1.25rem",
                borderRadius: "var(--radius, 0.625rem)",
                border: "none",
                background: "linear-gradient(135deg, #FF6B6B, #E85555)",
                color: "white",
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 700,
                fontSize: "0.875rem",
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? (
                <>
                  <Loader2
                    size={14}
                    style={{ animation: "spin 0.8s linear infinite" }}
                  />{" "}
                  Saving...
                </>
              ) : (
                <>
                  <Save size={14} /> Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Hero Section ── */}
        <Accordion
          icon={Info}
          title="Hero / Page Header"
          color="#FF6B6B"
          defaultOpen
        >
          <Field
            label="Page Headline"
            value={data.headline}
            onChange={(e) => set("headline", e.target.value)}
            placeholder="e.g. About NaijaRealty — Nigeria's Most Trusted Real Estate Platform"
            hint="The large heading shown in the hero banner"
          />
          <Field
            label="Subheadline"
            value={data.subheadline}
            onChange={(e) => set("subheadline", e.target.value)}
            placeholder="e.g. Building wealth, one property at a time."
          />
        </Accordion>

        {/* ── Stats ── */}
        <Accordion icon={BarChart2} title="Key Stats / Numbers" color="#38BDF8">
          <p
            style={{
              fontSize: "0.8125rem",
              color: "var(--color-text-muted, #94A3B8)",
              marginBottom: "1rem",
            }}
          >
            These appear in the banner bar below the hero. Use round numbers
            with + or % suffix.
          </p>
          <RepeatableList
            items={data.stats}
            onChange={(v) => set("stats", v)}
            fields={[
              { key: "value", label: "Value", placeholder: "e.g. 500+" },
              {
                key: "label",
                label: "Label",
                placeholder: "e.g. Properties Listed",
              },
            ]}
            addLabel="Add Stat"
          />
        </Accordion>

        {/* ── Our Story ── */}
        <Accordion icon={Info} title="Our Story" color="#F59E0B">
          <Field
            label="Section Title"
            value={data.story_title}
            onChange={(e) => set("story_title", e.target.value)}
            placeholder="Our Story"
          />
          <Field
            label="Story Body"
            value={data.story_body}
            onChange={(e) => set("story_body", e.target.value)}
            placeholder={
              "Write your brand story here. Use new lines to separate paragraphs.\n\nTell visitors how you started, your growth, and what drives you today."
            }
            textarea
            rows={8}
            hint="Use blank lines to create separate paragraphs."
          />
          <div style={S.grid2}>
            <Field
              label="Year Founded"
              value={data.founded}
              onChange={(e) => set("founded", e.target.value)}
              placeholder="e.g. 2018"
            />
            <Field
              label="Story Image URL (optional)"
              value={data.story_image}
              onChange={(e) => set("story_image", e.target.value)}
              placeholder="https://... or Cloudinary URL"
              hint="Paste image URL from Media library"
            />
          </div>
        </Accordion>

        {/* ── Mission & Vision ── */}
        <Accordion icon={Target} title="Mission & Vision" color="#22C55E">
          <Field
            label="Mission Statement"
            value={data.mission}
            onChange={(e) => set("mission", e.target.value)}
            placeholder="e.g. To empower Nigerians to own land and property through transparent, verified listings."
            textarea
            rows={3}
          />
          <Field
            label="Vision Statement"
            value={data.vision}
            onChange={(e) => set("vision", e.target.value)}
            placeholder="e.g. To become the most trusted real estate platform in West Africa."
            textarea
            rows={3}
          />
        </Accordion>

        {/* ── Core Values ── */}
        <Accordion icon={Star} title="Core Values" color="#A78BFA">
          <p
            style={{
              fontSize: "0.8125rem",
              color: "var(--color-text-muted, #94A3B8)",
              marginBottom: "1rem",
            }}
          >
            Each value appears as a card on the About page.
          </p>
          <RepeatableList
            items={data.values}
            onChange={(v) => set("values", v)}
            fields={[
              {
                key: "title",
                label: "Value Name",
                placeholder: "e.g. Transparency",
              },
              {
                key: "description",
                label: "Description",
                placeholder: "Brief explanation of this value...",
                textarea: true,
              },
            ]}
            addLabel="Add Core Value"
          />
        </Accordion>

        {/* ── Why Choose Us ── */}
        <Accordion icon={CheckCircle} title="Why Choose Us" color="#FB923C">
          <p
            style={{
              fontSize: "0.8125rem",
              color: "var(--color-text-muted, #94A3B8)",
              marginBottom: "1rem",
            }}
          >
            List your competitive advantages. Each item appears as a feature
            card.
          </p>
          <RepeatableList
            items={data.why_us}
            onChange={(v) => set("why_us", v)}
            fields={[
              {
                key: "title",
                label: "Feature Title",
                placeholder: "e.g. Verified Listings",
              },
              {
                key: "description",
                label: "Description",
                placeholder: "Why this matters to your clients...",
                textarea: true,
              },
            ]}
            addLabel="Add Feature"
          />
        </Accordion>

        {/* ── Team ── */}
        <Accordion icon={User} title="Meet the Team" color="#F472B6">
          <p
            style={{
              fontSize: "0.8125rem",
              color: "var(--color-text-muted, #94A3B8)",
              marginBottom: "1rem",
            }}
          >
            Add your team members. Leave empty to hide the Team section on the
            public page.
          </p>
          <TeamEditor team={data.team} onChange={(v) => set("team", v)} />
        </Accordion>

        {/* ── Bottom save ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            paddingTop: "0.5rem",
          }}
        >
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem 2rem",
              borderRadius: "var(--radius, 0.75rem)",
              border: "none",
              background: "linear-gradient(135deg, #FF6B6B, #E85555)",
              color: "white",
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontWeight: 700,
              fontSize: "0.9375rem",
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? (
              <>
                <Loader2
                  size={15}
                  style={{ animation: "spin 0.8s linear infinite" }}
                />{" "}
                Saving...
              </>
            ) : (
              <>
                <Save size={15} /> Save All Changes
              </>
            )}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AdminShell>
  );
}
