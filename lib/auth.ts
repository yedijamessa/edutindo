import "server-only";

import { createHash, pbkdf2Sync, randomBytes, randomInt, randomUUID, timingSafeEqual } from "crypto";
import nodemailer from "nodemailer";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sql } from "@vercel/postgres";
import { PORTAL_OPTIONS, SESSION_COOKIE_NAME, type PortalKey } from "@/lib/auth-shared";

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  isAdmin: boolean;
  portals: PortalKey[];
  createdAt: Date;
}

type AuthUserRow = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  password_hash: string | null;
  email_verified: boolean;
  email_verified_at: Date | null;
  is_admin: boolean;
  created_at: Date;
};

type AuthEmailVerificationRow = {
  id: number;
  user_id: string;
  email: string;
  expires_at: Date;
};

type AuthAdminOtpRow = {
  id: number;
  otp_hash: string;
  attempts: number;
  expires_at: Date;
};

type SmtpCandidate = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
};

const ADMIN_ALLOWLIST = new Set(
  [
    "aari@edutindo.org",
    "admin@edutindo.org",
    "finance@edutindo.org",
    "hello@edutindo.org",
    "it@edutindo.org",
    "legal@edutindo.org",
    "pram@edutindo.org",
    "schy@edutindo.org",
    "ymsp@edutindo.org",
  ].map((email) => email.toLowerCase())
);

const SESSION_MAX_DAYS = Number(process.env.AUTH_SESSION_MAX_DAYS ?? 14);
const SESSION_MAX_SECONDS = SESSION_MAX_DAYS * 24 * 60 * 60;
const AUTH_SECRET = process.env.AUTH_SECRET || "change-this-auth-secret";
const DEMO_PORTAL_CODE = process.env.DEMO_PORTAL_CODE ?? "123456";
const DEMO_ACCESS_MAX_DAYS = Number(process.env.DEMO_ACCESS_MAX_DAYS ?? 7);
const DEMO_ACCESS_MAX_SECONDS = DEMO_ACCESS_MAX_DAYS * 24 * 60 * 60;
const EMAIL_VERIFICATION_EXPIRES_HOURS = Number(process.env.AUTH_EMAIL_VERIFICATION_EXPIRES_HOURS ?? 24);
const PASSWORD_MIN_LENGTH = Number(process.env.AUTH_PASSWORD_MIN_LENGTH ?? 8);
const PASSWORD_HASH_ITERATIONS = Number(process.env.AUTH_PASSWORD_HASH_ITERATIONS ?? 120000);
const ADMIN_OTP_EXPIRES_MINUTES = Number(process.env.AUTH_ADMIN_OTP_EXPIRES_MINUTES ?? 10);
const ADMIN_OTP_MAX_ATTEMPTS = Number(process.env.AUTH_ADMIN_OTP_MAX_ATTEMPTS ?? 5);
const ADMIN_OTP_RESEND_COOLDOWN_SECONDS = Number(process.env.AUTH_ADMIN_OTP_RESEND_COOLDOWN_SECONDS ?? 30);
const PORTAL_SET = new Set<string>(PORTAL_OPTIONS);
export const DEMO_ACCESS_COOKIE_NAME = "edutindo_demo_portal_access";

let authSchemaReady: Promise<void> | null = null;

export class AuthError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function normalizeEmail(input: string) {
  return input.trim().toLowerCase();
}

export function isValidEmail(input: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
}

function isAllowlistedAdmin(email: string) {
  return ADMIN_ALLOWLIST.has(email);
}

function sanitizeName(value: string, field: "first name" | "last name") {
  const cleaned = value.trim();
  if (!cleaned) {
    throw new AuthError(400, "INVALID_NAME", `Please enter your ${field}.`);
  }

  if (cleaned.length > 80) {
    throw new AuthError(400, "INVALID_NAME", `${field[0].toUpperCase()}${field.slice(1)} is too long.`);
  }

  return cleaned;
}

function validatePassword(password: string) {
  if (password.length < PASSWORD_MIN_LENGTH) {
    throw new AuthError(
      400,
      "WEAK_PASSWORD",
      `Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`
    );
  }

  if (password.length > 128) {
    throw new AuthError(400, "WEAK_PASSWORD", "Password is too long.");
  }
}

function hashSessionToken(token: string) {
  return createHash("sha256").update(`${AUTH_SECRET}:session:${token}`).digest("hex");
}

