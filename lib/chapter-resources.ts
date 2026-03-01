import "server-only";

import { sqlQuery as sql } from "@/lib/postgres-query";

export type ChapterResourceType = "pdf" | "video" | "document" | "link" | "other";

export interface ChapterResource {
  id: string;
  chapterSlug: string;
  subject: string;
  yearLevel: number;
  title: string;
  resourceType: ChapterResourceType;
  url: string;
  description: string;
  createdByUserId: string;
  createdByEmail: string;
  createdAt: Date;
}

type ChapterResourceRow = {
  id: string;
  chapter_slug: string;
  subject: string;
  year_level: number;
  title: string;
  resource_type: ChapterResourceType;
  url: string;
  description: string | null;
  created_by_user_id: string | null;
  created_by_email: string | null;
  created_at: Date;
};

let chapterResourcesSchemaReady: Promise<void> | null = null;

const RESOURCE_TYPES = new Set<ChapterResourceType>(["pdf", "video", "document", "link", "other"]);

function normalizeResourceType(input: string): ChapterResourceType {
  const value = input.trim().toLowerCase() as ChapterResourceType;
  return RESOURCE_TYPES.has(value) ? value : "other";
}

function normalizeSubject(input: string) {
  const value = input.trim().toLowerCase();
  return value || "science";
}

function normalizeYearLevel(input: number | string) {
  const parsed = Number(input);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 7;
}

function normalizeTitle(input: string) {
  const cleaned = input.trim();
  if (!cleaned) {
    throw new Error("Please provide a resource title.");
  }
  if (cleaned.length > 200) {
    throw new Error("Resource title is too long.");
  }
  return cleaned;
}

function normalizeDescription(input: string | null | undefined) {
  const cleaned = (input || "").trim();
  if (cleaned.length > 1000) {
    throw new Error("Description is too long.");
  }
  return cleaned;
}

function normalizeUrl(input: string) {
  const cleaned = input.trim();
  let parsed: URL;

  try {
    parsed = new URL(cleaned);
  } catch {
    throw new Error("Please enter a valid URL.");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("URL must start with http:// or https://");
  }

  return parsed.toString();
}

async function ensureChapterResourcesSchema() {
  if (chapterResourcesSchemaReady) return chapterResourcesSchemaReady;

  chapterResourcesSchemaReady = (async () => {
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS chapter_resources (
          id BIGSERIAL PRIMARY KEY,
          chapter_slug TEXT NOT NULL,
          subject TEXT NOT NULL DEFAULT 'science',
          year_level INTEGER NOT NULL DEFAULT 7,
          title TEXT NOT NULL,
          resource_type TEXT NOT NULL,
          url TEXT NOT NULL,
          description TEXT,
          created_by_user_id TEXT,
          created_by_email TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS chapter_resources_lookup_idx
        ON chapter_resources (chapter_slug, subject, year_level, created_at DESC)
      `;
    } catch (error) {
      chapterResourcesSchemaReady = null;
      throw error;
    }
  })();

  return chapterResourcesSchemaReady;
}

function mapRow(row: ChapterResourceRow): ChapterResource {
  return {
    id: row.id,
    chapterSlug: row.chapter_slug,
    subject: row.subject,
    yearLevel: row.year_level,
    title: row.title,
    resourceType: normalizeResourceType(row.resource_type),
    url: row.url,
    description: row.description ?? "",
    createdByUserId: row.created_by_user_id ?? "",
    createdByEmail: row.created_by_email ?? "",
    createdAt: new Date(row.created_at),
  };
}

export async function listChapterResources(input: {
  chapterSlug: string;
  subject?: string;
  yearLevel?: number | string;
}) {
  await ensureChapterResourcesSchema();

  const chapterSlug = input.chapterSlug.trim().toLowerCase();
  const subject = normalizeSubject(input.subject ?? "science");
  const yearLevel = normalizeYearLevel(input.yearLevel ?? 7);

  if (!chapterSlug) return [];

  const result = await sql<ChapterResourceRow>`
    SELECT
      id::text AS id,
      chapter_slug,
      subject,
      year_level,
      title,
      resource_type,
      url,
      description,
      created_by_user_id,
      created_by_email,
      created_at
    FROM chapter_resources
    WHERE chapter_slug = ${chapterSlug}
      AND subject = ${subject}
      AND year_level = ${yearLevel}
    ORDER BY created_at DESC
  `;

  return result.rows.map(mapRow);
}

export async function createChapterResource(input: {
  chapterSlug: string;
  subject?: string;
  yearLevel?: number | string;
  title: string;
  resourceType: string;
  url: string;
  description?: string;
  createdByUserId?: string;
  createdByEmail?: string;
}) {
  await ensureChapterResourcesSchema();

  const chapterSlug = input.chapterSlug.trim().toLowerCase();
  if (!chapterSlug) {
    throw new Error("Chapter slug is required.");
  }

  const subject = normalizeSubject(input.subject ?? "science");
  const yearLevel = normalizeYearLevel(input.yearLevel ?? 7);
  const title = normalizeTitle(input.title);
  const resourceType = normalizeResourceType(input.resourceType);
  const url = normalizeUrl(input.url);
  const description = normalizeDescription(input.description);
  const createdByUserId = (input.createdByUserId || "").trim();
  const createdByEmail = (input.createdByEmail || "").trim().toLowerCase();

  const result = await sql<ChapterResourceRow>`
    INSERT INTO chapter_resources (
      chapter_slug,
      subject,
      year_level,
      title,
      resource_type,
      url,
      description,
      created_by_user_id,
      created_by_email
    )
    VALUES (
      ${chapterSlug},
      ${subject},
      ${yearLevel},
      ${title},
      ${resourceType},
      ${url},
      ${description || null},
      ${createdByUserId || null},
      ${createdByEmail || null}
    )
    RETURNING
      id::text AS id,
      chapter_slug,
      subject,
      year_level,
      title,
      resource_type,
      url,
      description,
      created_by_user_id,
      created_by_email,
      created_at
  `;

  return mapRow(result.rows[0]);
}
