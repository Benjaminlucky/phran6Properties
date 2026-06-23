"use client";

import { API_URL } from "@/lib/api";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
  Building2,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  WifiOff,
} from "lucide-react";
import { setupApi } from "@/lib/api";
import { useAuth } from "@/context/useAuth";

const REQUIREMENTS = [
  { id: "length", label: "At least 8 characters", test: (p) => p.length >= 8 },
  { id: "upper",  label: "One uppercase letter (A-Z)", test: (p) => /[A-Z]/.test(p) },
  { id: "lower",  label: "One lowercase letter (a-z)", test: (p) => /[a-z]/.test(p) },
  { id: "number", label: "One number (0-9)",           test: (p) => /[0-9]/.test(p) },
];

function PasswordStrength({ password }) {
  const met = REQUIREMENTS.filter((r) => r.test(password)).length;
  const pct = (met / REQUIREMENTS.length) * 100;
  const color =
    pct === 0   ? "rgba(255,255,255,0.1)" :
    pct <= 25   ? "#EF4444" :
    pct <= 50   ? "#F59E0B" :
    pct <= 75   ? "#38BDF8" :
                  "var(--color-primary, #b2ff70)";
  return (
    <div style={{ marginTop: "0.75rem" }}>
      <div style={{ height: "4px", borderRadius: "9999px", background: "rgba(255,255,255,0.08)", marginBottom: "0.75rem", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: "9999px", transition: "width 300ms ease" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.375rem" }}>
        {REQUIREMENTS.map((r) => {
          const ok = r.test(password);
          return (
            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <CheckCircle size={11} style={{ color: ok ? "var(--color-primary, #b2ff70)" : "rgba(255,255,255,0.2)", flexShrink: 0, transition: "color 200ms" }} />
              <span style={{ fontSize: "0.7rem", color: ok ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.25)", transition: "color 200ms" }}>
                {r.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SetupForm() {
  const router = useRouter();
  const { login, isAuthenticated, loading: authLoading } = useAuth();

  const [checking, setChecking]       = useState(true);
  const [apiOnline, setApiOnline]     = useState(true);
  const [form, setForm]               = useState({ name: "", email: "", password: "", confirm_password: "" });
  const [showPass, setShowPass]       = useState(false);
  const [showConf, setShowConf]       = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [done, setDone]               = useState(false);
  const [siteName, setSiteName]       = useState("");

  // Fetch site name for the heading (best-effort, no error shown)
  useEffect(() => {
    fetch(`${API_URL}/settings`)
      .then((r) => r.json())
      .then((json) => { const n = json?.data?.settings?.site_name; if (n) setSiteName(n); })
      .catch(() => {});
  }, []);

  // Redirect already-authenticated users
  useEffect(() => {
    if (!authLoading && isAuthenticated) router.replace("/admin");
  }, [isAuthenticated, authLoading, router]);

  // Check setup status + API reachability
  useEffect(() => {
    async function check() {
      try {
        const res = await setupApi.getStatus();
        if (!res.data.setup_required) {
          router.replace("/admin/login");
          return;
        }
        setApiOnline(true);
      } catch {
        // API unreachable — show form with a warning so user can still try
        setApiOnline(false);
      } finally {
        setChecking(false);
      }
    }
    check();
  }, [router]);

  const handleChange = (e) => {
    setError("");
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const passwordOk = REQUIREMENTS.every((r) => r.test(form.password));
  const canSubmit  = form.name && form.email && passwordOk && form.confirm_password === form.password && form.confirm_password !== "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError("");
    try {
      await setupApi.create(form);
      await login(form.email, form.password);
      setDone(true);
    } catch (err) {
      const msg = err.message || "Setup failed.";
      if (msg.toLowerCase().includes("already")) {
        router.replace("/admin/login");
      } else {
        setError(msg);
      }
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

  if (checking || authLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #060B14 0%, #0F172A 100%)" }}>
        <Loader2 size={32} style={{ color: "var(--color-primary, #b2ff70)", animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

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
      {/* Background glow — uses theme primary */}
      <div style={{ position: "absolute", top: "-20%", right: "-5%", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, color-mix(in srgb, var(--color-primary, #b2ff70) 7%, transparent) 0%, transparent 65%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, opacity: 0.02, backgroundImage: "radial-gradient(white 1.5px, transparent 1.5px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: "480px", position: "relative" }}>

        {/* ── Success state ── */}
        {done && (
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "1.5rem", padding: "3rem 2.5rem", backdropFilter: "blur(20px)", textAlign: "center" }}>
            <div style={{ width: "5rem", height: "5rem", borderRadius: "50%", background: "color-mix(in srgb, var(--color-primary, #b2ff70) 15%, transparent)", border: "2px solid color-mix(in srgb, var(--color-primary, #b2ff70) 40%, transparent)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
              <CheckCircle size={36} style={{ color: "var(--color-primary, #b2ff70)" }} />
            </div>
            <h2 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: "1.625rem", color: "white", marginBottom: "0.75rem", letterSpacing: "-0.02em" }}>
              You&apos;re all set!
            </h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9375rem", lineHeight: 1.7, marginBottom: "2rem" }}>
              Your super admin account has been created and you are now logged in.
            </p>
            <button
              onClick={() => router.replace("/admin")}
              style={{ width: "100%", padding: "0.9rem 1.5rem", borderRadius: "0.75rem", border: "none", background: "var(--color-primary, #b2ff70)", color: "var(--color-secondary, #1b2f31)", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: "0.9375rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", boxShadow: "var(--shadow-coral, 0 8px 24px rgba(0,0,0,0.25))" }}
            >
              Go to Dashboard <ArrowRight size={17} />
            </button>
          </div>
        )}

        {/* ── Form state ── */}
        {!done && (
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
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem", lineHeight: 1.6, margin: 0 }}>
                Create your super admin account to get started.
              </p>
            </div>

            {/* First-run badge */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center", padding: "0.5rem 1rem", borderRadius: "9999px", background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)", marginBottom: "1.5rem" }}>
              <ShieldCheck size={13} style={{ color: "#38BDF8" }} />
              <span style={{ color: "#38BDF8", fontSize: "0.75rem", fontWeight: 600, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                First-run setup — this page locks after account creation
              </span>
            </div>

            {/* API offline warning */}
            {!apiOnline && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem", padding: "0.875rem 1rem", borderRadius: "0.75rem", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", marginBottom: "1.25rem" }}>
                <WifiOff size={15} style={{ color: "#FCD34D", flexShrink: 0, marginTop: "0.1rem" }} />
                <div>
                  <p style={{ color: "#FCD34D", fontSize: "0.8rem", fontWeight: 600, margin: "0 0 0.2rem" }}>
                    Backend not reachable
                  </p>
                  <p style={{ color: "rgba(252,211,77,0.7)", fontSize: "0.75rem", margin: 0, lineHeight: 1.5 }}>
                    Trying to connect to <code style={{ background: "rgba(0,0,0,0.3)", padding: "0.1rem 0.3rem", borderRadius: "0.25rem" }}>{API_URL}</code>. Set <code style={{ background: "rgba(0,0,0,0.3)", padding: "0.1rem 0.3rem", borderRadius: "0.25rem" }}>NEXT_PUBLIC_API_URL</code> if your backend is on a different URL.
                  </p>
                </div>
              </div>
            )}

            {/* Error banner */}
            {error && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem", padding: "0.875rem 1rem", borderRadius: "0.75rem", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", marginBottom: "1.5rem" }}>
                <AlertCircle size={16} style={{ color: "#EF4444", flexShrink: 0, marginTop: "0.1rem" }} />
                <p style={{ color: "#FCA5A5", fontSize: "0.875rem", lineHeight: 1.5, margin: 0 }}>{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>

              {/* Name */}
              <div>
                <label style={{ display: "block", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 600, fontSize: "0.8125rem", color: "rgba(255,255,255,0.6)", marginBottom: "0.5rem" }}>Full Name</label>
                <input
                  name="name" type="text" value={form.name} onChange={handleChange}
                  placeholder="e.g. Chukwuemeka Adeyemi"
                  autoComplete="name" disabled={loading} style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = "var(--color-primary, #b2ff70)"; e.target.style.background = "rgba(255,255,255,0.08)"; }}
                  onBlur={(e)  => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; e.target.style.background = "rgba(255,255,255,0.06)"; }}
                />
              </div>

              {/* Email */}
              <div>
                <label style={{ display: "block", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 600, fontSize: "0.8125rem", color: "rgba(255,255,255,0.6)", marginBottom: "0.5rem" }}>Email Address</label>
                <input
                  name="email" type="email" value={form.email} onChange={handleChange}
                  placeholder="you@yourcompany.com"
                  autoComplete="email" disabled={loading} style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = "var(--color-primary, #b2ff70)"; e.target.style.background = "rgba(255,255,255,0.08)"; }}
                  onBlur={(e)  => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; e.target.style.background = "rgba(255,255,255,0.06)"; }}
                />
              </div>

              {/* Password */}
              <div>
                <label style={{ display: "block", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 600, fontSize: "0.8125rem", color: "rgba(255,255,255,0.6)", marginBottom: "0.5rem" }}>Password</label>
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
                <label style={{ display: "block", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 600, fontSize: "0.8125rem", color: "rgba(255,255,255,0.6)", marginBottom: "0.5rem" }}>Confirm Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    name="confirm_password" type={showConf ? "text" : "password"} value={form.confirm_password} onChange={handleChange}
                    placeholder="Repeat your password"
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
                  <><Loader2 size={17} style={{ animation: "spin 1s linear infinite" }} /> Creating Account…</>
                ) : (
                  <>Create Admin Account <ArrowRight size={17} /></>
                )}
              </button>
            </form>

            <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.75rem", textAlign: "center", marginTop: "1.5rem" }}>
              Already have an account?{" "}
              <a href="/admin/login" style={{ color: "var(--color-primary, #b2ff70)", textDecoration: "none", opacity: 0.85 }}>Sign in</a>
            </p>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