function hashDemoAccessCode(code: string) {
  return createHash("sha256").update(`${AUTH_SECRET}:demo-access:${code}`).digest("hex");
}

function hasValidDemoAccessToken(token: string | null | undefined) {
  if (!token) return false;
  return token === hashDemoAccessCode(DEMO_PORTAL_CODE);
}

function hashEmailVerificationToken(token: string) {
  return createHash("sha256").update(`${AUTH_SECRET}:verify-email:${token}`).digest("hex");
}

function hashAdminOtp(email: string, code: string) {
  return createHash("sha256").update(`${AUTH_SECRET}:admin-otp:${email}:${code}`).digest("hex");
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, PASSWORD_HASH_ITERATIONS, 64, "sha512").toString("hex");
  return `pbkdf2_sha512$${PASSWORD_HASH_ITERATIONS}$${salt}$${hash}`;
}

function verifyPassword(password: string, storedHash: string) {
  const [algorithm, iterationText, salt, expectedHashHex] = storedHash.split("$");

  if (algorithm !== "pbkdf2_sha512") return false;

  const iterations = Number(iterationText);
  if (!Number.isInteger(iterations) || iterations <= 0) return false;

  if (!/^[0-9a-f]+$/i.test(expectedHashHex) || expectedHashHex.length % 2 !== 0) {
    return false;
  }

  const expectedHashBuffer = Buffer.from(expectedHashHex, "hex");
  const actualHashBuffer = pbkdf2Sync(password, salt, iterations, expectedHashBuffer.length, "sha512");

  if (expectedHashBuffer.length !== actualHashBuffer.length) {
    return false;
  }

  return timingSafeEqual(actualHashBuffer, expectedHashBuffer);
}

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
    throw new AuthError(
      500,
      "EMAIL_NOT_CONFIGURED",
      "SMTP is not configured. Set AUTH_SMTP_* (or SMTP_*) env variables."
    );
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

function getAppBaseUrl() {
  const configured = process.env.AUTH_APP_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return configured.endsWith("/") ? configured.slice(0, -1) : configured;
}

function recipientMatch(entry: unknown, email: string) {
  return String(entry).toLowerCase().includes(email.toLowerCase());
}

