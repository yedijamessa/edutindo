"use client";

import { useRef, useState, type FormEvent } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  HandHeart,
  Handshake,
  Instagram,
  Linkedin,
  LoaderCircle,
  Mail,
  MailOpen,
  Presentation,
  Sun,
} from "lucide-react";
import styles from "./contact.module.css";

const CONTRIBUTIONS = [
  {
    title: "Teaching & Mentoring",
    description:
      "Share your skills, time, and expertise to empower students and teachers.",
    area: "Help with teaching",
    icon: Presentation,
    color: "orange",
  },
  {
    title: "Partnerships",
    description:
      "Collaborate with us on programs, events, or long-term initiatives.",
    area: "Contribute to campaign & events",
    icon: Handshake,
    color: "blue",
  },
  {
    title: "Giving & Sponsorship",
    description:
      "Support our mission financially and help us reach more communities.",
    area: "Partner financially",
    icon: HandHeart,
    color: "cyan",
  },
] as const;

const CONTACT_CHANNELS = [
  {
    title: "Email Us",
    description: "For general inquiries and collaboration.",
    value: "hello@edutindo.org",
    href: "mailto:hello@edutindo.org",
    icon: Mail,
    color: "orange",
    external: false,
  },
  {
    title: "Follow Us",
    description: "See our latest updates and stories.",
    value: "@edutindo",
    href: "https://www.instagram.com/edutindo/",
    icon: Instagram,
    color: "pink",
    external: true,
  },
  {
    title: "Connect on LinkedIn",
    description: "Let’s build a stronger education community.",
    value: "linkedin.com/company/edutindo",
    href: "https://www.linkedin.com/company/edutindo/",
    icon: Linkedin,
    color: "blue",
    external: true,
  },
] as const;

type Status = "idle" | "submitting" | "success" | "error";
const CONTACT_AREAS = [
  "Help with teaching",
  "Contribute to campaign & events",
  "Partner financially",
  "Other",
];

