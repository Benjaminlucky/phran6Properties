"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
  Building2,
  MailCheck,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { authApi, API_URL } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [sent, setSent]       = useState(false);
  const [message, setMessage] = useState("");
  const [siteName, setSiteName] = useState("");

  // Best-effort site name for the heading, same as LoginForm/SetupForm.
  useEffect(() => {
    fetch(`${API_URL}/settings`)
      .then((r) => r.json())
      .then((json) => { const n = json?.data?.settings?.site_name; if (n) setSiteName(n); })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await authApi.forgotPassword({ email: email.trim() });
      // The API deliberately answers identically for known and unknown
      // addresses, so there is nothing here to branch on — show its message
      // as a persistent panel rather than a toast the user can miss.
      setMessage(res?.message || "");
      setSent(true);
    } catch (err) {
      // Only genuine failures (network down, 400 malformed email, rate limit)
      // reach this branch — never "no such account".
      setError(err.message || "Could not send the reset link. Please try again.");
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

  return (
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

      <div style={{ width: "100%", maxWidth: "480px", position: "relative" }}>

        {/* ── Sent state ── */}
        {sent && (
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "1.5rem", padding: "3rem 2.5rem", backdropFilter: "blur(20px)", textAlign: "center", boxShadow: "0 32px 64px rgba(0,0,0,0.4)" }}>
            <div style={{ width: "5rem", height: "5rem", borderRadius: "50%", background: "color-mix(in srgb, var(--color-primary, #b2ff70) 15%, transparent)", border: "2px solid color-mix(in srgb, var(--color-primary, #b2ff70) 40%, transparent)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
              <MailCheck size={34} style={{ color: "var(--color-primary, #b2ff70)" }} />
            </div>
            <h2 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: "1.625rem", color: "white", marginBottom: "0.75rem", letterSpacing: "-0.02em" }}>
              Check your email
            </h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9375rem", lineHeight: 1.7, marginBottom: "0.75rem" }}>
              {message || "If an account exists for that email, a password reset link has been sent."}
            </p>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.8125rem", lineHeight: 1.7, marginBottom: "2rem" }}>
              The link expires in 1 hour. Remember to check your spam folder.
            </p>
            <a
              href="/admin/login"
              style={{ width: "100%", padding: "0.9rem 1.5rem", borderRadius: "0.75rem", border: "none", background: "var(--color-primary, #b2ff70)", color: "var(--color-secondary, #1b2f31)", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: "0.9375rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", textDecoration: "none", boxSizing: "border-box", boxShadow: "var(--shadow-coral, 0 8px 24px rgba(0,0,0,0.25))" }}
            >
              Back to sign in <ArrowRight size={17} />
            </a>
            <button
              type="button"
              onClick={() => { setSent(false); setMessage(""); }}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontSize: "0.75rem", cursor: "pointer", marginTop: "1.25rem", fontFamily: "Inter, sans-serif" }}
            >
              Didn&apos;t get it? Try another email
            </button>
          </div>
        )}

        {/* ── Form state ── */}
        {!sent && (
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "1.5rem", padding: "2.5rem", backdropFilter: "blur(20px)", boxShadow: "0 32px 64px rgba(0,0,0,0.4)" }}>

            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", justifyContent: "center", marginBottom: "1.25rem" }}>
                <div style={{ width: "2.75rem", height: "2.75rem", borderRadius: "0.75rem", background: "var(--color-primary, #b2ff70)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-coral, 0 8px 24px rgba(0,0,0,0.25))" }}>
                  <Building2 size={22} style={{ color: "var(--color-secondary, #1b2f31)" }} />
                </div>
                <h1 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "white", margin: 0, letterSpacing: "-0.02em" }}>
                  {siteName || "Admin"}
                </h1>
              </div>
              <h2 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: "1.25rem", color: "white", margin: "0 0 0.5rem", letterSpacing: "-0.02em" }}>
                Forgot your password?
              </h2>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem", lineHeight: 1.6, margin: 0 }}>
                Enter the email on your admin account and we&apos;ll send you a link to reset it.
              </p>
            </div>

            {/* Error banner */}
            {error && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem", padding: "0.875rem 1rem", borderRadius: "0.75rem", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", marginBottom: "1.5rem" }}>
                <AlertCircle size={16} style={{ color: "#EF4444", flexShrink: 0, marginTop: "0.1rem" }} />
                <p style={{ color: "#FCA5A5", fontSize: "0.875rem", lineHeight: 1.5, margin: 0 }}>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
              <div>
                <label style={{ display: "block", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 600, fontSize: "0.8125rem", color: "rgba(255,255,255,0.6)", marginBottom: "0.5rem" }}>
                  Email Address
                </label>
                <input
                  name="email" type="email" value={email}
                  onChange={(e) => { setError(""); setEmail(e.target.value); }}
                  placeholder="admin@example.com"
                  autoComplete="email" disabled={loading} style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = "var(--color-primary, #b2ff70)"; e.target.style.background = "rgba(255,255,255,0.08)"; }}
                  onBlur={(e)  => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; e.target.style.background = "rgba(255,255,255,0.06)"; }}
                />
              </div>

              <button
                type="submit" disabled={loading || !email}
                style={{
                  width: "100%", padding: "0.9rem 1.5rem", marginTop: "0.5rem", borderRadius: "0.75rem", border: "none",
                  background: email && !loading ? "var(--color-primary, #b2ff70)" : "color-mix(in srgb, var(--color-primary, #b2ff70) 30%, transparent)",
                  color: "var(--color-secondary, #1b2f31)",
                  fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: "0.9375rem",
                  cursor: email && !loading ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                  boxShadow: email && !loading ? "var(--shadow-coral, 0 8px 24px rgba(0,0,0,0.2))" : "none",
                  transition: "all 150ms",
                }}
              >
                {loading ? (
                  <><Loader2 size={17} style={{ animation: "spin 1s linear infinite" }} /> Sending link…</>
                ) : (
                  <>Send reset link <ArrowRight size={17} /></>
                )}
              </button>
            </form>

            <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.75rem", textAlign: "center", marginTop: "1.5rem" }}>
              <a href="/admin/login" style={{ color: "var(--color-primary, #b2ff70)", textDecoration: "none", opacity: 0.85, display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                <ArrowLeft size={12} /> Back to sign in
              </a>
            </p>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