async function sendEmailVerification(email: string, firstName: string, token: string) {
  const candidates = buildSmtpCandidates();
  const verificationUrl = `${getAppBaseUrl()}/api/auth/verify-email?token=${encodeURIComponent(token)}`;
  const expiresHours = EMAIL_VERIFICATION_EXPIRES_HOURS;
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
        to: email,
        subject: "Verify your Edutindo account",
        text:
          `Hi ${firstName},\n\n` +
          `Please verify your Edutindo account by opening this link:\n${verificationUrl}\n\n` +
          `This link expires in ${expiresHours} hours.\n\n` +
          "If you did not create this account, you can ignore this email.",
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;">
            <h2 style="margin:0 0 12px;">Welcome to Edutindo</h2>
            <p style="margin:0 0 12px;">Hi ${firstName}, please verify your account to continue.</p>
            <p style="margin:0 0 16px;">
              <a
                href="${verificationUrl}"
                style="display:inline-block;background:#2563eb;color:white;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:600;"
              >
                Verify Email
              </a>
            </p>
            <p style="margin:0 0 8px;">Or copy this link into your browser:</p>
            <p style="margin:0 0 8px;word-break:break-all;color:#1d4ed8;">${verificationUrl}</p>
            <p style="margin:0;color:#64748b;">This link expires in ${expiresHours} hours.</p>
          </div>
        `,
      });

      const accepted = info.accepted ?? [];
      const rejected = info.rejected ?? [];
      const wasAccepted = accepted.some((entry) => recipientMatch(entry, email));
      const wasRejected = rejected.some((entry) => recipientMatch(entry, email));

      if (!wasAccepted || wasRejected) {
        throw new Error(
          `Recipient not accepted by SMTP server. accepted=${accepted.join(",")} rejected=${rejected.join(",")} response=${info.response ?? ""}`
        );
      }

      console.info(
        `[auth-email] verification sent to=${email} via ${smtp.host}:${smtp.port} secure=${smtp.secure} messageId=${info.messageId} response=${info.response ?? ""} accepted=${accepted.join(",")} rejected=${rejected.join(",")}`
      );

      return;
    } catch (error) {
      lastError = error;
      console.warn(
        `[auth-email] verification failed to=${email} via ${smtp.host}:${smtp.port} secure=${smtp.secure}`,
        error
      );
    }
  }

  console.error("All SMTP candidates failed for verification email:", lastError);
  throw new AuthError(
    500,
    "EMAIL_SEND_FAILED",
    "Failed to send verification email. Check SMTP host/port and credentials."
  );
}

async function sendAdminLoginOtpEmail(email: string, code: string) {
  const candidates = buildSmtpCandidates();
  const minutes = ADMIN_OTP_EXPIRES_MINUTES;
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
        to: email,
        subject: "Your Edutindo admin one-time passcode",
        text:
          `Your Edutindo admin login passcode is ${code}. ` +
          `It expires in ${minutes} minutes.\n\n` +
          "If you did not request this passcode, please ignore this email.",
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;">
            <h2 style="margin:0 0 12px;">Edutindo Admin Login</h2>
            <p style="margin:0 0 12px;">Use this one-time passcode to sign in:</p>
            <div style="font-size:32px;font-weight:700;letter-spacing:6px;margin:8px 0 16px;">${code}</div>
            <p style="margin:0 0 8px;">This passcode expires in <strong>${minutes} minutes</strong>.</p>
            <p style="margin:0;color:#64748b;">If you did not request this code, you can safely ignore this email.</p>
          </div>
        `,
      });

      const accepted = info.accepted ?? [];
      const rejected = info.rejected ?? [];
      const wasAccepted = accepted.some((entry) => recipientMatch(entry, email));
      const wasRejected = rejected.some((entry) => recipientMatch(entry, email));

      if (!wasAccepted || wasRejected) {
        throw new Error(
          `Recipient not accepted by SMTP server. accepted=${accepted.join(",")} rejected=${rejected.join(",")} response=${info.response ?? ""}`
        );
      }

      console.info(
        `[auth-email] admin-otp sent to=${email} via ${smtp.host}:${smtp.port} secure=${smtp.secure} messageId=${info.messageId} response=${info.response ?? ""} accepted=${accepted.join(",")} rejected=${rejected.join(",")}`
      );

      return;
    } catch (error) {
      lastError = error;
      console.warn(
        `[auth-email] admin-otp failed to=${email} via ${smtp.host}:${smtp.port} secure=${smtp.secure}`,
        error
      );
    }
  }

  console.error("All SMTP candidates failed for admin OTP email:", lastError);
  throw new AuthError(
    500,
    "EMAIL_SEND_FAILED",
    "Failed to send admin passcode email. Check SMTP host/port and credentials."
  );
}

