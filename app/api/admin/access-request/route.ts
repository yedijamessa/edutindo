import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

const ADMIN_NOTIFICATION_RECIPIENTS = ["admin@edutindo.org", "it@edutindo.org"];

type SmtpCandidate = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
};

function getSmtpConfig() {
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
  const secureRaw = process.env.AUTH_SMTP_SECURE || process.env.SMTP_SECURE || "auto";
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
    (user ? `Edutindo <${user}>` : undefined);
  const fallbackPortsRaw = process.env.AUTH_SMTP_FALLBACK_PORTS || "465,587,2525";

  return { host, port, secureRaw, user, pass, from, fallbackPortsRaw };
}

function parsePortList(input: string) {
  return Array.from(
    new Set(
      input
        .split(",")
        .map((segment) => Number(segment.trim()))
        .filter((value) => Number.isInteger(value) && value > 0)
    )
  );
}

function buildSmtpCandidates(): SmtpCandidate[] {
  const smtp = getSmtpConfig();

  if (!smtp.host || !smtp.user || !smtp.pass || !smtp.from) {
    throw new Error("SMTP is not configured.");
  }

  const secureOverride = smtp.secureRaw.toLowerCase();
  const shouldAutoDetectTls = secureOverride !== "true" && secureOverride !== "false";
  const secureValue = secureOverride === "true";
  const ports = Array.from(new Set([smtp.port, ...parsePortList(smtp.fallbackPortsRaw)]));

  return ports.map((port) => ({
    host: smtp.host as string,
    port,
    secure: shouldAutoDetectTls ? port === 465 : secureValue,
    user: smtp.user as string,
    pass: smtp.pass as string,
    from: smtp.from as string,
  }));
}

function recipientMatches(list: unknown[], email: string) {
  return list.some((entry) => String(entry).toLowerCase().includes(email.toLowerCase()));
}

export async function POST() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ ok: false, error: "Please sign in first." }, { status: 401 });
    }

    const candidates = buildSmtpCandidates();
    let lastError: unknown = null;

    for (const smtp of candidates) {
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

        const info = await transporter.sendMail({
          from: smtp.from,
          to: ADMIN_NOTIFICATION_RECIPIENTS,
          replyTo: user.email,
          subject: `Portal access request from ${user.firstName || user.email}`,
          text:
            "A user requested portal access release.\n\n" +
            `Name: ${`${user.firstName} ${user.lastName}`.trim() || "Unknown"}\n` +
            `Email: ${user.email}\n` +
            `User ID: ${user.id}\n` +
            `Current portals: ${user.portals.join(", ") || "None"}\n\n` +
            "Please review this account and grant the appropriate portal access.",
          html: `
            <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;">
              <h2 style="margin:0 0 12px;">Portal access request</h2>
              <p style="margin:0 0 12px;">A user requested admin release for portal access.</p>
              <p style="margin:0 0 6px;"><strong>Name:</strong> ${`${user.firstName} ${user.lastName}`.trim() || "Unknown"}</p>
              <p style="margin:0 0 6px;"><strong>Email:</strong> ${user.email}</p>
              <p style="margin:0 0 6px;"><strong>User ID:</strong> ${user.id}</p>
              <p style="margin:0 0 16px;"><strong>Current portals:</strong> ${user.portals.join(", ") || "None"}</p>
              <p style="margin:0;">Please review this account and grant the appropriate portal access.</p>
            </div>
          `,
        });

        const accepted = (info.accepted ?? []).map(String);
        const rejected = (info.rejected ?? []).map(String);
        const allAccepted = ADMIN_NOTIFICATION_RECIPIENTS.every((email) => recipientMatches(accepted, email));
        const anyRejected = ADMIN_NOTIFICATION_RECIPIENTS.some((email) => recipientMatches(rejected, email));

        if (!allAccepted || anyRejected) {
          throw new Error(
            `Recipient not accepted by SMTP server. accepted=${accepted.join(",")} rejected=${rejected.join(",")} response=${info.response ?? ""}`
          );
        }

        return NextResponse.json({
          ok: true,
          message: `Notification sent to ${ADMIN_NOTIFICATION_RECIPIENTS.join(" and ")}.`,
        });
      } catch (error) {
        lastError = error;
        console.warn(
          `[admin-access-request] send failed via ${smtp.host}:${smtp.port} secure=${smtp.secure}`,
          error
        );
      }
    }

    console.error("[admin-access-request] all SMTP candidates failed:", lastError);

    return NextResponse.json(
      {
        ok: false,
        error: "Failed to send notification email. Please check SMTP settings or try again.",
      },
      { status: 500 }
    );
  } catch (error) {
    console.error("[admin-access-request] unexpected error:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Unable to send admin notification right now.",
      },
      { status: 500 }
    );
  }
}
