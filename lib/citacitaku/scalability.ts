import "@/lib/server-only";

import { createHash, randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth-shared";
import { getPostgresSetupMessage, isPostgresConfigured, sqlQuery as sql } from "@/lib/postgres-query";

type JsonObject = Record<string, unknown>;

export type GuidanceCacheEntry<T> = {
  payload: T;
  metadata: JsonObject;
  cacheDate: string;
};

export type GuidanceCacheResult<T> = GuidanceCacheEntry<T> & {
  cacheStatus: "hit" | "shared" | "miss";
};

type CacheFactoryResult<T> = {
  payload: T;
  metadata: JsonObject;
  ttlSeconds?: number;
};

type RedisPipelineItem = { result?: unknown; error?: string };

const RATE_WINDOW_SECONDS = 60;
const DEFAULT_CLIENT_LIMIT = 10;
const DEFAULT_NETWORK_LIMIT = 300;
const DEFAULT_PROVIDER_CONCURRENCY = 8;
const DEFAULT_PROVIDER_QUEUE_TIMEOUT_MS = 120_000;
const DEFAULT_SINGLE_FLIGHT_TIMEOUT_MS = 165_000;
const GENERATION_LOCK_LEASE_SECONDS = 180;
const PROVIDER_SLOT_LEASE_SECONDS = 75;

let scalabilitySchemaReady: Promise<void> | null = null;
let redisFallbackWarningLogged = false;

function positiveInteger(value: string | undefined, fallback: number, maximum: number) {
  const parsed = Number.parseInt(value || "", 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, maximum);
}

function sleep(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function normalizeDream(value: string) {
  return value.normalize("NFKC").trim().toLocaleLowerCase("id-ID").replace(/\s+/g, " ");
}

export function jakartaDate(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function buildGuidanceCacheKey(dream: string, grade: "10" | "11" | "12", date = new Date()) {
  const cacheDate = jakartaDate(date);
  const normalizedDream = normalizeDream(dream);
  return {
    cacheDate,
    grade,
    normalizedDream,
    cacheKey: `citacitaku:v1:${cacheDate}:${grade}:${hash(normalizedDream)}`,
  };
}

async function ensureScalabilitySchema() {
  if (scalabilitySchemaReady) return scalabilitySchemaReady;

  scalabilitySchemaReady = (async () => {
    if (!isPostgresConfigured()) throw new Error(getPostgresSetupMessage());

    await sql`
      CREATE TABLE IF NOT EXISTS citacitaku_guidance_cache (
        cache_key TEXT PRIMARY KEY,
        cache_date DATE NOT NULL,
        dream_normalized TEXT NOT NULL,
        grade TEXT NOT NULL,
        response_json JSONB NOT NULL,
        metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMPTZ NOT NULL
      )
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS citacitaku_guidance_cache_expiry_idx
      ON citacitaku_guidance_cache (expires_at)
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS citacitaku_generation_locks (
        cache_key TEXT PRIMARY KEY,
        owner_id TEXT NOT NULL,
        lease_expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS citacitaku_provider_slots (
        provider TEXT NOT NULL,
        slot_number INTEGER NOT NULL,
        owner_id TEXT,
        lease_expires_at TIMESTAMPTZ,
        acquired_at TIMESTAMPTZ,
        PRIMARY KEY (provider, slot_number)
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS citacitaku_rate_limit_buckets (
        bucket_key TEXT PRIMARY KEY,
        request_count INTEGER NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL
      )
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS citacitaku_rate_limit_expiry_idx
      ON citacitaku_rate_limit_buckets (expires_at)
    `;
  })().catch((error) => {
    scalabilitySchemaReady = null;
    throw error;
  });

  return scalabilitySchemaReady;
}

async function readGuidanceCache<T>(cacheKey: string): Promise<GuidanceCacheEntry<T> | null> {
  await ensureScalabilitySchema();
  const result = await sql<{
    response_json: T;
    metadata_json: JsonObject;
    cache_date: string | Date;
  }>`
    SELECT response_json, metadata_json, cache_date
    FROM citacitaku_guidance_cache
    WHERE cache_key = ${cacheKey}
      AND expires_at > NOW()
    LIMIT 1
  `;
  const row = result.rows[0];
  if (!row) return null;
  return {
    payload: row.response_json,
    metadata: row.metadata_json ?? {},
    cacheDate: row.cache_date instanceof Date ? row.cache_date.toISOString().slice(0, 10) : String(row.cache_date),
  };
}

async function writeGuidanceCache<T>(
  identity: ReturnType<typeof buildGuidanceCacheKey>,
  value: CacheFactoryResult<T>,
) {
  const ttlSeconds = positiveInteger(String(value.ttlSeconds ?? 108_000), 108_000, 172_800);
  await sql`
    INSERT INTO citacitaku_guidance_cache (
      cache_key, cache_date, dream_normalized, grade, response_json, metadata_json, expires_at
    )
    VALUES (
      ${identity.cacheKey},
      ${identity.cacheDate}::date,
      ${identity.normalizedDream},
      ${identity.grade},
      ${JSON.stringify(value.payload)}::jsonb,
      ${JSON.stringify(value.metadata)}::jsonb,
      NOW() + (${ttlSeconds} * INTERVAL '1 second')
    )
    ON CONFLICT (cache_key) DO UPDATE SET
      response_json = EXCLUDED.response_json,
      metadata_json = EXCLUDED.metadata_json,
      created_at = NOW(),
      expires_at = EXCLUDED.expires_at
  `;
}

async function tryAcquireGenerationLock(cacheKey: string, ownerId: string) {
  const result = await sql<{ owner_id: string }>`
    INSERT INTO citacitaku_generation_locks (cache_key, owner_id, lease_expires_at)
    VALUES (${cacheKey}, ${ownerId}, NOW() + (${GENERATION_LOCK_LEASE_SECONDS} * INTERVAL '1 second'))
    ON CONFLICT (cache_key) DO UPDATE SET
      owner_id = EXCLUDED.owner_id,
      lease_expires_at = EXCLUDED.lease_expires_at,
      created_at = NOW()
    WHERE citacitaku_generation_locks.lease_expires_at <= NOW()
    RETURNING owner_id
  `;
  return result.rows[0]?.owner_id === ownerId;
}

async function releaseGenerationLock(cacheKey: string, ownerId: string) {
  await sql`
    DELETE FROM citacitaku_generation_locks
    WHERE cache_key = ${cacheKey} AND owner_id = ${ownerId}
  `;
}

async function renewGenerationLock(cacheKey: string, ownerId: string) {
  await sql`
    UPDATE citacitaku_generation_locks
    SET lease_expires_at = NOW() + (${GENERATION_LOCK_LEASE_SECONDS} * INTERVAL '1 second')
    WHERE cache_key = ${cacheKey} AND owner_id = ${ownerId}
  `;
}

export class CitacitakuQueueTimeoutError extends Error {
  constructor(message = "Permintaan sedang ramai. Silakan coba lagi sebentar.") {
    super(message);
    this.name = "CitacitakuQueueTimeoutError";
  }
}

export async function getOrCreateDailyGuidance<T>(
  dream: string,
  grade: "10" | "11" | "12",
  createValue: () => Promise<CacheFactoryResult<T>>,
): Promise<GuidanceCacheResult<T>> {
  const identity = buildGuidanceCacheKey(dream, grade);
  const existing = await readGuidanceCache<T>(identity.cacheKey);
  if (existing) return { ...existing, cacheStatus: "hit" };

  const ownerId = randomUUID();
  const deadline = Date.now() + positiveInteger(
    process.env.CITACITAKU_SINGLE_FLIGHT_TIMEOUT_MS,
    DEFAULT_SINGLE_FLIGHT_TIMEOUT_MS,
    240_000,
  );
  let waitedForPeer = false;

  while (Date.now() < deadline) {
    if (await tryAcquireGenerationLock(identity.cacheKey, ownerId)) {
      const heartbeat = setInterval(() => {
        void renewGenerationLock(identity.cacheKey, ownerId).catch((error) => {
          console.error("[citacitaku:single-flight:heartbeat]", error instanceof Error ? error.message : error);
        });
      }, 30_000);
      try {
        const afterLock = await readGuidanceCache<T>(identity.cacheKey);
        if (afterLock) return { ...afterLock, cacheStatus: waitedForPeer ? "shared" : "hit" };

        const created = await createValue();
        await writeGuidanceCache(identity, created);
        return {
          payload: created.payload,
          metadata: created.metadata,
          cacheDate: identity.cacheDate,
          cacheStatus: waitedForPeer ? "shared" : "miss",
        };
      } finally {
        clearInterval(heartbeat);
        await releaseGenerationLock(identity.cacheKey, ownerId).catch(() => undefined);
      }
    }

    waitedForPeer = true;
    await sleep(350 + Math.floor(Math.random() * 250));
    const shared = await readGuidanceCache<T>(identity.cacheKey);
    if (shared) return { ...shared, cacheStatus: "shared" };
  }

  throw new CitacitakuQueueTimeoutError();
}

function redisRestConfiguration() {
  const url = (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "").replace(/\/$/, "");
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";
  return url && token ? { url, token } : null;
}

async function incrementRedisBuckets(bucketKeys: string[]) {
  const config = redisRestConfiguration();
  if (!config) return null;

  const commands = bucketKeys.flatMap((key) => [
    ["INCR", key],
    ["EXPIRE", key, String(RATE_WINDOW_SECONDS), "NX"],
  ]);
  const response = await fetch(`${config.url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
    signal: AbortSignal.timeout(3_000),
  });
  if (!response.ok) throw new Error(`Redis rate limiter ${response.status}`);
  const payload = await response.json() as RedisPipelineItem[];
  if (!Array.isArray(payload) || payload.some((item) => item.error)) throw new Error("Redis rate limiter response invalid.");
  return bucketKeys.map((_, index) => Number(payload[index * 2]?.result ?? 0));
}

async function incrementPostgresBucket(bucketKey: string) {
  await ensureScalabilitySchema();
  const result = await sql<{ request_count: number }>`
    INSERT INTO citacitaku_rate_limit_buckets (bucket_key, request_count, expires_at)
    VALUES (${bucketKey}, 1, NOW() + (${RATE_WINDOW_SECONDS} * INTERVAL '1 second'))
    ON CONFLICT (bucket_key) DO UPDATE SET
      request_count = CASE
        WHEN citacitaku_rate_limit_buckets.expires_at <= NOW() THEN 1
        ELSE citacitaku_rate_limit_buckets.request_count + 1
      END,
      expires_at = CASE
        WHEN citacitaku_rate_limit_buckets.expires_at <= NOW()
          THEN NOW() + (${RATE_WINDOW_SECONDS} * INTERVAL '1 second')
        ELSE citacitaku_rate_limit_buckets.expires_at
      END
    RETURNING request_count
  `;
  if (Math.random() < 0.01) {
    void sql`DELETE FROM citacitaku_rate_limit_buckets WHERE expires_at <= NOW()`.catch(() => undefined);
  }
  return Number(result.rows[0]?.request_count ?? 1);
}

function rateLimitIdentities(request: NextRequest, clientId: string) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip") || "unknown";
  const session = request.cookies.get(SESSION_COOKIE_NAME)?.value || "";
  const userAgent = request.headers.get("user-agent") || "unknown";
  const language = request.headers.get("accept-language") || "unknown";
  const principal = session
    ? `session:${session}`
    : clientId
      ? `client:${clientId}`
      : `fingerprint:${ip}:${userAgent}:${language}`;
  const window = Math.floor(Date.now() / (RATE_WINDOW_SECONDS * 1000));
  return [
    `citacitaku:rate:principal:${window}:${hash(principal)}`,
    `citacitaku:rate:network:${window}:${hash(ip)}`,
  ];
}

export async function checkCitacitakuRateLimit(request: NextRequest, clientId: string) {
  const keys = rateLimitIdentities(request, clientId);
  const clientLimit = positiveInteger(process.env.CITACITAKU_RATE_LIMIT_PER_MINUTE, DEFAULT_CLIENT_LIMIT, 1_000);
  const networkLimit = positiveInteger(process.env.CITACITAKU_NETWORK_RATE_LIMIT_PER_MINUTE, DEFAULT_NETWORK_LIMIT, 10_000);
  let counts: number[];
  let backend: "redis" | "postgres" = "redis";

  try {
    counts = await incrementRedisBuckets(keys) ?? [];
    if (counts.length !== keys.length) throw new Error("Redis/KV belum dikonfigurasi.");
  } catch (error) {
    backend = "postgres";
    if (!redisFallbackWarningLogged) {
      redisFallbackWarningLogged = true;
      console.warn("[citacitaku:rate-limit] Redis/KV tidak tersedia; memakai Postgres.", error instanceof Error ? error.message : error);
    }
    counts = await Promise.all(keys.map(incrementPostgresBucket));
  }

  return {
    limited: counts[0] > clientLimit || counts[1] > networkLimit,
    retryAfterSeconds: RATE_WINDOW_SECONDS,
    backend,
  };
}

function providerConcurrency(provider: string) {
  const specific = provider === "openai"
    ? process.env.CITACITAKU_OPENAI_CONCURRENCY
    : provider === "gemini"
      ? process.env.CITACITAKU_GEMINI_CONCURRENCY
      : undefined;
  return positiveInteger(specific || process.env.CITACITAKU_AI_CONCURRENCY, DEFAULT_PROVIDER_CONCURRENCY, 50);
}

async function tryAcquireProviderSlot(provider: string, ownerId: string, concurrency: number) {
  await ensureScalabilitySchema();
  await sql`
    INSERT INTO citacitaku_provider_slots (provider, slot_number)
    SELECT ${provider}, generate_series(1, ${concurrency})
    ON CONFLICT (provider, slot_number) DO NOTHING
  `;
  const result = await sql<{ slot_number: number }>`
    WITH available_slot AS (
      SELECT provider, slot_number
      FROM citacitaku_provider_slots
      WHERE provider = ${provider}
        AND slot_number <= ${concurrency}
        AND (owner_id IS NULL OR lease_expires_at <= NOW())
      ORDER BY slot_number
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    )
    UPDATE citacitaku_provider_slots AS slots
    SET owner_id = ${ownerId},
        lease_expires_at = NOW() + (${PROVIDER_SLOT_LEASE_SECONDS} * INTERVAL '1 second'),
        acquired_at = NOW()
    FROM available_slot
    WHERE slots.provider = available_slot.provider
      AND slots.slot_number = available_slot.slot_number
    RETURNING slots.slot_number
  `;
  return result.rows[0]?.slot_number ?? null;
}

async function releaseProviderSlot(provider: string, slotNumber: number, ownerId: string) {
  await sql`
    UPDATE citacitaku_provider_slots
    SET owner_id = NULL, lease_expires_at = NULL, acquired_at = NULL
    WHERE provider = ${provider}
      AND slot_number = ${slotNumber}
      AND owner_id = ${ownerId}
  `;
}

async function renewProviderSlot(provider: string, slotNumber: number, ownerId: string) {
  await sql`
    UPDATE citacitaku_provider_slots
    SET lease_expires_at = NOW() + (${PROVIDER_SLOT_LEASE_SECONDS} * INTERVAL '1 second')
    WHERE provider = ${provider}
      AND slot_number = ${slotNumber}
      AND owner_id = ${ownerId}
  `;
}

export async function withAiProviderSlot<T>(provider: "openai" | "gemini", task: () => Promise<T>): Promise<T> {
  const concurrency = providerConcurrency(provider);
  const ownerId = randomUUID();
  const deadline = Date.now() + positiveInteger(
    process.env.CITACITAKU_AI_QUEUE_TIMEOUT_MS,
    DEFAULT_PROVIDER_QUEUE_TIMEOUT_MS,
    240_000,
  );

  while (Date.now() < deadline) {
    const slotNumber = await tryAcquireProviderSlot(provider, ownerId, concurrency);
    if (slotNumber !== null) {
      const heartbeat = setInterval(() => {
        void renewProviderSlot(provider, slotNumber, ownerId).catch((error) => {
          console.error("[citacitaku:provider-slot:heartbeat]", error instanceof Error ? error.message : error);
        });
      }, 25_000);
      try {
        return await task();
      } finally {
        clearInterval(heartbeat);
        await releaseProviderSlot(provider, slotNumber, ownerId).catch(() => undefined);
      }
    }
    await sleep(200 + Math.floor(Math.random() * 200));
  }

  throw new CitacitakuQueueTimeoutError(`Antrean ${provider} sedang penuh. Silakan coba lagi sebentar.`);
}
