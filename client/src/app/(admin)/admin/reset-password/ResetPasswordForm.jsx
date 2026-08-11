"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
  Building2,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  LinkIcon,
} from "lucide-react";
import { authApi, API_URL } from "@/lib/api";
import PasswordStrength, { isPasswordStrong } from "@/components/shared/PasswordStrength";

const REDIRECT_DELAY_MS = 3000;

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const linkOk = Boolean(token && email);

  const [form, setForm]         = useState({ password: "", confirm_password: "" });
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [done, setDone]         = useState(false);
  const [siteName, setSiteName] = useState("");
  const lock = useRef(false);

  useEffect(() => {
    fetch(`${API_URL}/settings`)
      .then((r) => r.json())
      .then((json) => { const n = json?.data?.settings?.site_name; if (n) setSiteName(n); })
      .catch(() => {});
  }, []);

  // Give the confirmation a beat to be read, then hand off to sign-in.
  // The manual button below is always available for anyone who'd rather not wait.
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => router.replace("/admin/login"), REDIRECT_DELAY_MS);
    return () => clearTimeout(t);
  }, [done, router]);

  const handleChange = (e) => {
    setError("");
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  // Identical rule to SetupForm — both read it from the shared component.
  const passwordOk = isPasswordStrong(form.password);
  const canSubmit =
    linkOk && passwordOk && form.confirm_password !== "" && form.confirm_password === form.password;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || lock.current) return;
    lock.current = true;
    setLoading(true);
    setError("");
    try {
      await authApi.resetPassword({ email, token, new_password: form.password });
      setDone(true);
    } catch (err) {
      // Covers an invalid/expired/already-used token (400) as well as network
      // failures. The server's message is already user-facing.
      setError(err.message || "Could not reset your password. Please try again.");
      lock.current = false;
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "0.8125rem 1rem",
    borderRadius: "0.75rem",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "white",
    fontSize: "0.9375rem",
    outline: "none",
    fontFamily: "Inter, sans-serif",
    boxSizing: "border-box",
    transition: "border-color 200ms, background 200ms",
    opacity: loading ? 0.6 : 1,
  };

  const shell = (children) => (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #060B14 0%, #0F172A 60%, #1E2D4A 100%)",
        padding: "2rem",
        position: "relative",
        overflow: "hidden",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div style={{ position: "absolute", top: "-20%", right: "-5%", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, color-mix(in srgb, var(--color-primary, #b2ff70) 7%, transparent) 0%, transparent 65%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, opacity: 0.02, backgroundImage: "radial-gradient(white 1.5px, transparent 1.5px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />
      <div style={{ width: "100%", maxWidth: "480px", position: "relative" }}>{children}</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  // ── Broken link: no form at all, just a way back ──
  if (!linkOk) {
    return shell(
      <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "1.5rem", padding: "3rem 2.5rem", backdropFilter: "blur(20px)", textAlign: "center", boxShadow: "0 32px 64px rgba(0,0,0,0.4)" }}>
        <div style={{ width: "5rem", height: "5rem", borderRadius: "50%", background: "rgba(239,68,68,0.12)", border: "2px solid rgba(239,68,68,0.35)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
          <LinkIcon size={32} style={{ color: "#EF4444" }} />
        </div>
        <h2 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "white", marginBottom: "0.75rem", letterSpacing: "-0.02em" }}>
          This reset link is invalid
        </h2>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9375rem", lineHeight: 1.7, marginBottom: "2rem" }}>
          The link is missing information it needs. It may have been truncated by
          your email client — please request a new one.
        </p>
        <a
          href="/admin/forgot-password"
          style={{ width: "100%", padding: "0.9rem 1.5rem", borderRadius: "0.75rem", border: "none", background: "var(--color-primary, #b2ff70)", color: "var(--color-secondary, #1b2f31)", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: "0.9375rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", textDecoration: "none", boxSizing: "border-box" }}
        >
          Request a new link <ArrowRight size={17} />
        </a>
        <p style={{ marginTop: "1.25rem", fontSize: "0.75rem" }}>
          <a href="/admin/login" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
            <ArrowLeft size={12} /> Back to sign in
          </a>
        </p>
      </div>,
    );
  }

  // ── Success ──
  if (done) {
    return shell(
      <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "1.5rem", padding: "3rem 2.5rem", backdropFilter: "blur(20px)", textAlign: "center", boxShadow: "0 32px 64px rgba(0,0,0,0.4)" }}>
        <div style={{ width: "5rem", height: "5rem", borderRadius: "50%", background: "color-mix(in srgb, var(--color-primary, #b2ff70) 15%, transparent)", border: "2px solid color-mix(in srgb, var(--color-primary, #b2ff70) 40%, transparent)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
          <CheckCircle size={36} style={{ color: "var(--color-primary, #b2ff70)" }} />
        </div>
        <h2 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: "1.625rem", color: "white", marginBottom: "0.75rem", letterSpacing: "-0.02em" }}>
          Password updated
        </h2>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9375rem", lineHeight: 1.7, marginBottom: "2rem" }}>
          You can now sign in with your new password. Taking you to the sign-in page…
        </p>
        <button
          onClick={() => router.replace("/admin/login")}
          style={{ width: "100%", padding: "0.9rem 1.5rem", borderRadius: "0.75rem", border: "none", background: "var(--color-primary, #b2ff70)", color: "var(--color-secondary, #1b2f31)", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: "0.9375rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", boxShadow: "var(--shadow-coral, 0 8px 24px rgba(0,0,0,0.25))" }}
        >
          Sign in now <ArrowRight size={17} />
        </button>
      </div>,
    );
  }

  // ── Form ──
  return shell(
    <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "1.5rem", padding: "2.5rem", backdropFilter: "blur(20px)", boxShadow: "0 32px 64px rgba(0,0,0,0.4)" }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", justifyContent: "center", marginBottom: "1.25rem" }}>
          <div style={{ width: "2.75rem", height: "2.75rem", borderRadius: "0.75rem", background: "var(--color-primary, #b2ff70)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-coral, 0 8px 24px rgba(0,0,0,0.25))" }}>
            <Building2 size={22} style={{ color: "var(--color-secondary, #1b2f31)" }} />
          </div>
          <h1 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "white", margin: 0, letterSpacing: "-0.02em" }}>
            {siteName || "Admin"}
          </h1>
        </div>
        <h2 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: "1.25rem", color: "white", margin: "0 0 0.5rem", letterSpacing: "-0.02em" }}>
          Choose a new password
        </h2>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem", lineHeight: 1.6, margin: 0 }}>
          Resetting the password for <span style={{ color: "rgba(255,255,255,0.7)" }}>{email}</span>
        </p>
      </div>

      {/* Expiry note */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center", padding: "0.5rem 1rem", borderRadius: "9999px", background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)", marginBottom: "1.5rem" }}>
        <KeyRound size={13} style={{ color: "#38BDF8", flexShrink: 0 }} />
        <span style={{ color: "#38BDF8", fontSize: "0.75rem", fontWeight: 600, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
          This link works once and expires 1 hour after it was sent
        </span>
      </div>

      {/* Error banner */}
      {error && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem", padding: "0.875rem 1rem", borderRadius: "0.75rem", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", marginBottom: "1.5rem" }}>
          <AlertCircle size={16} style={{ color: "#EF4444", flexShrink: 0, marginTop: "0.1rem" }} />
          <div>
            <p style={{ color: "#FCA5A5", fontSize: "0.875rem", lineHeight: 1.5, margin: 0 }}>{error}</p>
            <a href="/admin/forgot-password" style={{ color: "#FCA5A5", fontSize: "0.75rem", textDecoration: "underline", opacity: 0.8 }}>
              Request a new reset link
            </a>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>

        {/* New password */}
        <div>
          <label style={{ display: "block", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 600, fontSize: "0.8125rem", color: "rgba(255,255,255,0.6)", marginBottom: "0.5rem" }}>New Password</label>
          <div style={{ position: "relative" }}>
            <input
              name="password" type={showPass ? "text" : "password"} value={form.password} onChange={handleChange}
              placeholder="Create a strong password"
              autoComplete="new-password" disabled={loading} style={{ ...inputStyle, paddingRight: "3rem" }}
              onFocus={(e) => { e.target.style.borderColor = "var(--color-primary, #b2ff70)"; e.target.style.background = "rgba(255,255,255,0.08)"; }}
              onBlur={(e)  => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; e.target.style.background = "rgba(255,255,255,0.06)"; }}
            />
            <button type="button" onClick={() => setShowPass((p) => !p)}
              style={{ position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", padding: "0.25rem" }}>
              {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {form.password && <PasswordStrength password={form.password} />}
        </div>

        {/* Confirm password */}
        <div>
          <label style={{ display: "block", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 600, fontSize: "0.8125rem", color: "rgba(255,255,255,0.6)", marginBottom: "0.5rem" }}>Confirm New Password</label>
          <div style={{ position: "relative" }}>
            <input
              name="confirm_password" type={showConf ? "text" : "password"} value={form.confirm_password} onChange={handleChange}
              placeholder="Repeat your new password"
              autoComplete="new-password" disabled={loading}
              style={{ ...inputStyle, paddingRight: "3rem", borderColor: form.confirm_password && form.confirm_password !== form.password ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.12)" }}
              onFocus={(e) => { e.target.style.borderColor = "var(--color-primary, #b2ff70)"; e.target.style.background = "rgba(255,255,255,0.08)"; }}
              onBlur={(e) => {
                const mismatch = form.confirm_password && form.confirm_password !== form.password;
                e.target.style.borderColor = mismatch ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.12)";
                e.target.style.background = "rgba(255,255,255,0.06)";
              }}
            />
            <button type="button" onClick={() => setShowConf((p) => !p)}
              style={{ position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", padding: "0.25rem" }}>
              {showConf ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {form.confirm_password && form.confirm_password !== form.password && (
            <p style={{ color: "#FCA5A5", fontSize: "0.75rem", marginTop: "0.375rem" }}>Passwords do not match</p>
          )}
          {form.confirm_password && form.confirm_password === form.password && (
            <p style={{ color: "var(--color-primary, #b2ff70)", fontSize: "0.75rem", marginTop: "0.375rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <CheckCircle size={11} /> Passwords match
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit" disabled={loading || !canSubmit}
          style={{
            width: "100%", padding: "0.9rem 1.5rem", marginTop: "0.5rem", borderRadius: "0.75rem", border: "none",
            background: canSubmit && !loading ? "var(--color-primary, #b2ff70)" : "color-mix(in srgb, var(--color-primary, #b2ff70) 30%, transparent)",
            color: "var(--color-secondary, #1b2f31)",
            fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: "0.9375rem",
            cursor: canSubmit && !loading ? "pointer" : "not-allowed",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
            boxShadow: canSubmit && !loading ? "var(--shadow-coral, 0 8px 24px rgba(0,0,0,0.2))" : "none",
            transition: "all 150ms",
          }}
        >
          {loading ? (
            <><Loader2 size={17} style={{ animation: "spin 1s linear infinite" }} /> Updating password…</>
          ) : (
            <>Reset Password <ArrowRight size={17} /></>
          )}
        </button>
      </form>

      <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.75rem", textAlign: "center", marginTop: "1.5rem" }}>
        <a href="/admin/login" style={{ color: "var(--color-primary, #b2ff70)", textDecoration: "none", opacity: 0.85, display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
          <ArrowLeft size={12} /> Back to sign in
        </a>
      </p>
    </div>,
  );
}