export async function ensureAuthSchema() {
  if (authSchemaReady) return authSchemaReady;

  authSchemaReady = (async () => {
    await sql`
      CREATE TABLE IF NOT EXISTS auth_users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        first_name TEXT,
        last_name TEXT,
        password_hash TEXT,
        email_verified BOOLEAN NOT NULL DEFAULT FALSE,
        email_verified_at TIMESTAMPTZ,
        is_admin BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;

    await sql`ALTER TABLE auth_users ADD COLUMN IF NOT EXISTS first_name TEXT;`;
    await sql`ALTER TABLE auth_users ADD COLUMN IF NOT EXISTS last_name TEXT;`;
    await sql`ALTER TABLE auth_users ADD COLUMN IF NOT EXISTS password_hash TEXT;`;
    await sql`ALTER TABLE auth_users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN;`;
    await sql`ALTER TABLE auth_users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;`;
    await sql`UPDATE auth_users SET email_verified = TRUE WHERE email_verified IS NULL;`;
    await sql`ALTER TABLE auth_users ALTER COLUMN email_verified SET DEFAULT FALSE;`;
    await sql`ALTER TABLE auth_users ALTER COLUMN email_verified SET NOT NULL;`;

    await sql`
      CREATE TABLE IF NOT EXISTS auth_email_verifications (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
        email TEXT NOT NULL,
        token_hash TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMPTZ NOT NULL,
        used_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS auth_email_verifications_user_idx
      ON auth_email_verifications (user_id, created_at DESC);
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS auth_admin_otp_codes (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL,
        otp_hash TEXT NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0,
        expires_at TIMESTAMPTZ NOT NULL,
        used_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS auth_admin_otp_codes_email_created_idx
      ON auth_admin_otp_codes (email, created_at DESC);
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS auth_sessions (
        id TEXT PRIMARY KEY,
        token_hash TEXT NOT NULL UNIQUE,
        user_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS auth_sessions_user_idx
      ON auth_sessions (user_id);
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS auth_user_portals (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
        portal TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(user_id, portal)
      );
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS auth_user_portals_user_idx
      ON auth_user_portals (user_id);
    `;
  })();

  return authSchemaReady;
}

async function getUserRowByEmail(email: string) {
  const result = await sql<AuthUserRow>`
    SELECT id, email, first_name, last_name, password_hash, email_verified, email_verified_at, is_admin, created_at
    FROM auth_users
    WHERE email = ${email}
    LIMIT 1
  `;

  return result.rows[0] ?? null;
}

async function getUserRowById(userId: string) {
  const result = await sql<AuthUserRow>`
    SELECT id, email, first_name, last_name, password_hash, email_verified, email_verified_at, is_admin, created_at
    FROM auth_users
    WHERE id = ${userId}
    LIMIT 1
  `;

  return result.rows[0] ?? null;
}

async function getPortalsForUser(userId: string) {
  const result = await sql<{ portal: string }>`
    SELECT portal
    FROM auth_user_portals
    WHERE user_id = ${userId}
    ORDER BY portal ASC
  `;

  return result.rows
    .map((row) => row.portal)
    .filter((portal): portal is PortalKey => PORTAL_SET.has(portal));
}

async function hydrateUser(userRow: AuthUserRow): Promise<AuthUser> {
  const portals = await getPortalsForUser(userRow.id);

  return {
    id: userRow.id,
    email: userRow.email,
    firstName: userRow.first_name ?? "",
    lastName: userRow.last_name ?? "",
    emailVerified: userRow.email_verified,
    isAdmin: userRow.is_admin,
    portals,
    createdAt: new Date(userRow.created_at),
  };
}

function sanitizePortals(input: string[]): PortalKey[] {
  const unique = Array.from(new Set(input.map((portal) => portal.toLowerCase().trim())));
  return unique.filter((portal): portal is PortalKey => PORTAL_SET.has(portal));
}

async function createUser(params: {
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  forceAdmin?: boolean;
}) {
  const id = randomUUID();
  const isAdmin = Boolean(params.forceAdmin) || isAllowlistedAdmin(params.email);

  await sql`
    INSERT INTO auth_users (id, email, first_name, last_name, password_hash, email_verified, is_admin)
    VALUES (${id}, ${params.email}, ${params.firstName}, ${params.lastName}, ${params.passwordHash}, FALSE, ${isAdmin})
  `;

  const defaultPortals: PortalKey[] = isAdmin ? [...PORTAL_OPTIONS] : [];
  await setUserPortals(id, defaultPortals);

  const userRow = await getUserRowById(id);
  if (!userRow) {
    throw new AuthError(500, "USER_CREATE_FAILED", "Failed to create user.");
  }

  return hydrateUser(userRow);
}

async function ensureAdminFlag(email: string, existingUser: AuthUserRow) {
  if (!isAllowlistedAdmin(email) || existingUser.is_admin) return;

  await sql`
    UPDATE auth_users
    SET is_admin = TRUE, updated_at = NOW()
    WHERE id = ${existingUser.id}
  `;

  await setUserPortals(existingUser.id, [...PORTAL_OPTIONS]);
}

async function ensureAdminUserAccount(email: string) {
  let userRow = await getUserRowByEmail(email);

  if (!userRow) {
    const userId = randomUUID();
    await sql`
      INSERT INTO auth_users (
        id,
        email,
        first_name,
        last_name,
        password_hash,
        email_verified,
        email_verified_at,
        is_admin
      )
      VALUES (
        ${userId},
        ${email},
        ${"Admin"},
        ${""},
        ${null},
        TRUE,
        NOW(),
        TRUE
      )
    `;

    await setUserPortals(userId, [...PORTAL_OPTIONS]);
    userRow = await getUserRowById(userId);
  } else {
    await sql`
      UPDATE auth_users
      SET
        is_admin = TRUE,
        email_verified = TRUE,
        email_verified_at = COALESCE(email_verified_at, NOW()),
        updated_at = NOW()
      WHERE id = ${userRow.id}
    `;

    await setUserPortals(userRow.id, [...PORTAL_OPTIONS]);
    userRow = await getUserRowById(userRow.id);
  }

  if (!userRow) {
    throw new AuthError(500, "USER_LOAD_FAILED", "Failed to load admin account.");
  }

  return hydrateUser(userRow);
}

async function issueEmailVerificationToken(userId: string, email: string) {
  const rawToken = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_EXPIRES_HOURS * 60 * 60 * 1000);

  await sql`
    UPDATE auth_email_verifications
    SET used_at = NOW()
    WHERE user_id = ${userId} AND used_at IS NULL
  `;

  await sql`
    INSERT INTO auth_email_verifications (user_id, email, token_hash, expires_at)
    VALUES (${userId}, ${email}, ${hashEmailVerificationToken(rawToken)}, ${expiresAt.toISOString()})
  `;

  return rawToken;
}

async function sendVerificationEmailForUser(userId: string) {
  const userRow = await getUserRowById(userId);
  if (!userRow) {
    throw new AuthError(404, "USER_NOT_FOUND", "User not found.");
  }

  const token = await issueEmailVerificationToken(userRow.id, userRow.email);
  await sendEmailVerification(userRow.email, userRow.first_name ?? "there", token);
}

export async function setUserPortals(userId: string, portals: PortalKey[]) {
  await ensureAuthSchema();

  const userRow = await getUserRowById(userId);
  if (!userRow) {
    throw new AuthError(404, "USER_NOT_FOUND", "User not found.");
  }

  const cleanedPortals = sanitizePortals(portals);
  if (userRow.is_admin && !cleanedPortals.includes("admin")) {
    cleanedPortals.push("admin");
  }

  await sql`
    DELETE FROM auth_user_portals
    WHERE user_id = ${userId}
  `;

  for (const portal of cleanedPortals) {
    await sql`
      INSERT INTO auth_user_portals (user_id, portal)
      VALUES (${userId}, ${portal})
      ON CONFLICT (user_id, portal) DO NOTHING
    `;
  }
}

export async function signupWithPassword(params: {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}) {
  await ensureAuthSchema();

  const email = normalizeEmail(params.email);
  const firstName = sanitizeName(params.firstName, "first name");
  const lastName = sanitizeName(params.lastName, "last name");
  const password = params.password;

  if (!isValidEmail(email)) {
    throw new AuthError(400, "INVALID_EMAIL", "Please enter a valid email.");
  }

  validatePassword(password);

  const passwordHash = hashPassword(password);
  const existingUser = await getUserRowByEmail(email);

  if (existingUser?.email_verified && existingUser.password_hash) {
    throw new AuthError(409, "ACCOUNT_EXISTS", "This email is already registered. Please log in.");
  }

  if (existingUser) {
    const shouldBeAdmin = existingUser.is_admin || isAllowlistedAdmin(email);

    await sql`
      UPDATE auth_users
      SET
        first_name = ${firstName},
        last_name = ${lastName},
        password_hash = ${passwordHash},
        is_admin = ${shouldBeAdmin},
        email_verified = FALSE,
        email_verified_at = NULL,
        updated_at = NOW()
      WHERE id = ${existingUser.id}
    `;

    await setUserPortals(existingUser.id, shouldBeAdmin ? [...PORTAL_OPTIONS] : []);
    await sendVerificationEmailForUser(existingUser.id);

    return {
      ok: true as const,
      status: "resent" as const,
      message: "A new verification email was sent.",
    };
  }

  const user = await createUser({
    email,
    firstName,
    lastName,
    passwordHash,
  });

  try {
    await sendVerificationEmailForUser(user.id);
  } catch (error) {
    await sql`
      DELETE FROM auth_users
      WHERE id = ${user.id}
    `;
    throw error;
  }

  return {
    ok: true as const,
    status: "created" as const,
    message: "Verification email sent. Please check your inbox.",
  };
}

export async function resendVerificationEmail(emailInput: string) {
  await ensureAuthSchema();

  const email = normalizeEmail(emailInput);
  if (!isValidEmail(email)) {
    throw new AuthError(400, "INVALID_EMAIL", "Please enter a valid email.");
  }

  const userRow = await getUserRowByEmail(email);
  if (!userRow) {
    throw new AuthError(404, "ACCOUNT_NOT_FOUND", "No account found with that email.");
  }

  if (userRow.email_verified) {
    throw new AuthError(409, "ALREADY_VERIFIED", "This email is already verified. Please log in.");
  }

  await sendVerificationEmailForUser(userRow.id);

  return {
    ok: true as const,
    message: "Verification email sent. Please check your inbox.",
  };
}

export async function verifyEmailAddress(tokenInput: string) {
  await ensureAuthSchema();

  const token = tokenInput.trim();
  if (token.length < 20) {
    throw new AuthError(400, "INVALID_TOKEN", "Invalid verification token.");
  }

  const tokenHash = hashEmailVerificationToken(token);
  const result = await sql<AuthEmailVerificationRow>`
    SELECT id, user_id, email, expires_at
    FROM auth_email_verifications
    WHERE token_hash = ${tokenHash}
      AND used_at IS NULL
    ORDER BY created_at DESC
    LIMIT 1
  `;

  const verification = result.rows[0];
  if (!verification) {
    throw new AuthError(400, "INVALID_TOKEN", "Invalid or already used verification token.");
  }

  if (new Date(verification.expires_at).getTime() < Date.now()) {
    await sql`
      UPDATE auth_email_verifications
      SET used_at = NOW()
      WHERE id = ${verification.id}
    `;

    throw new AuthError(400, "TOKEN_EXPIRED", "This verification link has expired. Request a new one.");
  }

  await sql`
    UPDATE auth_email_verifications
    SET used_at = NOW()
    WHERE id = ${verification.id}
  `;

  await sql`
    UPDATE auth_users
    SET email_verified = TRUE, email_verified_at = NOW(), updated_at = NOW()
    WHERE id = ${verification.user_id} AND email = ${verification.email}
  `;

  const userRow = await getUserRowById(verification.user_id);
  if (!userRow) {
    throw new AuthError(500, "USER_NOT_FOUND", "Failed to load user after verification.");
  }

  return hydrateUser(userRow);
}

type LoginStartResult =
  | { method: "password" }
  | { method: "admin_otp"; message: string };

export async function startLoginFlow(emailInput: string): Promise<LoginStartResult> {
  await ensureAuthSchema();

  const email = normalizeEmail(emailInput);
  if (!isValidEmail(email)) {
    throw new AuthError(400, "INVALID_EMAIL", "Please enter a valid email.");
  }

  const userRow = await getUserRowByEmail(email);
  const isAdminLogin = isAllowlistedAdmin(email) || Boolean(userRow?.is_admin);

  if (!isAdminLogin) {
    if (!userRow) {
      throw new AuthError(404, "ACCOUNT_NOT_FOUND", "No account found. Please sign up first.");
    }

    return { method: "password" };
  }

  const recentOtp = await sql<{ created_at: Date }>`
    SELECT created_at
    FROM auth_admin_otp_codes
    WHERE email = ${email}
    ORDER BY created_at DESC
    LIMIT 1
  `;

  if (recentOtp.rows[0]) {
    const secondsAgo = (Date.now() - new Date(recentOtp.rows[0].created_at).getTime()) / 1000;
    if (secondsAgo < ADMIN_OTP_RESEND_COOLDOWN_SECONDS) {
      throw new AuthError(
        429,
        "OTP_TOO_SOON",
        `Please wait ${Math.ceil(ADMIN_OTP_RESEND_COOLDOWN_SECONDS - secondsAgo)} seconds before requesting another passcode.`
      );
    }
  }

  const otpCode = randomInt(0, 1_000_000).toString().padStart(6, "0");
  const expiresAt = new Date(Date.now() + ADMIN_OTP_EXPIRES_MINUTES * 60 * 1000);

  await sql`
    INSERT INTO auth_admin_otp_codes (email, otp_hash, expires_at)
    VALUES (${email}, ${hashAdminOtp(email, otpCode)}, ${expiresAt.toISOString()})
  `;

  await sendAdminLoginOtpEmail(email, otpCode);

  return {
    method: "admin_otp",
    message: "One-time passcode sent. Please check your email.",
  };
}

export async function verifyAdminLoginOtp(params: { email: string; code: string }) {
  await ensureAuthSchema();

  const email = normalizeEmail(params.email);
  const code = params.code.trim();

  if (!isValidEmail(email)) {
    throw new AuthError(400, "INVALID_EMAIL", "Please enter a valid email.");
  }

  if (!/^\d{6}$/.test(code)) {
    throw new AuthError(400, "INVALID_OTP", "Please enter a valid 6-digit passcode.");
  }

  const userRow = await getUserRowByEmail(email);
  const isAdminLogin = isAllowlistedAdmin(email) || Boolean(userRow?.is_admin);
  if (!isAdminLogin) {
    throw new AuthError(403, "ADMIN_ONLY", "This email is not allowed for admin passcode login.");
  }

  const otpResult = await sql<AuthAdminOtpRow>`
    SELECT id, otp_hash, attempts, expires_at
    FROM auth_admin_otp_codes
    WHERE email = ${email} AND used_at IS NULL
    ORDER BY created_at DESC
    LIMIT 1
  `;

  const otpRow = otpResult.rows[0];
  if (!otpRow) {
    throw new AuthError(400, "OTP_NOT_FOUND", "No active passcode found. Request a new code.");
  }

  if (new Date(otpRow.expires_at).getTime() < Date.now()) {
    await sql`
      UPDATE auth_admin_otp_codes
      SET used_at = NOW()
      WHERE id = ${otpRow.id}
    `;
    throw new AuthError(400, "OTP_EXPIRED", "This passcode has expired. Request a new one.");
  }

  if (otpRow.attempts >= ADMIN_OTP_MAX_ATTEMPTS) {
    throw new AuthError(429, "OTP_LOCKED", "Too many invalid attempts. Request a new passcode.");
  }

  if (hashAdminOtp(email, code) !== otpRow.otp_hash) {
    await sql`
      UPDATE auth_admin_otp_codes
      SET attempts = attempts + 1
      WHERE id = ${otpRow.id}
    `;
    throw new AuthError(400, "OTP_INCORRECT", "Incorrect passcode.");
  }

  await sql`
    UPDATE auth_admin_otp_codes
    SET used_at = NOW()
    WHERE id = ${otpRow.id}
  `;

  if (!userRow) {
    return createSessionForUser(await ensureAdminUserAccount(email));
  }

  await ensureAdminFlag(email, userRow);
  return createSessionForUser(await ensureAdminUserAccount(email));
}

export async function loginWithPassword(params: { email: string; password: string }) {
  await ensureAuthSchema();

  const email = normalizeEmail(params.email);
  const password = params.password;

  if (!isValidEmail(email)) {
    throw new AuthError(400, "INVALID_EMAIL", "Please enter a valid email.");
  }

  if (!password) {
    throw new AuthError(400, "INVALID_PASSWORD", "Please enter your password.");
  }

  let userRow = await getUserRowByEmail(email);
  if (!userRow) {
    throw new AuthError(404, "ACCOUNT_NOT_FOUND", "No account found. Please sign up first.");
  }

  if (!userRow.password_hash) {
    throw new AuthError(
      400,
      "PASSWORD_NOT_SET",
      "This account does not have a password yet. Please sign up again to set your password."
    );
  }

  if (!verifyPassword(password, userRow.password_hash)) {
    throw new AuthError(401, "INVALID_CREDENTIALS", "Invalid email or password.");
  }

  await ensureAdminFlag(email, userRow);
  userRow = await getUserRowById(userRow.id);

  if (!userRow) {
    throw new AuthError(500, "USER_LOAD_FAILED", "Failed to load account.");
  }

  if (!userRow.email_verified) {
    throw new AuthError(403, "EMAIL_NOT_VERIFIED", "Please verify your email before logging in.");
  }

  return createSessionForUser(await hydrateUser(userRow));
}

async function createSessionForUser(user: AuthUser) {
  await ensureAuthSchema();

  const sessionToken = randomBytes(32).toString("hex");
  const sessionId = randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_MAX_SECONDS * 1000);

  await sql`
    INSERT INTO auth_sessions (id, token_hash, user_id, expires_at)
    VALUES (${sessionId}, ${hashSessionToken(sessionToken)}, ${user.id}, ${expiresAt.toISOString()})
  `;

  await sql`
    DELETE FROM auth_sessions
    WHERE expires_at < NOW()
  `;

  return { user, sessionToken, expiresAt };
}

export async function getUserFromSessionToken(token: string | null | undefined) {
  await ensureAuthSchema();

  if (!token) return null;

  const sessionResult = await sql<{ user_id: string }>`
    SELECT user_id
    FROM auth_sessions
    WHERE token_hash = ${hashSessionToken(token)}
      AND expires_at > NOW()
    LIMIT 1
  `;

  const session = sessionResult.rows[0];
  if (!session) return null;

  const userRow = await getUserRowById(session.user_id);
  if (!userRow) return null;

  return hydrateUser(userRow);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return getUserFromSessionToken(token);
}

export async function revokeSessionByToken(token: string | null | undefined) {
  await ensureAuthSchema();
  if (!token) return;

  await sql`
    DELETE FROM auth_sessions
    WHERE token_hash = ${hashSessionToken(token)}
  `;
}

export function applySessionCookie(
  response: {
    cookies: {
      set: (options: {
        name: string;
        value: string;
        httpOnly: boolean;
        secure: boolean;
        sameSite: "lax" | "strict" | "none";
        path: string;
        maxAge: number;
      }) => void;
    };
  },
  token: string
) {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_SECONDS,
  });
}

export function clearSessionCookie(response: {
  cookies: {
    set: (options: {
      name: string;
      value: string;
      httpOnly: boolean;
      secure: boolean;
      sameSite: "lax" | "strict" | "none";
      path: string;
      maxAge: number;
    }) => void;
  };
}) {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function verifyDemoPortalCode(codeInput: string) {
  if (codeInput.trim() !== DEMO_PORTAL_CODE) {
    throw new AuthError(401, "INVALID_DEMO_CODE", "Invalid demo access code.");
  }
}

export function applyDemoAccessCookie(response: {
  cookies: {
    set: (options: {
      name: string;
      value: string;
      httpOnly: boolean;
      secure: boolean;
      sameSite: "lax" | "strict" | "none";
      path: string;
      maxAge: number;
    }) => void;
  };
}) {
  response.cookies.set({
    name: DEMO_ACCESS_COOKIE_NAME,
    value: hashDemoAccessCode(DEMO_PORTAL_CODE),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DEMO_ACCESS_MAX_SECONDS,
  });
}

export async function requireSignedIn(nextPath: string) {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  return user;
}

export async function requirePortalAccess(portal: PortalKey, nextPath: string) {
  const user = await getCurrentUser();
  if (!user) {
    if (portal === "admin") {
      redirect(`/login?next=${encodeURIComponent(nextPath)}`);
    }

    const cookieStore = await cookies();
    const demoToken = cookieStore.get(DEMO_ACCESS_COOKIE_NAME)?.value;

    if (!hasValidDemoAccessToken(demoToken)) {
      redirect(`/demo-access?next=${encodeURIComponent(nextPath)}`);
    }

    return null;
  }

  if (!user.isAdmin && !user.portals.includes(portal)) {
    if (portal !== "admin") {
      const cookieStore = await cookies();
      const demoToken = cookieStore.get(DEMO_ACCESS_COOKIE_NAME)?.value;
      if (hasValidDemoAccessToken(demoToken)) {
        return user;
      }
    }

    redirect("/dashboard?pending=1");
  }

  return user;
}

export async function listUsersWithPortals() {
  await ensureAuthSchema();

  const usersResult = await sql<AuthUserRow>`
    SELECT id, email, first_name, last_name, password_hash, email_verified, email_verified_at, is_admin, created_at
    FROM auth_users
    ORDER BY created_at DESC
  `;

  const portalsResult = await sql<{ user_id: string; portal: string }>`
    SELECT user_id, portal
    FROM auth_user_portals
  `;

  const portalsByUser = new Map<string, PortalKey[]>();

  for (const row of portalsResult.rows) {
    if (!PORTAL_SET.has(row.portal)) continue;
    const existing = portalsByUser.get(row.user_id) ?? [];
    existing.push(row.portal as PortalKey);
    portalsByUser.set(row.user_id, existing);
  }

  return usersResult.rows.map((row) => ({
    id: row.id,
    email: row.email,
    firstName: row.first_name ?? "",
    lastName: row.last_name ?? "",
    emailVerified: row.email_verified,
    isAdmin: row.is_admin,
    createdAt: new Date(row.created_at),
    portals: portalsByUser.get(row.id) ?? [],
  }));
}

export function sanitizeNextPath(nextPath: string | null | undefined, fallback = "/dashboard") {
  if (!nextPath) return fallback;
  if (!nextPath.startsWith("/")) return fallback;
  if (nextPath.startsWith("//")) return fallback;
  return nextPath;
}
