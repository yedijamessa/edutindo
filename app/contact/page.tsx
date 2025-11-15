"use client";

import { useState, type FormEvent } from "react";

type Status = "idle" | "submitting" | "success" | "error";

export default function ContactPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send message.");
      }

      setStatus("success");
      form.reset();
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setError(err.message || "Something went wrong. Please try again.");
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
          maxWidth: 960,
          margin: "0 auto",
          padding: "0 16px",
        }}
      >
        <section
          style={{
            borderRadius: 28,
            padding: "28px 22px 30px",
            background: "var(--eti-card-bg)",
            boxShadow: "0 18px 40px rgba(15, 23, 42, 0.06)",
            border: "1px solid var(--eti-border-subtle)",
          }}
        >
          {/* Header */}
          <header
            style={{
              marginBottom: 24,
              textAlign: "left",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "4px 10px",
                borderRadius: 999,
                backgroundColor: "rgba(37, 99, 235, 0.06)",
                border: "1px solid rgba(59, 130, 246, 0.2)",
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background:
                    "conic-gradient(from 180deg at 50% 50%, #0ea5e9, #22c55e, #f97316, #0ea5e9)",
                }}
              />
              <span
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#1d4ed8",
                }}
              >
                Contact Edutindo
              </span>
            </div>

            <h1
              style={{
                fontSize: "1.9rem",
                fontWeight: 700,
                margin: "0 0 6px",
                color: "var(--eti-text-main)",
              }}
            >
              We&apos;d love to hear from you
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: "0.96rem",
                lineHeight: 1.7,
                color: "var(--eti-text-muted)",
                maxWidth: 620,
              }}
            >
              Have questions, testimonies, or want to partner with us? Send us a
              message and we&apos;ll get back to you. Your message will go
              directly to{" "}
              <strong>hello@edutindo.org</strong>.
            </p>
          </header>

          {/* Layout: info + form */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 32,
            }}
          >
            {/* Left: contact info */}
            <div
              style={{
                flex: "0 0 240px",
                minWidth: 220,
                maxWidth: 280,
                paddingRight: 8,
                borderRight: "1px solid rgba(148,163,184,0.35)",
              }}
            >
              <h2
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#64748b",
                  margin: "0 0 8px",
                }}
              >
                Direct Contact
              </h2>
              <p
                style={{
                  fontSize: "0.9rem",
                  lineHeight: 1.6,
                  color: "var(--eti-text-muted)",
                  margin: "0 0 10px",
                }}
              >
                Email us directly.
              </p>
              <p
                style={{
                  fontSize: "0.9rem",
                  lineHeight: 1.6,
                  color: "var(--eti-text-main)",
                  margin: "0 0 4px",
                }}
              >
                <strong>Email</strong>
                <br />
                <a
                  href="mailto:hello@edutindo.org"
                  style={{ color: "#2563eb", textDecoration: "none" }}
                >
                  hello@edutindo.org
                </a>
              </p>
              <p
                style={{
                  fontSize: "0.9rem",
                  lineHeight: 1.6,
                  color: "var(--eti-text-main)",
                  margin: 0,
                }}
              >

              </p>
            </div>

            {/* Right: form */}
            <div
              style={{
                flex: "1 1 260px",
                minWidth: 260,
              }}
            >
              <form
                onSubmit={handleSubmit}
                encType="multipart/form-data"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                {/* Name */}
                <div style={{ gridColumn: "span 1" }}>
                  <label
                    htmlFor="name"
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      marginBottom: 4,
                      color: "var(--eti-text-main)",
                    }}
                  >
                    Name<span style={{ color: "#e11d48" }}> *</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    required
                    autoComplete="name"
                    style={{
                      width: "100%",
                      borderRadius: 10,
                      border: "1px solid var(--eti-border-subtle)",
                      padding: "8px 10px",
                      fontSize: "0.9rem",
                      backgroundColor: "var(--eti-card-bg)",
                      color: "var(--eti-text-main)",
                      outline: "none",
                    }}
                  />
                </div>

                {/* Email */}
                <div style={{ gridColumn: "span 1" }}>
                  <label
                    htmlFor="email"
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      marginBottom: 4,
                      color: "var(--eti-text-main)",
                    }}
                  >
                    Email<span style={{ color: "#e11d48" }}> *</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    style={{
                      width: "100%",
                      borderRadius: 10,
                      border: "1px solid var(--eti-border-subtle)",
                      padding: "8px 10px",
                      fontSize: "0.9rem",
                      backgroundColor: "var(--eti-card-bg)",
                      color: "var(--eti-text-main)",
                      outline: "none",
                    }}
                  />
                </div>

                {/* Subject – full row */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label
                    htmlFor="subject"
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      marginBottom: 4,
                      color: "var(--eti-text-main)",
                    }}
                  >
                    Subject
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    placeholder="Testimony, partnership, question, etc."
                    style={{
                      width: "100%",
                      borderRadius: 10,
                      border: "1px solid var(--eti-border-subtle)",
                      padding: "8px 10px",
                      fontSize: "0.9rem",
                      backgroundColor: "var(--eti-card-bg)",
                      color: "var(--eti-text-main)",
                      outline: "none",
                    }}
                  />
                </div>

                {/* Message – full row */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label
                    htmlFor="message"
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      marginBottom: 4,
                      color: "var(--eti-text-main)",
                    }}
                  >
                    Message<span style={{ color: "#e11d48" }}> *</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    style={{
                      width: "100%",
                      borderRadius: 10,
                      border: "1px solid var(--eti-border-subtle)",
                      padding: "8px 10px",
                      fontSize: "0.9rem",
                      backgroundColor: "var(--eti-card-bg)",
                      color: "var(--eti-text-main)",
                      resize: "vertical",
                      outline: "none",
                    }}
                  />
                </div>

                {/* Attachment + helper text */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label
                    htmlFor="attachment"
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      marginBottom: 4,
                      color: "var(--eti-text-main)",
                    }}
                  >
                    Attach a document (optional)
                  </label>
                  <input
                    id="attachment"
                    name="attachment"
                    type="file"
                    style={{
                      fontSize: "0.85rem",
                    }}
                  />
                  <p
                    style={{
                      fontSize: "0.78rem",
                      color: "var(--eti-text-muted)",
                      marginTop: 4,
                    }}
                  >
                    You can attach PDFs, images, or Word documents (e.g. proposal,
                    testimony, or supporting files).
                  </p>
                </div>

                {/* Status messages */}
                {status === "success" && (
                  <div
                    style={{
                      gridColumn: "1 / -1",
                      fontSize: "0.85rem",
                      padding: "8px 10px",
                      borderRadius: 8,
                      backgroundColor: "rgba(22, 163, 74, 0.08)",
                      border: "1px solid rgba(22, 163, 74, 0.4)",
                      color: "#166534",
                    }}
                  >
                    Thank you! Your message has been sent.
                  </div>
                )}

                {status === "error" && (
                  <div
                    style={{
                      gridColumn: "1 / -1",
                      fontSize: "0.85rem",
                      padding: "8px 10px",
                      borderRadius: 8,
                      backgroundColor: "rgba(248, 113, 113, 0.08)",
                      border: "1px solid rgba(248, 113, 113, 0.6)",
                      color: "#b91c1c",
                    }}
                  >
                    {error || "Something went wrong. Please try again."}
                  </div>
                )}

                {/* Submit button */}
                <div
                  style={{
                    gridColumn: "1 / -1",
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: 4,
                  }}
                >
                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    style={{
                      borderRadius: 999,
                      padding: "9px 18px",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      border: "none",
                      cursor: status === "submitting" ? "default" : "pointer",
                      background:
                        "linear-gradient(135deg, #2563eb, #0ea5e9, #22c55e)",
                      color: "#f9fafb",
                      boxShadow: "0 10px 25px rgba(37, 99, 235, 0.35)",
                      opacity: status === "submitting" ? 0.7 : 1,
                    }}
                  >
                    {status === "submitting" ? "Sending..." : "Send message"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