export default function ContactPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [area, setArea] = useState("");
  const formCardRef = useRef<HTMLDivElement>(null);
  const areaRef = useRef<HTMLSelectElement>(null);

  const chooseArea = (value: string) => {
    setArea(value);
    areaRef.current?.focus({ preventScroll: true });
    if (window.matchMedia("(max-width: 899px)").matches) {
      formCardRef.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start",
      });
    }
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const area = String(formData.get("area") || "").trim();
    const linkedin = String(formData.get("linkedin") || "").trim();
    const instagram = String(formData.get("instagram") || "").trim();
    const detailMessage = String(formData.get("message") || "").trim();

    const messageSections = [
      `Area of interest: ${area || "Not provided"}`,
      `LinkedIn: ${linkedin || "Not provided"}`,
      `Instagram: ${instagram || "Not provided"}`,
      "",
      "Details:",
      detailMessage,
    ];

    const payload = new FormData();
    payload.append("name", name);
    payload.append("email", email);
    payload.append("subject", "New get involved enquiry");
    payload.append("message", messageSections.join("\n"));

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        body: payload,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send message.");
      }

      setStatus("success");
      form.reset();
      setArea("");
    } catch (err: unknown) {
      console.error(err);
      setStatus("error");
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    }
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="contact-heading">
        <div className={styles.landscape} aria-hidden="true" />
        <Sun
          className={styles.sun}
          size={76}
          strokeWidth={1.1}
          aria-hidden="true"
        />
        <div className={`${styles.container} ${styles.heroGrid}`}>
          <div className={styles.intro}>
            <p className={styles.eyebrow}>Be part of the change</p>
            <h1 id="contact-heading">
              Get Involved
              <br />
              with Edutindo
            </h1>
            <p className={styles.lead}>
              There are many ways to support the vision. Whether you’d like to
              help teaching, contribute to our programs and events, or partner
              financially, we’d love to hear from you. Let us know how you would
              like to contribute and we will reach out.
            </p>
            <div
              className={styles.contributions}
              role="group"
              aria-label="Ways to get involved"
            >
              {CONTRIBUTIONS.map(
                ({ title, description, area: value, icon: Icon, color }) => (
                  <button
                    key={title}
                    type="button"
                    className={`${styles.contribution} ${styles[color]}`}
                    onClick={() => chooseArea(value)}
                    aria-pressed={area === value}
                    aria-controls="contact-interest"
                    disabled={status === "submitting"}
                  >
                    <span className={styles.contributionIcon}>
                      <Icon size={39} strokeWidth={1.35} aria-hidden="true" />
                    </span>
                    <span className={styles.contributionCopy}>
                      <span className={styles.contributionTitle}>{title}</span>
                      <span className={styles.contributionDescription}>
                        {description}
                      </span>
                    </span>
                    <span className={styles.contributionArrow}>
                      <ArrowRight size={20} aria-hidden="true" />
                    </span>
                  </button>
                ),
              )}
            </div>
          </div>
          <div ref={formCardRef} className={styles.formCard}>
            <span className={styles.formRays} aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <h2>Send Us a Message</h2>
            <p className={styles.formIntro}>
              Tell us how you’d like to get involved, your skills, availability,
              or any questions. Our team will reach out to you soon.
            </p>
            <form
              onSubmit={handleSubmit}
              className={styles.form}
              aria-label="Get involved contact form"
              aria-busy={status === "submitting"}
            >
              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label htmlFor="contact-name">
                    Name <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    autoComplete="name"
                    required
                    placeholder="Your full name"
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="contact-email">
                    Email <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div className={styles.field}>
                <label htmlFor="contact-interest">I’m interested in</label>
                <select
                  id="contact-interest"
                  ref={areaRef}
                  name="area"
                  value={area}
                  onChange={(event) => setArea(event.target.value)}
                >
                  <option value="" disabled>
                    Choose an option
                  </option>
                  {CONTACT_AREAS.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label htmlFor="contact-linkedin">LinkedIn (optional)</label>
                  <input
                    id="contact-linkedin"
                    name="linkedin"
                    inputMode="url"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="contact-instagram">
                    Instagram (optional)
                  </label>
                  <input
                    id="contact-instagram"
                    name="instagram"
                    placeholder="@username"
                  />
                </div>
              </div>
              <div className={styles.field}>
                <label htmlFor="contact-message">
                  Tell us a bit more <span aria-hidden="true">*</span>
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={4}
                  required
                  placeholder="Share how you’d like to get involved, your skills, availability, or any questions."
                />
              </div>
              {status === "success" && (
                <div className={styles.success} role="status">
                  <CheckCircle2 size={19} aria-hidden="true" />
                  <p>
                    Thank you! We’ve received your details and will get in
                    touch.
                  </p>
                </div>
              )}
              {status === "error" && (
                <div className={styles.error} role="alert">
                  <AlertCircle size={19} aria-hidden="true" />
                  <p>{error || "Something went wrong. Please try again."}</p>
                </div>
              )}
              <button
                type="submit"
                className={styles.submit}
                disabled={status === "submitting"}
              >
                {status === "submitting" && (
                  <LoaderCircle
                    className={styles.spinner}
                    size={18}
                    aria-hidden="true"
                  />
                )}
                {status === "submitting" ? "Sending..." : "Send my details"}
              </button>
              <p className={styles.formNote}>
                <MailOpen size={14} aria-hidden="true" /> We’ll get back to you
                as soon as possible.
              </p>
            </form>
          </div>
        </div>
      </section>
      <section
        className={styles.quickContact}
        aria-labelledby="quick-contact-heading"
      >
        <div className={styles.container}>
          <p className={styles.quickEyebrow}>Quick contact</p>
          <h2 id="quick-contact-heading">Other Ways to Reach Us</h2>
          <p className={styles.quickIntro}>
            Prefer to connect directly? You can also reach us through the
            following channels.
            <br className={styles.desktopBreak} /> Tell us how you’d like to
            contribute and our team will reach out.
          </p>
          <div className={styles.contactChannels}>
            {CONTACT_CHANNELS.map(
              ({
                title,
                description,
                value,
                href,
                icon: Icon,
                color,
                external,
              }) => (
                <a
                  key={title}
                  href={href}
                  className={`${styles.contactChannel} ${styles[color]}`}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                >
                  <span className={styles.channelIcon}>
                    <Icon size={30} strokeWidth={1.7} aria-hidden="true" />
                  </span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <span className={styles.contactValue}>{value}</span>
                </a>
              ),
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
