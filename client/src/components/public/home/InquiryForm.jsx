"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { enquiriesApi } from "@/lib/api.js";
import { POPULAR_LOCATIONS, SITE_CONFIG } from "@/config/site";
import { buildWhatsAppLink } from "@/lib/utils";

const INQUIRY_TYPES = [
  "Buy Land",
  "Buy House",
  "Rent Property",
  "Investment Advice",
  "Property Valuation",
  "Other",
];

const BUDGET_RANGES = [
  "Under ₦5 Million",
  "₦5M – ₦20M",
  "₦20M – ₦50M",
  "₦50M – ₦100M",
  "₦100M – ₦500M",
  "Above ₦500M",
];

const PROPERTY_TYPES = [
  "Land / Plot",
  "Apartment / Flat",
  "Duplex",
  "Bungalow",
  "Terrace House",
  "Penthouse",
  "Commercial Property",
  "Shortlet",
];

const inputStyle = {
  width: "100%",
  padding: "0.625rem 0.875rem",
  borderRadius: "var(--radius)",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.06)",
  color: "white",
  fontSize: "0.875rem",
  outline: "none",
  transition: "border-color 200ms, background 200ms",
  fontFamily: "var(--font-body)",
};

const labelStyle = {
  display: "block",
  fontSize: "0.75rem",
  fontWeight: "600",
  marginBottom: "0.375rem",
  color: "rgba(255,255,255,0.6)",
  fontFamily: "var(--font-heading)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const EMPTY_FORM = {
  inquiry_type: "",
  property_type: "",
  budget: "",
  preferred_location: "",
  additional_info: "",
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
};

export default function InquiryForm({ settings }) {
  const whatsapp = settings?.whatsapp || SITE_CONFIG.whatsapp;

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFocus = (e) => {
    e.target.style.borderColor = "var(--color-primary)";
    e.target.style.background = "rgba(16,185,129,0.06)";
  };

  const handleBlur = (e) => {
    e.target.style.borderColor = "rgba(255,255,255,0.12)";
    e.target.style.background = "rgba(255,255,255,0.06)";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.first_name.trim()) {
      toast.error("Please enter your first name.");
      return;
    }
    if (!form.phone.trim()) {
      toast.error("Please enter your phone number.");
      return;
    }

    setLoading(true);
    try {
      // Map additional_info → message so the backend required field is satisfied.
      // Also forward the structured hero-form fields (property_type, budget,
      // preferred_location) — the updated schema stores them individually.
      await enquiriesApi.submit({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        inquiry_type: form.inquiry_type,
        property_type: form.property_type,
        budget: form.budget,
        preferred_location: form.preferred_location,
        // message is the catch-all field the backend requires.
        // Use additional_info if filled; otherwise build a summary from
        // the structured fields so the backend never rejects the request.
        message:
          form.additional_info.trim() ||
          [
            form.inquiry_type && `I am interested in: ${form.inquiry_type}`,
            form.property_type && `Property type: ${form.property_type}`,
            form.budget && `Budget: ${form.budget}`,
            form.preferred_location &&
              `Preferred location: ${form.preferred_location}`,
          ]
            .filter(Boolean)
            .join("\n") ||
          "Submitted via hero enquiry form.",
        listing_type: "general",
        source: "hero_form",
      });

      toast.success("Enquiry submitted! We'll contact you shortly.", {
        description: "Our team will reach out within 24 hours.",
      });

      // Open WhatsApp with a pre-filled summary
      const waMessage =
        `Hello! I submitted an enquiry on your website.\n\n` +
        `Name: ${form.first_name} ${form.last_name}\n` +
        `Interested in: ${form.inquiry_type || "Property"}\n` +
        `Budget: ${form.budget || "Not specified"}\n` +
        `Location: ${form.preferred_location || "Not specified"}`;

      if (whatsapp) {
        window.open(buildWhatsAppLink(whatsapp, waMessage), "_blank");
      }

      setForm(EMPTY_FORM);
    } catch (err) {
      console.error("[InquiryForm] submit error:", err);
      toast.error(
        err.message?.includes("Network")
          ? "Network error — please try again."
          : "Failed to submit. Please try WhatsApp instead.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="rounded-2xl p-6 md:p-8"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.1)",
        backdropFilter: "blur(16px)",
      }}
    >
      {/* Form header */}
      <div className="mb-6">
        <h2
          className="text-lg font-bold text-white mb-1"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Find Your Property
        </h2>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
          Tell us what you&apos;re looking for and we&apos;ll find it for you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: Inquiry type + Property type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label style={labelStyle}>I am interested in</label>
            <select
              name="inquiry_type"
              value={form.inquiry_type}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              <option value="" style={{ background: "#1C1C2E" }}>
                Select Inquiry Type
              </option>
              {INQUIRY_TYPES.map((t) => (
                <option key={t} value={t} style={{ background: "#1C1C2E" }}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Property Type</label>
            <select
              name="property_type"
              value={form.property_type}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              <option value="" style={{ background: "#1C1C2E" }}>
                Property Type
              </option>
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t} style={{ background: "#1C1C2E" }}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Budget + Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label style={labelStyle}>Max Budget</label>
            <select
              name="budget"
              value={form.budget}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              <option value="" style={{ background: "#1C1C2E" }}>
                Select Budget
              </option>
              {BUDGET_RANGES.map((b) => (
                <option key={b} value={b} style={{ background: "#1C1C2E" }}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Preferred Location</label>
            <select
              name="preferred_location"
              value={form.preferred_location}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              <option value="" style={{ background: "#1C1C2E" }}>
                Preferred Location
              </option>
              {POPULAR_LOCATIONS.map((l) => (
                <option
                  key={l.value}
                  value={l.value}
                  style={{ background: "#1C1C2E" }}
                >
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Additional info */}
        <div>
          <label style={labelStyle}>Additional Information</label>
          <textarea
            name="additional_info"
            value={form.additional_info}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Tell us about what you are looking for?"
            rows={2}
            style={{ ...inputStyle, resize: "none" }}
          />
        </div>

        {/* Row: First + Last name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label style={labelStyle}>
              First Name <span style={{ color: "#ff6b6b" }}>*</span>
            </label>
            <input
              type="text"
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder="First name"
              required
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Last Name</label>
            <input
              type="text"
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder="Last name"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Row: Email + Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder="email@example.com"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>
              Phone Number <span style={{ color: "#ff6b6b" }}>*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder="+234 800 000 0000"
              required
              style={inputStyle}
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full justify-center mt-2"
          style={{ opacity: loading ? 0.75 : 1 }}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send size={16} />
              Submit Inquiry
            </>
          )}
        </button>
      </form>
    </div>
  );
}
