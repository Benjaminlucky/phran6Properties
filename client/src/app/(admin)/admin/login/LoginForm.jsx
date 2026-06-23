"use client";

import { API_URL } from "@/config/site";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  AlertCircle,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/useAuth";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirect = searchParams.get("redirect") || "/admin";
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [siteName, setSiteName] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/settings`)
      .then((r) => r.json())
      .then((json) => {
        const name = json?.data?.settings?.site_name;
        if (name) setSiteName(name);
      })
      .catch(() => {});
  }, []);
  const lock = useRef(false);

  const handleChange = (e) => {
    setError("");
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (lock.current) return;
    if (!form.email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }
    lock.current = true;
    setSubmitting(true);
    setError("");
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      router.replace(redirect);
    } catch (err) {
      setError(
        err.message?.includes("Invalid")
          ? "Incorrect email or password."
          : err.message || "Login failed.",
      );
      lock.current = false;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background:
          "linear-gradient(135deg, #060B14 0%, #0F172A 60%, #1E2D4A 100%)",
        position: "relative",
        overflow: "hidden",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-15%",
          right: "-5%",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--color-primary, #b2ff70) 8%, transparent) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.025,
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.8) 1.5px, transparent 1.5px)",
          backgroundSize: "30px 30px",
          pointerEvents: "none",
        }}
      />

      {/* Left panel */}
      <div
        style={{
          flex: "0 0 45%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "3rem 4rem",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
        className="hide-mobile"
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              width: "2.75rem",
              height: "2.75rem",
              borderRadius: "0.75rem",
              background: "var(--color-primary, #b2ff70)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "var(--shadow-coral, 0 8px 24px rgba(0,0,0,0.25))",
            }}
          >
            <Building2 size={22} style={{ color: "var(--color-secondary, #1b2f31)" }} />
          </div>
          <div>
            <p
              style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 800,
                fontSize: "1.25rem",
                color: "white",
                lineHeight: 1,
                marginBottom: "0.2rem",
              }}
            >
              {siteName || "Admin"}
            </p>
            <p
              style={{
                fontSize: "0.7rem",
                color: "rgba(255,255,255,0.35)",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Admin Panel
            </p>
          </div>
        </div>
        <h1
          style={{
            fontFamily: "Plus Jakarta Sans, sans-serif",
            fontWeight: 800,
            fontSize: "2.5rem",
            color: "white",
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            marginBottom: "1.25rem",
          }}
        >
          Manage your
          <br />
          <span style={{ color: "var(--color-primary, #b2ff70)" }}>real estate</span>
          <br />
          empire.
        </h1>
        <p
          style={{
            color: "rgba(255,255,255,0.45)",
            fontSize: "0.9375rem",
            lineHeight: 1.7,
            maxWidth: "340px",
            marginBottom: "3rem",
          }}
        >
          List lands, houses, publish blog articles, manage enquiries and track
          performance.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <ShieldCheck size={14} style={{ color: "#22C55E", flexShrink: 0 }} />
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.75rem" }}>
            Secured with JWT. Sessions auto-expire.
          </span>
        </div>
      </div>

      {/* Right form */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "420px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "1.5rem",
            padding: "2.5rem",
            backdropFilter: "blur(20px)",
            boxShadow: "0 32px 64px rgba(0,0,0,0.4)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              marginBottom: "2rem",
            }}
          >
            <div
              style={{
                width: "2.25rem",
                height: "2.25rem",
                borderRadius: "0.625rem",
                background: "var(--color-primary, #b2ff70)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Building2 size={18} style={{ color: "var(--color-secondary, #1b2f31)" }} />
            </div>
            <span
              style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 800,
                color: "white",
                fontSize: "1rem",
              }}
            >
              {siteName || "Admin"}
            </span>
          </div>

          <h2
            style={{
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontWeight: 800,
              fontSize: "1.5rem",
              color: "white",
              marginBottom: "0.375rem",
              letterSpacing: "-0.02em",
            }}
          >
            Sign in to Admin
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: "0.875rem",
              marginBottom: "2rem",
            }}
          >
            Enter your credentials to access the dashboard.
          </p>

          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.625rem",
                padding: "0.875rem 1rem",
                borderRadius: "0.75rem",
                background: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.3)",
                marginBottom: "1.5rem",
              }}
            >
              <AlertCircle
                size={16}
                style={{ color: "#EF4444", flexShrink: 0, marginTop: "0.1rem" }}
              />
              <p
                style={{
                  color: "#FCA5A5",
                  fontSize: "0.875rem",
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                {error}
              </p>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.125rem",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 600,
                  fontSize: "0.8125rem",
                  color: "rgba(255,255,255,0.6)",
                  marginBottom: "0.5rem",
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="admin@example.com"
                autoComplete="email"
                disabled={submitting}
                style={{
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
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--color-primary, #b2ff70)";
                  e.target.style.background = "rgba(255,255,255,0.08)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255,255,255,0.12)";
                  e.target.style.background = "rgba(255,255,255,0.06)";
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 600,
                  fontSize: "0.8125rem",
                  color: "rgba(255,255,255,0.6)",
                  marginBottom: "0.5rem",
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={submitting}
                  style={{
                    width: "100%",
                    padding: "0.8125rem 3rem 0.8125rem 1rem",
                    borderRadius: "0.75rem",
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.06)",
                    color: "white",
                    fontSize: "0.9375rem",
                    outline: "none",
                    fontFamily: "Inter, sans-serif",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--color-primary, #b2ff70)";
                    e.target.style.background = "rgba(255,255,255,0.08)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(255,255,255,0.12)";
                    e.target.style.background = "rgba(255,255,255,0.06)";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  style={{
                    position: "absolute",
                    right: "0.875rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "rgba(255,255,255,0.35)",
                  }}
                >
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              style={{
                width: "100%",
                padding: "0.9rem 1.5rem",
                borderRadius: "0.75rem",
                border: "none",
                background: submitting
                  ? "color-mix(in srgb, var(--color-primary, #b2ff70) 50%, transparent)"
                  : "var(--color-primary, #b2ff70)",
                color: "var(--color-secondary, #1b2f31)",
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 700,
                fontSize: "0.9375rem",
                cursor: submitting ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                marginTop: "0.5rem",
                boxShadow: submitting
                  ? "none"
                  : "var(--shadow-coral, 0 8px 24px rgba(0,0,0,0.2))",
              }}
            >
              {submitting ? (
                <>
                  <Loader2
                    size={17}
                    style={{ animation: "spin 1s linear infinite" }}
                  />{" "}
                  Signing in…
                </>
              ) : (
                "Sign In to Dashboard"
              )}
            </button>
          </form>

          <p
            style={{
              color: "rgba(255,255,255,0.2)",
              fontSize: "0.75rem",
              textAlign: "center",
              marginTop: "1.75rem",
              lineHeight: 1.6,
            }}
          >
            First time?{" "}
            <a
              href="/admin/setup"
              style={{ color: "var(--color-primary, #b2ff70)", textDecoration: "none", opacity: 0.85 }}
            >
              Create your admin account &rarr;
            </a>
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @media (max-width: 768px) { .hide-mobile { display: none !important; } }`}</style>
    </div>
  );
}
