"use strict";

/**
 * Email notification service — powered by Resend
 *
 * Setup:
 *   1. npm install resend
 *   2. Add to .env:
 *        RESEND_API_KEY=re_xxxxxxxxxxxx
 *        NOTIFICATION_EMAIL=hello@yourdomain.com   ← where to send alerts
 *        EMAIL_FROM=NaijaRealty <notifications@yourdomain.com>
 *
 * The notification email and from address can also be stored in the
 * Settings collection (keys: notification_email, email_from) so the
 * site owner can update them from the admin panel without redeploying.
 */

const { Resend } = require("resend");

// Lazy-init so the server still starts even if RESEND_API_KEY is missing
let _resend = null;
function getResend() {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set in environment variables");
    }
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Resolve the admin notification address.
 * Prefers the DB setting (passed in), falls back to env, then a hard default.
 */
function resolveNotificationEmail(settingValue) {
  return (
    settingValue ||
    process.env.NOTIFICATION_EMAIL ||
    process.env.ADMIN_EMAIL ||
    null
  );
}

function resolveFromAddress(settingValue) {
  return (
    settingValue ||
    process.env.EMAIL_FROM ||
    "NaijaRealty <onboarding@resend.dev>" // Resend sandbox sender (works before domain verified)
  );
}

// ── Email Templates ────────────────────────────────────────────────────────

