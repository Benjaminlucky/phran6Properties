"use client";

import { useState, useEffect, useCallback } from "react";
import {
  UserPlus,
  Trash2,
  Edit2,
  KeyRound,
  ShieldCheck,
  Shield,
  PenLine,
  MoreVertical,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  Eye,
  EyeOff,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import AdminShell from "@/components/admin/AdminShell";
import { teamApi } from "@/lib/api";
import { useAuth } from "@/context/useAuth";

// ── Role config ───────────────────────────────────────────────
const ROLES = {
  super_admin: {
    label: "Super Admin",
    color: "#FF6B6B",
    bg: "rgba(255,107,107,0.12)",
    icon: ShieldCheck,
    desc: "Full access to everything",
  },
  admin: {
    label: "Admin",
    color: "#38BDF8",
    bg: "rgba(56,189,248,0.12)",
    icon: Shield,
    desc: "Full access except team management",
  },
  editor: {
    label: "Editor",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.12)",
    icon: PenLine,
    desc: "Blog and listings only",
  },
};

function RoleBadge({ role }) {
  const cfg = ROLES[role] || ROLES.admin;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.3rem",
        padding: "0.2rem 0.625rem",
        borderRadius: "9999px",
        background: cfg.bg,
        color: cfg.color,
        fontSize: "0.7rem",
        fontWeight: 700,
        fontFamily: "Plus Jakarta Sans, sans-serif",
        letterSpacing: "0.03em",
      }}
    >
      <cfg.icon size={10} />
      {cfg.label}
    </span>
  );
}

// ── Password strength requirements ────────────────────────────
const REQS = [
  { id: "len", label: "8+ characters", test: (p) => p.length >= 8 },
  { id: "upper", label: "Uppercase", test: (p) => /[A-Z]/.test(p) },
  { id: "lower", label: "Lowercase", test: (p) => /[a-z]/.test(p) },
  { id: "num", label: "Number", test: (p) => /[0-9]/.test(p) },
];

// ── Shared input style ────────────────────────────────────────
const inputBase = {
  width: "100%",
  padding: "0.6875rem 0.875rem",
  borderRadius: "0.625rem",
  border: "1px solid #E2E8F0",
  background: "#F8FAFC",
  color: "#0F172A",
  fontSize: "0.875rem",
  outline: "none",
  fontFamily: "Inter, sans-serif",
  boxSizing: "border-box",
  transition: "border-color 150ms, background 150ms",
};

// ── Modal shell ───────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(15,23,42,0.7)",
          backdropFilter: "blur(4px)",
        }}
      />
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "480px",
          background: "white",
          borderRadius: "1rem",
          boxShadow: "0 32px 64px rgba(0,0,0,0.2)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid #E2E8F0",
          }}
        >
          <h3
            style={{
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontWeight: 700,
              fontSize: "1rem",
              color: "#0F172A",
              margin: 0,
            }}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#94A3B8",
              padding: "0.25rem",
              borderRadius: "0.375rem",
              transition: "all 150ms",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#F1F5F9";
              e.currentTarget.style.color = "#0F172A";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none";
              e.currentTarget.style.color = "#94A3B8";
            }}
          >
            <X size={18} />
          </button>
        </div>
        <div style={{ padding: "1.5rem" }}>{children}</div>
      </div>
    </div>
  );
}

