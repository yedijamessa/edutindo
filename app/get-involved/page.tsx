// app/get-involved/page.tsx
"use client";

import { useState, FormEvent } from "react";

const AREAS = [
  "Volunteer as a mentor / teacher",
  "Help with events & media",
  "Pray regularly for the ministry",
  "Partner as a monthly supporter",
  "Other",
];

export default function GetInvolvedPage() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);

    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone") || "",
      area: formData.get("area") || "",
      linkedin: formData.get("linkedin") || "",
      instagram: formData.get("instagram") || "",
      message: formData.get("message") || "",
    };

    try {
      const res = await fetch("/api/get-involved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to submit form");
      }

      setStatus("success");
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMessage(err.message || "Something went wrong. Please try again.");
    } finally {
      // small delay just so the UI doesn’t flicker
      setTimeout(() => {
        if (status !== "success") setStatus("idle");
      }, 300);
    }
  }

  return (
    <div
      style={{
        padding: "32px 0 64px",
        background: "var(--eti-page-bg)",
        minHeight: "calc(100vh - 64px)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1120,
          margin: "0 auto",
          padding: "0 16px",
          display: "flex",
          flexDirection: "column",
          gap: 32,
        }}
      >
        {/* Hero / Intro */}
        <section
          style={{
            borderRadius: 24,
            padding: "24px 20px 28px",
            background: "var(--eti-card-bg)",
            boxShadow: "0 18px 40px rgba(15, 23, 42, 0.06)",
            border: "1px solid var(--eti-border-subtle)",
          }}
        >
          <h1
            style={{
              fontSize: "2rem",
              lineHeight: 1.2,
              fontWeight: 700,
              color: "var(--eti-text-main)",
              marginBottom: 8,
            }}
          >
            Get Involved with Edutindo
          </h1>
          <p
            style={{
              fontSize: "0.98rem",
              lineHeight: 1.7,
              color: "var(--eti-text-muted)",
              maxWidth: 720,
              marginBottom: 16,
            }}
          >
            There are many ways to serve with Edutindo. Whether you&apos;d like
            to mentor students, help with events, support us in prayer, or
            partner financially, we&apos;d love to hear from you. Share a few
            details and our team will get back to you.
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 16,
              fontSize: "0.85rem",
              color: "var(--eti-text-muted)",
            }}
          >
            <span>📞 Phone / WhatsApp: +44 (example)</span>
            <span>✉️ Email: hello@edutindo.org</span>
            <span>📸 Instagram (optional): @edutindo</span>
          </div>
        </section>

        {/* Form */}
        <section
          style={{
            borderRadius: 24,
            padding: "24px 20px 28px",
            background: "var(--eti-card-bg)",
            boxShadow: "0 18px 40px rgba(15, 23, 42, 0.04)",
            border: "1px solid var(--eti-border-subtle)",
          }}
        >
          <form
            onSubmit={handleSubmit}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 20,
            }}
          >
            {/* Name */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label
                htmlFor="name"
                style={{
                  fontSize: "0.86rem",
                  fontWeight: 600,
                  color: "var(--eti-text-main)",
                }}
              >
                Name <span style={{ color: "#f97316" }}>*</span>
              </label>
              <input
                id="name"
                name="name"
                required
                placeholder="Your full name"
                style={inputStyle}
              />
            </div>

            {/* Email */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label
                htmlFor="email"
                style={{
                  fontSize: "0.86rem",
                  fontWeight: 600,
                  color: "var(--eti-text-main)",
                }}
              >
                Email <span style={{ color: "#f97316" }}>*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                style={inputStyle}
              />
            </div>

            {/* Phone */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label
                htmlFor="phone"
                style={{
                  fontSize: "0.86rem",
                  fontWeight: 600,
                  color: "var(--eti-text-main)",
                }}
              >
                Phone / WhatsApp
              </label>
              <input
                id="phone"
                name="phone"
                placeholder="+44 ..."
                style={inputStyle}
              />
            </div>

            {/* Area */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label
                htmlFor="area"
                style={{
                  fontSize: "0.86rem",
                  fontWeight: 600,
                  color: "var(--eti-text-main)",
                }}
              >
                I&apos;m interested in
              </label>
              <select id="area" name="area" defaultValue="" style={inputStyle}>
                <option value="" disabled>
                  Choose an option
                </option>
                {AREAS.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>

            {/* LinkedIn */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label
                htmlFor="linkedin"
                style={{
                  fontSize: "0.86rem",
                  fontWeight: 600,
                  color: "var(--eti-text-main)",
                }}
              >
                LinkedIn (optional)
              </label>
              <input
                id="linkedin"
                name="linkedin"
                placeholder="https://www.linkedin.com/in/username"
                style={inputStyle}
              />
            </div>

            {/* Instagram */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label
                htmlFor="instagram"
                style={{
                  fontSize: "0.86rem",
                  fontWeight: 600,
                  color: "var(--eti-text-main)",
                }}
              >
                Instagram (optional)
              </label>
              <input
                id="instagram"
                name="instagram"
                placeholder="@username"
                style={inputStyle}
              />
            </div>

            {/* Message – full width */}
            <div
              style={{
                gridColumn: "1 / -1",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <label
                htmlFor="message"
                style={{
                  fontSize: "0.86rem",
                  fontWeight: 600,
                  color: "var(--eti-text-main)",
                }}
              >
                Tell us a bit more
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                placeholder="Share how you’d like to get involved, your skills, availability, or any questions you have."
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  minHeight: 120,
                }}
              />
            </div>

            {/* Status + Button */}
            <div
              style={{
                gridColumn: "1 / -1",
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <button
                type="submit"
                disabled={status === "submitting"}
                style={{
                  padding: "10px 20px",
                  borderRadius: 999,
                  border: "none",
                  background:
                    status === "submitting"
                      ? "linear-gradient(135deg, #9ca3af, #6b7280)"
                      : "linear-gradient(135deg, #2563eb, #22c55e)",
                  color: "#ffffff",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  cursor: status === "submitting" ? "default" : "pointer",
                  boxShadow:
                    "0 10px 25px rgba(37, 99, 235, 0.35), 0 0 0 1px rgba(255,255,255,0.2)",
                  transition: "transform 0.08s ease, box-shadow 0.08s ease",
                }}
              >
                {status === "submitting" ? "Sending..." : "Send my details"}
              </button>

              <div
                style={{
                  fontSize: "0.85rem",
                  color: "var(--eti-text-muted)",
                  minHeight: 20,
                }}
              >
                {status === "success" && (
                  <span style={{ color: "#16a34a" }}>
                    Thank you! We&apos;ve received your details and will get in
                    touch.
                  </span>
                )}
                {status === "error" && (
                  <span style={{ color: "#dc2626" }}>
                    {errorMessage ||
                      "Something went wrong. Please try again later."}
                  </span>
                )}
              </div>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "9px 11px",
  borderRadius: 10,
  border: "1px solid var(--eti-border-subtle)",
  fontSize: "0.9rem",
  outline: "none",
  backgroundColor: "rgba(255,255,255,0.9)",
  color: "var(--eti-text-main)",
  boxSizing: "border-box",
};
