"use client";

import { useState, useEffect } from "react";
import { X, Phone } from "lucide-react";

// ── WhatsApp SVG logo ─────────────────────────────────────────────
function WaIcon({ size = 24, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

// ── Normalize phone → international digits ────────────────────────
function toWaNumber(raw) {
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("234")) return digits;
  if (digits.startsWith("0")) return "234" + digits.slice(1);
  return digits;
}

// ── Initials fallback when no avatar is set ───────────────────────
function Initials({ name, size = 56 }) {
  const parts = (name || "R").trim().split(" ");
  const letters = (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "linear-gradient(135deg,#b2ff70,#5ecb40)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        border: "2px solid rgba(255,255,255,0.35)",
      }}
    >
      <span
        style={{
          color: "#1b2f31",
          fontWeight: 800,
          fontSize: size * 0.38,
          lineHeight: 1,
          fontFamily: "Plus Jakarta Sans, sans-serif",
          textTransform: "uppercase",
        }}
      >
        {letters || "R"}
      </span>
    </div>
  );
}

const STORAGE_KEY = "wa_widget_dismissed_until";
const AUTO_OPEN_DELAY = 3500; // ms before auto-opening

export default function WhatsAppWidget({ settings = {} }) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [animate, setAnimate] = useState(false);

  const enabled = settings.wa_enabled !== "false";
  const agentName = settings.wa_name || "Lucky Benjamin";
  const agentTitle = settings.wa_title || "CEO, Mehurbs Properties Limited";
  const agentAvatar = settings.wa_avatar || "";
  const greeting =
    settings.wa_message ||
    `Hi there! 👋 I'm ${agentName}. I'm not available right now, but send me a message and I'll get back to you as soon as possible. You can also reach me directly on the number below.`;
  const rawNumber = settings.wa_number || settings.whatsapp || "09021359415";
  const waNumber = toWaNumber(rawNumber);
  const prefill = encodeURIComponent(
    settings.wa_prefill ||
      "Hello! I came across Mehurbs Properties and I'd like to enquire about a listing.",
  );
  const waUrl = `https://wa.me/${waNumber}?text=${prefill}`;
  const callUrl = `tel:${rawNumber}`;

  // Fade in the bubble after mount
  useEffect(() => {
    if (!enabled) return;
    const t = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(t);
  }, [enabled]);

  // Auto-open once after delay (respects 24-hour dismiss)
  useEffect(() => {
    if (!enabled) return;
    try {
      const until = Number(localStorage.getItem(STORAGE_KEY) || 0);
      if (Date.now() < until) return; // still dismissed
    } catch {}
    const t = setTimeout(() => {
      setOpen(true);
      setAnimate(true);
    }, AUTO_OPEN_DELAY);
    return () => clearTimeout(t);
  }, [enabled]);

  const handleOpen = () => {
    setOpen(true);
    setAnimate(true);
  };

  const handleClose = () => {
    setAnimate(false);
    setTimeout(() => setOpen(false), 220);
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now() + 24 * 60 * 60 * 1000));
    } catch {}
  };

  if (!enabled) return null;

  return (
    <>
      <style>{`
        @keyframes wa-slide-up {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes wa-slide-down {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to   { opacity: 0; transform: translateY(20px) scale(0.95); }
        }
        @keyframes wa-pulse {
          0%,100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(37,211,102,0.5); }
          50%      { transform: scale(1.04); box-shadow: 0 0 0 10px rgba(37,211,102,0); }
        }
        @keyframes wa-bubble-in {
          from { opacity: 0; transform: scale(0.85) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes wa-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .wa-msg-bubble {
          animation: wa-bubble-in 0.35s cubic-bezier(0.34,1.56,0.64,1) 0.25s both;
        }
      `}</style>

      {/* ── Fixed container ──────────────────────────────────────── */}
      <div
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          zIndex: 9000,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "0.75rem",
          pointerEvents: "none",
        }}
      >
        {/* ── Chat card ─────────────────────────────────────────── */}
        {open && (
          <div
            style={{
              width: "min(340px, calc(100vw - 3rem))",
              borderRadius: "1.25rem",
              overflow: "hidden",
              boxShadow:
                "0 24px 64px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.12)",
              animation: animate
                ? "wa-slide-up 0.28s cubic-bezier(0.16,1,0.3,1) both"
                : "wa-slide-down 0.22s ease both",
              pointerEvents: "all",
            }}
          >
            {/* Header */}
            <div
              style={{
                background: "linear-gradient(135deg, #1b2f31 0%, #2a4547 100%)",
                padding: "1.125rem 1.125rem 1.25rem",
                position: "relative",
              }}
            >
              {/* Close */}
              <button
                onClick={handleClose}
                aria-label="Close chat"
                style={{
                  position: "absolute",
                  top: "0.75rem",
                  right: "0.75rem",
                  background: "rgba(255,255,255,0.12)",
                  border: "none",
                  borderRadius: "50%",
                  width: "28px",
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.8)",
                  transition: "background 150ms",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.22)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.12)")
                }
              >
                <X size={14} />
              </button>

              {/* Agent info */}
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}
              >
                {/* Avatar */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                  {agentAvatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={agentAvatar}
                      alt={agentName}
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "2.5px solid rgba(255,255,255,0.3)",
                      }}
                    />
                  ) : (
                    <Initials name={agentName} size={56} />
                  )}
                  {/* Online dot */}
                  <span
                    style={{
                      position: "absolute",
                      bottom: 2,
                      right: 2,
                      width: 13,
                      height: 13,
                      borderRadius: "50%",
                      background: "#25D366",
                      border: "2px solid #1b2f31",
                    }}
                  />
                </div>

                {/* Name & title */}
                <div>
                  <p
                    style={{
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "0.9375rem",
                      margin: "0 0 0.15rem",
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                    }}
                  >
                    {agentName}
                  </p>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.65)",
                      fontSize: "0.75rem",
                      margin: "0 0 0.3rem",
                      lineHeight: 1.4,
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {agentTitle}
                  </p>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      fontSize: "0.68rem",
                      color: "#b2ff70",
                      fontWeight: 600,
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#25D366",
                        display: "inline-block",
                      }}
                    />
                    Typically replies within minutes
                  </span>
                </div>
              </div>
            </div>

            {/* Body — chat bubbles */}
            <div
              style={{
                background: "#ECE5DD",
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4c9b8' fill-opacity='0.35'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                padding: "1.125rem",
                minHeight: "120px",
              }}
            >
              {/* Timestamp */}
              <p
                style={{
                  textAlign: "center",
                  fontSize: "0.68rem",
                  color: "#8a8a8a",
                  marginBottom: "0.75rem",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                TODAY
              </p>

              {/* Agent message bubble */}
              <div
                className="wa-msg-bubble"
                style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem" }}
              >
                <div style={{ flexShrink: 0, marginBottom: "4px" }}>
                  {agentAvatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={agentAvatar}
                      alt=""
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <Initials name={agentName} size={28} />
                  )}
                </div>
                <div
                  style={{
                    background: "#fff",
                    borderRadius: "0 0.75rem 0.75rem 0.75rem",
                    padding: "0.625rem 0.875rem",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                    maxWidth: "82%",
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.8125rem",
                      color: "#1a1a1a",
                      margin: 0,
                      lineHeight: 1.55,
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {greeting}
                  </p>
                  <p
                    style={{
                      fontSize: "0.65rem",
                      color: "#9a9a9a",
                      margin: "0.3rem 0 0",
                      textAlign: "right",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {new Date().toLocaleTimeString("en-NG", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer — CTA buttons */}
            <div
              style={{
                background: "#fff",
                padding: "0.875rem 1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              {/* WhatsApp button */}
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  background: "#25D366",
                  color: "#fff",
                  textDecoration: "none",
                  borderRadius: "0.75rem",
                  padding: "0.75rem 1rem",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  transition: "background 150ms",
                  boxShadow: "0 2px 8px rgba(37,211,102,0.35)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#20bd5a")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#25D366")
                }
              >
                <WaIcon size={18} color="#fff" />
                Start Chat on WhatsApp
              </a>

              {/* Call button */}
              <a
                href={callUrl}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  background: "var(--color-surface-2, #f4f9f4)",
                  color: "var(--color-secondary, #1b2f31)",
                  textDecoration: "none",
                  borderRadius: "0.75rem",
                  padding: "0.625rem 1rem",
                  fontWeight: 600,
                  fontSize: "0.8125rem",
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  border: "1px solid var(--color-border, #e2e8e0)",
                  transition: "background 150ms",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--color-surface-3, #edf5ed)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "var(--color-surface-2, #f4f9f4)")
                }
              >
                <Phone size={14} />
                Call {rawNumber}
              </a>
            </div>
          </div>
        )}

        {/* ── Floating bubble ────────────────────────────────────── */}
        <button
          onClick={open ? handleClose : handleOpen}
          aria-label={open ? "Close chat" : "Chat with us on WhatsApp"}
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "#25D366",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 20px rgba(37,211,102,0.5)",
            animation: open ? "none" : "wa-pulse 2.5s ease-in-out infinite",
            transition: "opacity 0.3s, transform 0.2s",
            opacity: visible ? 1 : 0,
            transform: visible ? "scale(1)" : "scale(0.6)",
            pointerEvents: "all",
            position: "relative",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          {open ? (
            <X size={24} color="#fff" />
          ) : (
            <WaIcon size={28} color="#fff" />
          )}

          {/* Notification badge */}
          {!open && (
            <span
              style={{
                position: "absolute",
                top: -2,
                right: -2,
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "#ef4444",
                border: "2px solid #fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.6rem",
                fontWeight: 800,
                color: "#fff",
                fontFamily: "Inter, sans-serif",
                animation: "wa-fade-in 0.5s 1.5s both",
              }}
            >
              1
            </span>
          )}
        </button>
      </div>
    </>
  );
}