// ── Create / Edit member form ─────────────────────────────────
function MemberForm({ initial, onSave, onClose, isSelf }) {
  const [form, setForm] = useState(
    initial || {
      name: "",
      email: "",
      role: "admin",
      password: "",
      confirm: "",
    },
  );
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isEdit = !!initial;

  const pwOk = isEdit
    ? !form.password ||
      (REQS.every((r) => r.test(form.password)) &&
        form.password === form.confirm)
    : REQS.every((r) => r.test(form.password)) &&
      form.password === form.confirm;

  const canSubmit = form.name && form.email && pwOk;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError("");
    try {
      const payload = { name: form.name, email: form.email, role: form.role };
      if (!isEdit) payload.password = form.password;
      await onSave(payload, form.password, form.confirm);
      onClose();
    } catch (err) {
      setError(err.message || "Failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
    >
      {error && (
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            padding: "0.75rem",
            borderRadius: "0.625rem",
            background: "#FEF2F2",
            border: "1px solid #FCA5A5",
          }}
        >
          <AlertCircle
            size={15}
            style={{ color: "#EF4444", flexShrink: 0, marginTop: "0.1rem" }}
          />
          <p style={{ color: "#DC2626", fontSize: "0.8125rem", margin: 0 }}>
            {error}
          </p>
        </div>
      )}

      <div>
        <label
          style={{
            display: "block",
            fontFamily: "Plus Jakarta Sans, sans-serif",
            fontWeight: 600,
            fontSize: "0.75rem",
            color: "#64748B",
            marginBottom: "0.375rem",
          }}
        >
          Full Name
        </label>
        <input
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          placeholder="e.g. Amara Okafor"
          style={inputBase}
          onFocus={(e) => {
            e.target.style.borderColor = "#FF6B6B";
            e.target.style.background = "white";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#E2E8F0";
            e.target.style.background = "#F8FAFC";
          }}
        />
      </div>

      <div>
        <label
          style={{
            display: "block",
            fontFamily: "Plus Jakarta Sans, sans-serif",
            fontWeight: 600,
            fontSize: "0.75rem",
            color: "#64748B",
            marginBottom: "0.375rem",
          }}
        >
          Email Address
        </label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          placeholder="staff@yourcompany.com"
          style={inputBase}
          onFocus={(e) => {
            e.target.style.borderColor = "#FF6B6B";
            e.target.style.background = "white";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#E2E8F0";
            e.target.style.background = "#F8FAFC";
          }}
        />
      </div>

      {/* Role — hidden if editing self (can't change own role) */}
      {!isSelf && (
        <div>
          <label
            style={{
              display: "block",
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontWeight: 600,
              fontSize: "0.75rem",
              color: "#64748B",
              marginBottom: "0.375rem",
            }}
          >
            Role
          </label>
          <select
            value={form.role}
            onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
            style={{ ...inputBase, cursor: "pointer" }}
            onFocus={(e) => {
              e.target.style.borderColor = "#FF6B6B";
              e.target.style.background = "white";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#E2E8F0";
              e.target.style.background = "#F8FAFC";
            }}
          >
            {Object.entries(ROLES).map(([val, cfg]) => (
              <option key={val} value={val}>
                {cfg.label} — {cfg.desc}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Password — required for new, optional for edit */}
      {!isEdit && (
        <div>
          <label
            style={{
              display: "block",
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontWeight: 600,
              fontSize: "0.75rem",
              color: "#64748B",
              marginBottom: "0.375rem",
            }}
          >
            Password
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showPw ? "text" : "password"}
              value={form.password}
              onChange={(e) =>
                setForm((p) => ({ ...p, password: e.target.value }))
              }
              placeholder="Minimum 8 characters"
              style={{ ...inputBase, paddingRight: "2.75rem" }}
              onFocus={(e) => {
                e.target.style.borderColor = "#FF6B6B";
                e.target.style.background = "white";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#E2E8F0";
                e.target.style.background = "#F8FAFC";
              }}
            />
            <button
              type="button"
              onClick={() => setShowPw((p) => !p)}
              style={{
                position: "absolute",
                right: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#94A3B8",
              }}
            >
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {form.password && (
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                flexWrap: "wrap",
                marginTop: "0.5rem",
              }}
            >
              {REQS.map((r) => (
                <span
                  key={r.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    fontSize: "0.7rem",
                    color: r.test(form.password) ? "#16A34A" : "#94A3B8",
                  }}
                >
                  <CheckCircle
                    size={10}
                    style={{ opacity: r.test(form.password) ? 1 : 0.3 }}
                  />
                  {r.label}
                </span>
              ))}
            </div>
          )}
          <div style={{ marginTop: "0.75rem" }}>
            <label
              style={{
                display: "block",
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 600,
                fontSize: "0.75rem",
                color: "#64748B",
                marginBottom: "0.375rem",
              }}
            >
              Confirm Password
            </label>
            <input
              type="password"
              value={form.confirm}
              onChange={(e) =>
                setForm((p) => ({ ...p, confirm: e.target.value }))
              }
              placeholder="Repeat password"
              style={{
                ...inputBase,
                borderColor:
                  form.confirm && form.confirm !== form.password
                    ? "#FCA5A5"
                    : "#E2E8F0",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#FF6B6B";
                e.target.style.background = "white";
              }}
              onBlur={(e) => {
                e.target.style.borderColor =
                  form.confirm && form.confirm !== form.password
                    ? "#FCA5A5"
                    : "#E2E8F0";
                e.target.style.background = "#F8FAFC";
              }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.5rem" }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            flex: 1,
            padding: "0.6875rem",
            borderRadius: "0.625rem",
            border: "1px solid #E2E8F0",
            background: "white",
            color: "#64748B",
            fontFamily: "Plus Jakarta Sans, sans-serif",
            fontWeight: 600,
            fontSize: "0.875rem",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || !canSubmit}
          style={{
            flex: 2,
            padding: "0.6875rem",
            borderRadius: "0.625rem",
            border: "none",
            background:
              canSubmit && !loading
                ? "linear-gradient(135deg, #FF6B6B 0%, #E85555 100%)"
                : "rgba(255,107,107,0.3)",
            color: "white",
            fontFamily: "Plus Jakarta Sans, sans-serif",
            fontWeight: 700,
            fontSize: "0.875rem",
            cursor: canSubmit && !loading ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.375rem",
          }}
        >
          {loading ? (
            <>
              <Loader2
                size={15}
                style={{ animation: "spin 1s linear infinite" }}
              />{" "}
              Saving…
            </>
          ) : isEdit ? (
            "Save Changes"
          ) : (
            "Create Account"
          )}
        </button>
      </div>
    </form>
  );
}

// ── Change password modal ─────────────────────────────────────
function ChangePasswordForm({ member, isSelf, onClose }) {
  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pwOk =
    REQS.every((r) => r.test(form.new_password)) &&
    form.new_password === form.confirm_password;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await teamApi.changePassword(member._id || member.id, form);
      toast.success("Password updated successfully.");
      onClose();
    } catch (err) {
      setError(err.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
    >
      {error && (
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            padding: "0.75rem",
            borderRadius: "0.625rem",
            background: "#FEF2F2",
            border: "1px solid #FCA5A5",
          }}
        >
          <AlertCircle size={15} style={{ color: "#EF4444", flexShrink: 0 }} />
          <p style={{ color: "#DC2626", fontSize: "0.8125rem", margin: 0 }}>
            {error}
          </p>
        </div>
      )}

      {isSelf && (
        <div>
          <label
            style={{
              display: "block",
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontWeight: 600,
              fontSize: "0.75rem",
              color: "#64748B",
              marginBottom: "0.375rem",
            }}
          >
            Current Password
          </label>
          <input
            type="password"
            value={form.current_password}
            onChange={(e) =>
              setForm((p) => ({ ...p, current_password: e.target.value }))
            }
            style={inputBase}
            placeholder="Your current password"
            onFocus={(e) => {
              e.target.style.borderColor = "#FF6B6B";
              e.target.style.background = "white";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#E2E8F0";
              e.target.style.background = "#F8FAFC";
            }}
          />
        </div>
      )}
      <div>
        <label
          style={{
            display: "block",
            fontFamily: "Plus Jakarta Sans, sans-serif",
            fontWeight: 600,
            fontSize: "0.75rem",
            color: "#64748B",
            marginBottom: "0.375rem",
          }}
        >
          New Password
        </label>
        <div style={{ position: "relative" }}>
          <input
            type={showPw ? "text" : "password"}
            value={form.new_password}
            onChange={(e) =>
              setForm((p) => ({ ...p, new_password: e.target.value }))
            }
            style={{ ...inputBase, paddingRight: "2.75rem" }}
            placeholder="Min 8 chars, uppercase, number"
            onFocus={(e) => {
              e.target.style.borderColor = "#FF6B6B";
              e.target.style.background = "white";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#E2E8F0";
              e.target.style.background = "#F8FAFC";
            }}
          />
          <button
            type="button"
            onClick={() => setShowPw((p) => !p)}
            style={{
              position: "absolute",
              right: "0.75rem",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#94A3B8",
            }}
          >
            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>
      <div>
        <label
          style={{
            display: "block",
            fontFamily: "Plus Jakarta Sans, sans-serif",
            fontWeight: 600,
            fontSize: "0.75rem",
            color: "#64748B",
            marginBottom: "0.375rem",
          }}
        >
          Confirm New Password
        </label>
        <input
          type="password"
          value={form.confirm_password}
          onChange={(e) =>
            setForm((p) => ({ ...p, confirm_password: e.target.value }))
          }
          style={inputBase}
          placeholder="Repeat new password"
          onFocus={(e) => {
            e.target.style.borderColor = "#FF6B6B";
            e.target.style.background = "white";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#E2E8F0";
            e.target.style.background = "#F8FAFC";
          }}
        />
      </div>
      <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.5rem" }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            flex: 1,
            padding: "0.6875rem",
            borderRadius: "0.625rem",
            border: "1px solid #E2E8F0",
            background: "white",
            color: "#64748B",
            fontFamily: "Plus Jakarta Sans, sans-serif",
            fontWeight: 600,
            fontSize: "0.875rem",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || !pwOk || (isSelf && !form.current_password)}
          style={{
            flex: 2,
            padding: "0.6875rem",
            borderRadius: "0.625rem",
            border: "none",
            background: "linear-gradient(135deg, #FF6B6B 0%, #E85555 100%)",
            color: "white",
            fontFamily: "Plus Jakarta Sans, sans-serif",
            fontWeight: 700,
            fontSize: "0.875rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.375rem",
          }}
        >
          {loading ? (
            <>
              <Loader2
                size={15}
                style={{ animation: "spin 1s linear infinite" }}
              />{" "}
              Updating…
            </>
          ) : (
            "Update Password"
          )}
        </button>
      </div>
    </form>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function TeamPage() {
  const { user: currentUser } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | { type, member }

  const isSuperAdmin = currentUser?.role === "super_admin";

  const load = useCallback(async () => {
    try {
      const res = await teamApi.getAll();
      setMembers(res.data || []);
    } catch {
      toast.error("Failed to load team members.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (data) => {
    await teamApi.create(data);
    toast.success("Account created successfully.");
    load();
  };

  const handleUpdate = async (id, data) => {
    await teamApi.update(id, data);
    toast.success("Account updated.");
    load();
  };

  const handleDelete = async (member) => {
    if (!confirm(`Delete account for ${member.name}? This cannot be undone.`))
      return;
    try {
      await teamApi.delete(member._id || member.id);
      toast.success(`${member.name}'s account deleted.`);
      load();
    } catch (err) {
      toast.error(err.message || "Failed to delete account.");
    }
  };

  const handleToggleActive = async (member) => {
    try {
      await teamApi.update(member._id || member.id, { is_active: member.is_active ? 0 : 1 });
      toast.success(
        member.is_active
          ? `${member.name} deactivated.`
          : `${member.name} reactivated.`,
      );
      load();
    } catch (err) {
      toast.error(err.message || "Failed to update status.");
    }
  };

  return (
    <AdminShell>
      <div style={{ padding: "2rem", maxWidth: "900px" }}>
        {/* Page header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "2rem",
            gap: "1rem",
            flexWrap: "wrap",
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
              <Users size={20} style={{ color: "#FF6B6B" }} />
              <h1
                style={{
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 800,
                  fontSize: "1.5rem",
                  color: "#0F172A",
                  margin: 0,
                }}
              >
                Team
              </h1>
            </div>
            <p style={{ color: "#94A3B8", fontSize: "0.875rem", margin: 0 }}>
              Manage admin accounts and access levels for your platform.
            </p>
          </div>
          {isSuperAdmin && (
            <button
              onClick={() => setModal({ type: "create" })}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.6875rem 1.25rem",
                borderRadius: "0.75rem",
                border: "none",
                background: "linear-gradient(135deg, #FF6B6B 0%, #E85555 100%)",
                color: "white",
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 700,
                fontSize: "0.875rem",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(255,107,107,0.3)",
                flexShrink: 0,
              }}
            >
              <UserPlus size={16} /> Add Team Member
            </button>
          )}
        </div>

        {/* Role legend */}
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            flexWrap: "wrap",
            marginBottom: "1.5rem",
          }}
        >
          {Object.entries(ROLES).map(([val, cfg]) => (
            <div
              key={val}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.375rem 0.875rem",
                borderRadius: "9999px",
                background: cfg.bg,
                border: `1px solid ${cfg.color}30`,
              }}
            >
              <cfg.icon size={12} style={{ color: cfg.color }} />
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: cfg.color,
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                }}
              >
                {cfg.label}
              </span>
              <span style={{ fontSize: "0.7rem", color: "#94A3B8" }}>
                — {cfg.desc}
              </span>
            </div>
          ))}
        </div>

        {/* Members list */}
        {loading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "4rem",
              background: "white",
              borderRadius: "1rem",
              border: "1px solid #E2E8F0",
            }}
          >
            <Loader2
              size={24}
              style={{ color: "#FF6B6B", animation: "spin 1s linear infinite" }}
            />
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            {members.map((member) => {
              const isSelf = member.id === currentUser?.id;
              const isInactive = !member.is_active;
              return (
                <div
                  key={member.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    padding: "1.25rem 1.5rem",
                    background: "white",
                    borderRadius: "1rem",
                    border: "1px solid #E2E8F0",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    opacity: isInactive ? 0.6 : 1,
                    transition: "box-shadow 150ms",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(0,0,0,0.08)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.boxShadow =
                      "0 1px 3px rgba(0,0,0,0.04)")
                  }
                >
                  {/* Avatar */}
                  <div
                    style={{
                      width: "2.75rem",
                      height: "2.75rem",
                      borderRadius: "50%",
                      flexShrink: 0,
                      background: `linear-gradient(135deg, ${ROLES[member.role]?.color || "#FF6B6B"} 0%, #0F172A 100%)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      style={{
                        color: "white",
                        fontFamily: "Plus Jakarta Sans, sans-serif",
                        fontWeight: 700,
                        fontSize: "1rem",
                      }}
                    >
                      {member.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        flexWrap: "wrap",
                        marginBottom: "0.2rem",
                      }}
                    >
                      <p
                        style={{
                          fontFamily: "Plus Jakarta Sans, sans-serif",
                          fontWeight: 700,
                          fontSize: "0.9375rem",
                          color: "#0F172A",
                          margin: 0,
                        }}
                      >
                        {member.name}
                      </p>
                      {isSelf && (
                        <span
                          style={{
                            fontSize: "0.65rem",
                            fontWeight: 700,
                            padding: "0.1rem 0.5rem",
                            borderRadius: "9999px",
                            background: "#F1F5F9",
                            color: "#64748B",
                            fontFamily: "Plus Jakarta Sans, sans-serif",
                          }}
                        >
                          You
                        </span>
                      )}
                      {isInactive && (
                        <span
                          style={{
                            fontSize: "0.65rem",
                            fontWeight: 700,
                            padding: "0.1rem 0.5rem",
                            borderRadius: "9999px",
                            background: "#FEF2F2",
                            color: "#EF4444",
                            fontFamily: "Plus Jakarta Sans, sans-serif",
                          }}
                        >
                          Inactive
                        </span>
                      )}
                      <RoleBadge role={member.role} />
                    </div>
                    <p
                      style={{
                        color: "#94A3B8",
                        fontSize: "0.8125rem",
                        margin: 0,
                      }}
                    >
                      {member.email}
                    </p>
                    {member.last_login && (
                      <p
                        style={{
                          color: "#CBD5E1",
                          fontSize: "0.75rem",
                          margin: "0.125rem 0 0",
                        }}
                      >
                        Last login:{" "}
                        {new Date(member.last_login).toLocaleDateString(
                          "en-NG",
                          { day: "numeric", month: "short", year: "numeric" },
                        )}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      flexShrink: 0,
                    }}
                  >
                    {/* Change password — self or super_admin */}
                    {(isSelf || isSuperAdmin) && (
                      <button
                        onClick={() => setModal({ type: "password", member })}
                        title="Change password"
                        style={{
                          padding: "0.5rem",
                          borderRadius: "0.5rem",
                          border: "1px solid #E2E8F0",
                          background: "white",
                          color: "#94A3B8",
                          cursor: "pointer",
                          transition: "all 150ms",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "#38BDF8";
                          e.currentTarget.style.color = "#38BDF8";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "#E2E8F0";
                          e.currentTarget.style.color = "#94A3B8";
                        }}
                      >
                        <KeyRound size={15} />
                      </button>
                    )}
                    {/* Edit — super_admin only, or self for name/email */}
                    {(isSuperAdmin || isSelf) && (
                      <button
                        onClick={() => setModal({ type: "edit", member })}
                        title="Edit account"
                        style={{
                          padding: "0.5rem",
                          borderRadius: "0.5rem",
                          border: "1px solid #E2E8F0",
                          background: "white",
                          color: "#94A3B8",
                          cursor: "pointer",
                          transition: "all 150ms",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "#FF6B6B";
                          e.currentTarget.style.color = "#FF6B6B";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "#E2E8F0";
                          e.currentTarget.style.color = "#94A3B8";
                        }}
                      >
                        <Edit2 size={15} />
                      </button>
                    )}
                    {/* Deactivate / delete — super_admin, not self */}
                    {isSuperAdmin && !isSelf && (
                      <>
                        <button
                          onClick={() => handleToggleActive(member)}
                          title={member.is_active ? "Deactivate" : "Reactivate"}
                          style={{
                            padding: "0.5rem",
                            borderRadius: "0.5rem",
                            border: "1px solid #E2E8F0",
                            background: "white",
                            color: "#94A3B8",
                            cursor: "pointer",
                            transition: "all 150ms",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "#F59E0B";
                            e.currentTarget.style.color = "#F59E0B";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "#E2E8F0";
                            e.currentTarget.style.color = "#94A3B8";
                          }}
                        >
                          {member.is_active ? (
                            <X size={15} />
                          ) : (
                            <CheckCircle size={15} />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(member)}
                          title="Delete account"
                          style={{
                            padding: "0.5rem",
                            borderRadius: "0.5rem",
                            border: "1px solid #E2E8F0",
                            background: "white",
                            color: "#94A3B8",
                            cursor: "pointer",
                            transition: "all 150ms",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "#EF4444";
                            e.currentTarget.style.color = "#EF4444";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "#E2E8F0";
                            e.currentTarget.style.color = "#94A3B8";
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {modal?.type === "create" && (
        <Modal title="Add Team Member" onClose={() => setModal(null)}>
          <MemberForm
            onSave={handleCreate}
            onClose={() => setModal(null)}
            isSelf={false}
          />
        </Modal>
      )}
      {modal?.type === "edit" && (
        <Modal title="Edit Account" onClose={() => setModal(null)}>
          <MemberForm
            initial={{
              name: modal.member.name,
              email: modal.member.email,
              role: modal.member.role,
            }}
            onSave={(data) => handleUpdate(modal.member.id, data)}
            onClose={() => setModal(null)}
            isSelf={modal.member.id === currentUser?.id}
          />
        </Modal>
      )}
      {modal?.type === "password" && (
        <Modal
          title={`Change Password — ${modal.member.name}`}
          onClose={() => setModal(null)}
        >
          <ChangePasswordForm
            member={modal.member}
            isSelf={modal.member.id === currentUser?.id}
            onClose={() => setModal(null)}
          />
        </Modal>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AdminShell>
  );
}