function buildEnquiryEmailHtml(enquiry) {
  const {
    first_name,
    last_name,
    email,
    phone,
    inquiry_type,
    property_type,
    budget,
    preferred_location,
    message,
    listing_type,
    source,
    createdAt,
  } = enquiry;

  const fullName = [first_name, last_name].filter(Boolean).join(" ");
  const submittedAt = new Date(createdAt || Date.now()).toLocaleString(
    "en-NG",
    { timeZone: "Africa/Lagos", dateStyle: "full", timeStyle: "short" },
  );

  const row = (label, value) =>
    value
      ? `<tr>
          <td style="padding:8px 12px;font-weight:600;color:#475569;width:160px;white-space:nowrap;border-bottom:1px solid #f1f5f9;">${label}</td>
          <td style="padding:8px 12px;color:#0f172a;border-bottom:1px solid #f1f5f9;">${value}</td>
        </tr>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Enquiry — NaijaRealty</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Inter,Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);padding:28px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="display:inline-block;background:linear-gradient(135deg,#ff6b6b,#e85555);border-radius:8px;width:36px;height:36px;line-height:36px;text-align:center;vertical-align:middle;margin-right:10px;">
                      <span style="color:white;font-size:18px;">🏠</span>
                    </div>
                    <span style="color:white;font-size:20px;font-weight:800;vertical-align:middle;">NaijaRealty</span>
                  </td>
                  <td align="right">
                    <span style="background:rgba(255,107,107,0.2);color:#ff6b6b;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;">NEW ENQUIRY</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Alert bar -->
          <tr>
            <td style="background:#ff6b6b;padding:12px 32px;">
              <p style="margin:0;color:white;font-size:14px;font-weight:600;">
                📩 You have a new property enquiry from <strong>${fullName}</strong>
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">

              <h2 style="margin:0 0 4px;font-size:22px;color:#0f172a;">Enquiry Details</h2>
              <p style="margin:0 0 24px;color:#94a3b8;font-size:13px;">Submitted on ${submittedAt} via ${source || "website"}</p>

              <!-- Contact info -->
              <h3 style="margin:0 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;font-weight:600;">Contact Information</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:24px;">
                ${row("Full Name", fullName)}
                ${row("Phone", `<a href="tel:${phone}" style="color:#ff6b6b;text-decoration:none;">${phone}</a>`)}
                ${row("Email", email ? `<a href="mailto:${email}" style="color:#ff6b6b;text-decoration:none;">${email}</a>` : "")}
              </table>

              <!-- Property preferences -->
              <h3 style="margin:0 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;font-weight:600;">Property Preferences</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:24px;">
                ${row("Inquiry Type", inquiry_type)}
                ${row("Property Type", property_type)}
                ${row("Budget", budget)}
                ${row("Preferred Location", preferred_location)}
                ${row("Listing Type", listing_type)}
              </table>

              <!-- Message -->
              ${
                message
                  ? `<h3 style="margin:0 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;font-weight:600;">Message</h3>
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:24px;">
                  <p style="margin:0;color:#334155;font-size:14px;line-height:1.6;">${message.replace(/\n/g, "<br/>")}</p>
                </div>`
                  : ""
              }

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <a href="tel:${phone}" style="display:inline-block;background:linear-gradient(135deg,#ff6b6b,#e85555);color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;margin-right:12px;">
                      📞 Call ${first_name}
                    </a>
                    ${
                      email
                        ? `<a href="mailto:${email}" style="display:inline-block;background:#0f172a;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
                      ✉️ Reply by Email
                    </a>`
                        : ""
                    }
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
                This notification was sent automatically by NaijaRealty CMS.<br/>
                Log in to your <strong>admin dashboard</strong> to view and manage all enquiries.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

function buildEnquiryEmailText(enquiry) {
  const {
    first_name,
    last_name,
    email,
    phone,
    inquiry_type,
    property_type,
    budget,
    preferred_location,
    message,
    source,
  } = enquiry;

  const fullName = [first_name, last_name].filter(Boolean).join(" ");

  return [
    "NEW ENQUIRY — NaijaRealty CMS",
    "================================",
    "",
    `Name:               ${fullName}`,
    `Phone:              ${phone}`,
    email ? `Email:              ${email}` : null,
    "",
    `Inquiry Type:       ${inquiry_type || "—"}`,
    `Property Type:      ${property_type || "—"}`,
    `Budget:             ${budget || "—"}`,
    `Preferred Location: ${preferred_location || "—"}`,
    "",
    message ? `Message:\n${message}` : null,
    "",
    `Source: ${source || "website"}`,
    `Time:   ${new Date().toLocaleString("en-NG", { timeZone: "Africa/Lagos" })}`,
  ]
    .filter((l) => l !== null)
    .join("\n");
}

// ── Main export ────────────────────────────────────────────────────────────

/**
 * Send a new-enquiry notification email to the site admin.
 *
 * @param {object} enquiry  — the saved Mongoose document or plain object
 * @param {object} [settings] — key-value settings from DB (notification_email, email_from, site_name)
 * @returns {Promise<void>}  — resolves quietly; never throws (logs warning on failure)
 */
async function sendEnquiryNotification(enquiry, settings = {}) {
  const to = resolveNotificationEmail(settings.notification_email);

  if (!to) {
    console.warn(
      "[Email] No notification_email configured — skipping enquiry email. " +
        "Set NOTIFICATION_EMAIL env var or add notification_email to Site Settings.",
    );
    return;
  }

  const from = resolveFromAddress(settings.email_from);
  const siteName = settings.site_name || process.env.SITE_NAME || "NaijaRealty";
  const firstName = enquiry.first_name || "Someone";

  try {
    const resend = getResend();
    const result = await resend.emails.send({
      from,
      to: [to],
      subject: `🏠 New Enquiry from ${firstName} — ${siteName}`,
      html: buildEnquiryEmailHtml(enquiry),
      text: buildEnquiryEmailText(enquiry),
      tags: [
        { name: "category", value: "enquiry_notification" },
        { name: "source", value: enquiry.source || "website" },
      ],
    });

    if (result.error) {
      console.error("[Email] Resend API error:", result.error);
    } else {
      console.log(
        `[Email] Enquiry notification sent → ${to} (id: ${result.data?.id})`,
      );
    }
  } catch (err) {
    // Never let email failure break the enquiry submission
    console.error("[Email] Failed to send enquiry notification:", err.message);
  }
}

module.exports = { sendEnquiryNotification };
