import "server-only";

import { randomBytes, randomInt, randomUUID, createHash } from "crypto";
import nodemailer from "nodemailer";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sql } from "@vercel/postgres";
import { PORTAL_OPTIONS, SESSION_COOKIE_NAME, type PortalKey } from "@/lib/auth-shared";


export interface AuthUser {
  id: string;
  email: string;
  isAdmin: boolean;
  portals: PortalKey[];
  createdAt: Date;
}

type AuthMode = "login" | "signup";

type AuthUserRow = {
  id: string;
  email: string;
  is_admin: boolean;
  created_at: Date;
};

type AuthOtpRow = {
  id: number;
  otp_hash: string;
  attempts: number;
  expires_at: Date;
  mode: string;
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

const OTP_EXPIRY_MINUTES = Number(process.env.AUTH_OTP_EXPIRES_MINUTES ?? 10);
const OTP_MAX_ATTEMPTS = Number(process.env.AUTH_OTP_MAX_ATTEMPTS ?? 5);
const SESSION_MAX_DAYS = Number(process.env.AUTH_SESSION_MAX_DAYS ?? 14);
const SESSION_MAX_SECONDS = SESSION_MAX_DAYS * 24 * 60 * 60;
const AUTH_SECRET = process.env.AUTH_SECRET || "change-this-auth-secret";
const OTP_RESEND_COOLDOWN_SECONDS = Number(process.env.AUTH_OTP_RESEND_COOLDOWN_SECONDS ?? 30);
const PORTAL_SET = new Set<string>(PORTAL_OPTIONS);

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

function hashOtp(email: string, code: string) {
  return createHash("sha256").update(`${AUTH_SECRET}:otp:${email}:${code}`).digest("hex");
}

function hashSessionToken(token: string) {
  return createHash("sha256").update(`${AUTH_SECRET}:session:${token}`).digest("hex");
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

async function sendOtpEmail(email: string, code: string) {
  const candidates = buildSmtpCandidates();
  const minutes = OTP_EXPIRY_MINUTES;
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

      await transporter.sendMail({
        from: smtp.from,
        to: email,
        subject: "Your Edutindo one-time passcode",
        text: `Your one-time passcode is ${code}. It expires in ${minutes} minutes.\n\nIf you did not request this code, please ignore this email.`,
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;">
            <h2 style="margin:0 0 12px;">Edutindo Sign-In Code</h2>
            <p style="margin:0 0 12px;">Use this one-time passcode to continue:</p>
            <div style="font-size:32px;font-weight:700;letter-spacing:6px;margin:8px 0 16px;">${code}</div>
            <p style="margin:0 0 8px;">This code expires in <strong>${minutes} minutes</strong>.</p>
            <p style="margin:0;color:#64748b;">If you did not request this code, you can safely ignore this email.</p>
          </div>
        `,
      });

      return;
    } catch (error) {
      lastError = error;
      console.warn(`OTP email failed via SMTP ${smtp.host}:${smtp.port} secure=${smtp.secure}`);
    }
  }

  console.error("All SMTP candidates failed for OTP email:", lastError);
  throw new AuthError(
    500,
    "EMAIL_SEND_FAILED",
    "Failed to send passcode email. Check SMTP host/port and credentials."
  );
}

export async function ensureAuthSchema() {
  if (authSchemaReady) return authSchemaReady;

  authSchemaReady = (async () => {
    await sql`
      CREATE TABLE IF NOT EXISTS auth_users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        is_admin BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS auth_otp_codes (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL,
        otp_hash TEXT NOT NULL,
        mode TEXT NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0,
        expires_at TIMESTAMPTZ NOT NULL,
        used_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS auth_otp_codes_email_created_idx
      ON auth_otp_codes (email, created_at DESC);
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
    SELECT id, email, is_admin, created_at
    FROM auth_users
    WHERE email = ${email}
    LIMIT 1
  `;
  return result.rows[0] ?? null;
}

async function getUserRowById(userId: string) {
  const result = await sql<AuthUserRow>`
    SELECT id, email, is_admin, created_at
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
    isAdmin: userRow.is_admin,
    portals,
    createdAt: new Date(userRow.created_at),
  };
}

async function createUser(email: string, forceAdmin = false): Promise<AuthUser> {
  const id = randomUUID();
  const isAdmin = forceAdmin || isAllowlistedAdmin(email);

  await sql`
    INSERT INTO auth_users (id, email, is_admin)
    VALUES (${id}, ${email}, ${isAdmin})
  `;

  const defaultPortals: PortalKey[] = isAdmin ? [...PORTAL_OPTIONS] : ["student"];
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

  await sql`
    INSERT INTO auth_user_portals (user_id, portal)
    VALUES (${existingUser.id}, ${"admin"})
    ON CONFLICT (user_id, portal) DO NOTHING
  `;
}

function sanitizePortals(input: string[]): PortalKey[] {
  const unique = Array.from(new Set(input.map((portal) => portal.toLowerCase().trim())));
  return unique.filter((portal): portal is PortalKey => PORTAL_SET.has(portal));
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

export async function requestOtpCode(params: { email: string; mode: AuthMode }) {
  await ensureAuthSchema();

  const email = normalizeEmail(params.email);
  if (!isValidEmail(email)) {
    throw new AuthError(400, "INVALID_EMAIL", "Please enter a valid email.");
  }

  const existingUser = await getUserRowByEmail(email);

  if (params.mode === "login" && !existingUser && !isAllowlistedAdmin(email)) {
    throw new AuthError(404, "ACCOUNT_NOT_FOUND", "No account found. Please sign up first.");
  }

  if (params.mode === "signup" && existingUser) {
    throw new AuthError(409, "ACCOUNT_EXISTS", "This email is already registered. Please log in.");
  }

  const recentOtp = await sql<{ created_at: Date }>`
    SELECT created_at
    FROM auth_otp_codes
    WHERE email = ${email}
    ORDER BY created_at DESC
    LIMIT 1
  `;

  if (recentOtp.rows[0]) {
    const secondsAgo = (Date.now() - new Date(recentOtp.rows[0].created_at).getTime()) / 1000;
    if (secondsAgo < OTP_RESEND_COOLDOWN_SECONDS) {
      throw new AuthError(
        429,
        "OTP_TOO_SOON",
        `Please wait ${Math.ceil(OTP_RESEND_COOLDOWN_SECONDS - secondsAgo)} seconds before requesting another code.`
      );
    }
  }

  const otpCode = randomInt(0, 1_000_000).toString().padStart(6, "0");
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await sql`
    INSERT INTO auth_otp_codes (email, otp_hash, mode, expires_at)
    VALUES (${email}, ${hashOtp(email, otpCode)}, ${params.mode}, ${expiresAt.toISOString()})
  `;

  await sendOtpEmail(email, otpCode);
}

export async function verifyOtpCode(params: { email: string; code: string; mode: AuthMode }) {
  await ensureAuthSchema();

  const email = normalizeEmail(params.email);
  const code = params.code.trim();

  if (!isValidEmail(email)) {
    throw new AuthError(400, "INVALID_EMAIL", "Please enter a valid email.");
  }

  if (!/^\d{6}$/.test(code)) {
    throw new AuthError(400, "INVALID_OTP", "Please enter a valid 6-digit passcode.");
  }

  const otpResult = await sql<AuthOtpRow>`
    SELECT id, otp_hash, attempts, expires_at, mode
    FROM auth_otp_codes
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
      UPDATE auth_otp_codes
      SET used_at = NOW()
      WHERE id = ${otpRow.id}
    `;
    throw new AuthError(400, "OTP_EXPIRED", "This passcode has expired. Request a new one.");
  }

  if (otpRow.attempts >= OTP_MAX_ATTEMPTS) {
    throw new AuthError(429, "OTP_LOCKED", "Too many invalid attempts. Request a new code.");
  }

  const expectedHash = hashOtp(email, code);
  if (expectedHash !== otpRow.otp_hash) {
    await sql`
      UPDATE auth_otp_codes
      SET attempts = attempts + 1
      WHERE id = ${otpRow.id}
    `;
    throw new AuthError(400, "OTP_INCORRECT", "Incorrect passcode.");
  }

  await sql`
    UPDATE auth_otp_codes
    SET used_at = NOW()
    WHERE id = ${otpRow.id}
  `;

  let userRow = await getUserRowByEmail(email);

  if (params.mode === "login" && !userRow && !isAllowlistedAdmin(email)) {
    throw new AuthError(404, "ACCOUNT_NOT_FOUND", "No account found. Please sign up first.");
  }

  if (!userRow) {
    return createSessionForUser(await createUser(email));
  }

  await ensureAdminFlag(email, userRow);
  userRow = await getUserRowById(userRow.id);
  if (!userRow) {
    throw new AuthError(500, "USER_LOAD_FAILED", "Failed to load account.");
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

export async function requirePortalAccess(portal: PortalKey, nextPath: string) {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  if (!user.isAdmin && !user.portals.includes(portal)) {
    redirect("/");
  }

  return user;
}

export async function listUsersWithPortals() {
  await ensureAuthSchema();

  const usersResult = await sql<AuthUserRow>`
    SELECT id, email, is_admin, created_at
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
    isAdmin: row.is_admin,
    createdAt: new Date(row.created_at),
    portals: portalsByUser.get(row.id) ?? [],
  }));
}

export function sanitizeNextPath(nextPath: string | null | undefined, fallback = "/student") {
  if (!nextPath) return fallback;
  if (!nextPath.startsWith("/")) return fallback;
  if (nextPath.startsWith("//")) return fallback;
  return nextPath;
}
