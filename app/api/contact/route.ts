import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const name = String(formData.get("name") || "");
    const email = String(formData.get("email") || "");
    const subject =
      String(formData.get("subject") || "") ||
      "New message from Edutindo contact form";
    const message = String(formData.get("message") || "");
    const file = formData.get("attachment");

    if (!name || !email || !message) {
      return NextResponse.json(
        { ok: false, error: "Please fill in name, email, and message." },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,          // smtp.gmail.com
      port: Number(process.env.SMTP_PORT),  // 587
      secure: process.env.SMTP_SECURE === "true", // false
      auth: {
        user: process.env.SMTP_USER,        // hello@edutindo.org
        pass: process.env.SMTP_PASS,        // app password
      },
    });

    const attachments: { filename: string; content: Buffer }[] = [];

    if (file && file instanceof File && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      attachments.push({
        filename: file.name,
        content: buffer,
      });
    }

    await transporter.sendMail({
      from:
        process.env.SMTP_FROM ||
        `"Edutindo Website" <${process.env.SMTP_USER}>`,
      to: "hello@edutindo.org",
      replyTo: email,
      subject,
      text: `New message from Edutindo contact page

Name: ${name}
Email: ${email}

Message:
${message}
`,
      attachments,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json(
      { ok: false, error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
