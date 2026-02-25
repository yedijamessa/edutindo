import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";
const RECEIPT_NOTIFICATION_RECIPIENTS = ["hello@edutindo.org", "ymsp@edutindo.org"];

const MAX_RECEIPT_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const receipt = formData.get("receipt");
    const fileCount = formData.getAll("receipt").length;
    const donorName = String(formData.get("donorName") || "").trim();
    const donorEmail = String(formData.get("donorEmail") || "").trim();

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
        { ok: false, error: "Receipt file is too large. Maximum size is 2 MB." },
        { status: 400 }
      );
    }

    if (receipt.type && !ALLOWED_MIME_TYPES.has(receipt.type)) {
      return NextResponse.json(
        { ok: false, error: "Unsupported file type. Please upload PDF or image files." },
        { status: 400 }
      );
    }

    const arrayBuffer = await receipt.arrayBuffer();
    const attachmentBuffer = Buffer.from(arrayBuffer);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const submittedAt = new Date().toISOString();

    await transporter.sendMail({
      from:
        process.env.SMTP_FROM ||
        `"Edutindo Website" <${process.env.SMTP_USER}>`,
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
