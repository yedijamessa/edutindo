import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";
const RECEIPT_NOTIFICATION_RECIPIENTS = ["hello@edutindo.org", "ymsp@edutindo.org"];

const MAX_RECEIPT_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB
const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);
const ALLOWED_EXTENSIONS = new Set(["pdf", "jpg", "jpeg", "png", "webp", "heic", "heif"]);

type SmtpCandidate = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
};

const getFileExtension = (fileName: string) => {
  const parts = fileName.toLowerCase().split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "";
};

const parsePortList = (input: string) =>
  Array.from(
    new Set(
      input
        .split(",")
        .map((segment) => Number(segment.trim()))
        .filter((value) => Number.isInteger(value) && value > 0)
    )
  );

const buildSmtpCandidates = (): SmtpCandidate[] => {
  const host =
    process.env.AUTH_SMTP_HOST ||
    process.env.MAILEROO_SMTP_HOST ||
    process.env.SMTP_HOST;
  const port = Number(
    process.env.AUTH_SMTP_PORT ||
      process.env.MAILEROO_SMTP_PORT ||
      process.env.SMTP_PORT ||
      587
  );
  const secureRaw = (process.env.AUTH_SMTP_SECURE || process.env.SMTP_SECURE || "auto").toLowerCase();
  const user =
    process.env.AUTH_SMTP_USER ||
    process.env.MAILEROO_USER ||
    process.env.SMTP_USER;
  const pass =
    process.env.AUTH_SMTP_PASS ||
    process.env.MAILEROO_PASS ||
    process.env.SMTP_PASS;
  const from =
    process.env.AUTH_SMTP_FROM ||
    process.env.SMTP_FROM ||
    (user ? `"Edutindo Website" <${user}>` : undefined);
  const fallbackPortsRaw = process.env.AUTH_SMTP_FALLBACK_PORTS || "465,587,2525";

  if (!host || !user || !pass || !from) return [];

  const shouldAutoDetectTls = secureRaw !== "true" && secureRaw !== "false";
  const secureValue = secureRaw === "true";
  const ports = Array.from(new Set([port, ...parsePortList(fallbackPortsRaw)]));

  return ports.map((candidatePort) => ({
    host,
    port: candidatePort,
    secure: shouldAutoDetectTls ? candidatePort === 465 : secureValue,
    user,
    pass,
    from,
  }));
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const receipt = formData.get("receipt");
    const fileCount = formData.getAll("receipt").length;
    const donorName = String(formData.get("donorName") || "").trim();
    const donorEmail = String(formData.get("donorEmail") || "").trim();
    const captchaToken = String(formData.get("captchaToken") || "").trim();
    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;

    if (turnstileSecret) {
      if (!captchaToken) {
        return NextResponse.json(
          { ok: false, error: "Please complete the captcha before uploading your receipt." },
          { status: 400 }
        );
      }

      const remoteIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";
      const verifyPayload = new URLSearchParams();
      verifyPayload.set("secret", turnstileSecret);
      verifyPayload.set("response", captchaToken);
      if (remoteIp) verifyPayload.set("remoteip", remoteIp);

      const verifyResponse = await fetch(TURNSTILE_VERIFY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: verifyPayload.toString(),
        cache: "no-store",
      });
      const verifyData = (await verifyResponse.json().catch(() => null)) as
        | { success?: boolean }
        | null;

      if (!verifyResponse.ok || !verifyData?.success) {
        return NextResponse.json(
          { ok: false, error: "Captcha verification failed. Please retry and upload again." },
          { status: 400 }
        );
      }
    }

    if (!(receipt instanceof File) || receipt.size <= 0) {
      return NextResponse.json(
        { ok: false, error: "Please attach a receipt file first." },
        { status: 400 }
      );
    }

    if (fileCount !== 1) {
      return NextResponse.json(
        { ok: false, error: "Please upload exactly one receipt file." },
        { status: 400 }
      );
    }

    if (receipt.size > MAX_RECEIPT_SIZE_BYTES) {
      return NextResponse.json(
        { ok: false, error: "Receipt file is too large. Maximum size is 8 MB." },
        { status: 400 }
      );
    }

    const extension = getFileExtension(receipt.name);
    const hasAllowedMimeType = receipt.type ? ALLOWED_MIME_TYPES.has(receipt.type) : false;
    const hasAllowedExtension = extension ? ALLOWED_EXTENSIONS.has(extension) : false;

    if (!hasAllowedMimeType && !hasAllowedExtension) {
      return NextResponse.json(
        { ok: false, error: "Unsupported file type. Please upload PDF or image files." },
        { status: 400 }
      );
    }

    const arrayBuffer = await receipt.arrayBuffer();
    const attachmentBuffer = Buffer.from(arrayBuffer);
    const smtpCandidates = buildSmtpCandidates();

    if (smtpCandidates.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Receipt upload email is not configured yet. Please send your receipt to our WhatsApp contact while we fix this.",
        },
        { status: 503 }
      );
    }

    const submittedAt = new Date().toISOString();
    let lastMailError: unknown = null;

    for (const smtp of smtpCandidates) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtp.host,
          port: smtp.port,
          secure: smtp.secure,
          auth: {
            user: smtp.user,
            pass: smtp.pass,
          },
        });

        await transporter.sendMail({
          from: smtp.from,
          to: RECEIPT_NOTIFICATION_RECIPIENTS,
          replyTo: donorEmail || undefined,
          subject: "New donation receipt uploaded",
          text: `A new donation receipt has been uploaded from the website.

Submitted at: ${submittedAt}
Donor name: ${donorName || "Not provided"}
Donor email: ${donorEmail || "Not provided"}
File name: ${receipt.name}
File type: ${receipt.type || "Unknown"}
File size: ${receipt.size} bytes
`,
          attachments: [
            {
              filename: receipt.name,
              content: attachmentBuffer,
              contentType: receipt.type || undefined,
            },
          ],
        });

        lastMailError = null;
        break;
      } catch (mailError) {
        lastMailError = mailError;
        console.error(
          `Donation receipt SMTP attempt failed (${smtp.host}:${smtp.port}, secure=${smtp.secure}):`,
          mailError
        );
      }
    }

    if (lastMailError) {
      throw lastMailError;
    }

    return NextResponse.json({
      ok: true,
      message: "Receipt received. Our team has been notified.",
    });
  } catch (error) {
    console.error("Donation receipt upload error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to submit receipt. Please try again." },
      { status: 500 }
    );
  }
}
