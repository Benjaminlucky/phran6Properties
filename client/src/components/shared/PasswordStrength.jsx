"use client";

import { CheckCircle } from "lucide-react";

/**
 * The single source of truth for what counts as a strong admin password,
 * used by first-run setup and by password reset. Kept byte-for-byte in step
 * with the zod schema on the server (routes/auth.js `strongPassword` and the
 * setup handler) so the button never enables on a password the API will
 * reject.
 */
export const PASSWORD_REQUIREMENTS = [
  { id: "length", label: "At least 8 characters", test: (p) => p.length >= 8 },
  { id: "upper",  label: "One uppercase letter (A-Z)", test: (p) => /[A-Z]/.test(p) },
  { id: "lower",  label: "One lowercase letter (a-z)", test: (p) => /[a-z]/.test(p) },
  { id: "number", label: "One number (0-9)",           test: (p) => /[0-9]/.test(p) },
];

/** True when `password` satisfies every requirement above. */
export const isPasswordStrong = (password = "") =>
  PASSWORD_REQUIREMENTS.every((r) => r.test(password));

/** Strength bar + per-requirement checklist, styled for the dark auth screens. */
export default function PasswordStrength({ password = "" }) {
  const met = PASSWORD_REQUIREMENTS.filter((r) => r.test(password)).length;
  const pct = (met / PASSWORD_REQUIREMENTS.length) * 100;
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
        {PASSWORD_REQUIREMENTS.map((r) => {
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
