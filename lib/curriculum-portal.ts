import "server-only";

import { randomUUID } from "crypto";
import { sql } from "@vercel/postgres";
import { year7ScienceChapters } from "@/lib/curriculum/year7/science";

export type CurriculumNodeType = "year" | "subject" | "chapter" | "lesson";

type LegacyNodeType = "class" | "module" | "material";

type SupportedNodeType = CurriculumNodeType | LegacyNodeType;

export interface CurriculumNode {
  id: string;
  parentId: string | null;
  nodeType: CurriculumNodeType;
  title: string;
  slug: string;
  position: number;
  metadata: Record<string, unknown>;
  createdByUserId: string;
  updatedByUserId: string;
  createdAt: Date;
  updatedAt: Date;
  children: CurriculumNode[];
}

export interface CurriculumYearSummary {
  id: string;
  title: string;
  slug: string;
  position: number;
  yearLevel: number | null;
  subjects: CurriculumSubjectSummary[];
}

export interface CurriculumSubjectSummary {
  id: string;
  title: string;
  slug: string;
  position: number;
  description: string;
  chapterCount: number;
  lessonCount: number;
  chapters: CurriculumChapterSummary[];
}

export interface CurriculumChapterSummary {
  id: string;
  title: string;
  slug: string;
  position: number;
  weekRange: string;
  lessonCount: number;
}

export interface CurriculumLessonSummary {
  id: string;
  title: string;
  slug: string;
  position: number;
  week: string;
  lessonCode: string;
}

export interface CurriculumChapterContext {
  year: CurriculumYearSummary;
  subject: CurriculumSubjectSummary;
  chapter: CurriculumChapterSummary & {
    lessons: CurriculumLessonSummary[];
    strand: string;
    unitTitle: string;
    learningOutcomes: string[];
  };
  previousChapter: CurriculumChapterSummary | null;
  nextChapter: CurriculumChapterSummary | null;
}

export interface CurriculumLessonContext {
  year: CurriculumYearSummary;
  subject: CurriculumSubjectSummary;
  chapter: CurriculumChapterSummary;
  lesson: CurriculumLessonSummary;
  previousLesson: CurriculumLessonSummary | null;
  nextLesson: CurriculumLessonSummary | null;
}

type CurriculumNodeRow = {
  id: string;
  parent_id: string | null;
  node_type: string;
  title: string;
  slug: string | null;
  position: number;
  metadata: unknown;
  created_by_user_id: string | null;
  updated_by_user_id: string | null;
  created_at: Date;
  updated_at: Date;
};

const NODE_TYPES = new Set<CurriculumNodeType>(["year", "subject", "chapter", "lesson"]);

const LEGACY_TYPE_MAP: Record<LegacyNodeType, CurriculumNodeType> = {
  class: "year",
  module: "chapter",
  material: "lesson",
};

const parentTypeByNode: Record<CurriculumNodeType, CurriculumNodeType | null> = {
  year: null,
  subject: "year",
  chapter: "subject",
  lesson: "chapter",
};

let curriculumSchemaReady: Promise<void> | null = null;
let curriculumSeedReady: Promise<void> | null = null;

function normalizeId(value: string | null | undefined) {
  const cleaned = (value ?? "").trim();
  return cleaned || null;
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeNodeType(value: string): CurriculumNodeType {
  const cleaned = value.trim().toLowerCase() as SupportedNodeType;

  if (NODE_TYPES.has(cleaned as CurriculumNodeType)) {
    return cleaned as CurriculumNodeType;
  }

  if (cleaned in LEGACY_TYPE_MAP) {
    return LEGACY_TYPE_MAP[cleaned as LegacyNodeType];
  }

  throw new Error("Invalid node type.");
}

function normalizeTitle(value: string) {
  const cleaned = value.trim();

  if (!cleaned) {
    throw new Error("Title is required.");
  }

  if (cleaned.length > 160) {
    throw new Error("Title is too long.");
  }

  return cleaned;
}

function sanitizeText(value: unknown, maxLength: number) {
  const cleaned = String(value ?? "").trim();
  return cleaned.slice(0, maxLength);
}

function parseYearLevelFromTitle(title: string) {
  const match = title.match(/\d+/);
  const parsed = match ? Number(match[0]) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : null;
}

function toJsonbString(value: unknown): string {
  const serialized = JSON.stringify(value ?? {});
  return serialized ?? "{}";
}

function normalizeMetadata(
  nodeType: CurriculumNodeType,
  input: unknown
): Record<string, unknown> {
  if (!isObjectRecord(input)) return {};

  if (nodeType === "year") {
    const parsedYearLevel = Number(input.yearLevel);
    return {
      yearLevel: Number.isFinite(parsedYearLevel) && parsedYearLevel > 0 ? Math.floor(parsedYearLevel) : null,
    };
  }

  if (nodeType === "subject") {
    return {
      description: sanitizeText(input.description, 280),
    };
  }

  if (nodeType === "chapter") {
    const learningOutcomes = Array.isArray(input.learningOutcomes)
      ? input.learningOutcomes
          .map((item) => sanitizeText(item, 220))
          .filter((item) => item.length > 0)
          .slice(0, 20)
      : [];

    return {
      weekRange: sanitizeText(input.weekRange, 80),
      strand: sanitizeText(input.strand, 80),
      unitTitle: sanitizeText(input.unitTitle, 280),
      learningOutcomes,
    };
  }

  return {
    week: sanitizeText(input.week, 40),
    lessonCode: sanitizeText(input.lessonCode, 40),
  };
}

function extractString(value: unknown) {
  return sanitizeText(value, 280);
}

function extractYearLevel(metadata: Record<string, unknown>) {
  const parsed = Number(metadata.yearLevel);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : null;
}

function extractLearningOutcomes(metadata: Record<string, unknown>) {
  if (!Array.isArray(metadata.learningOutcomes)) return [];
  return metadata.learningOutcomes
    .map((item) => sanitizeText(item, 220))
    .filter((item) => item.length > 0)
    .slice(0, 20);
}

function parseFirstNumber(value: unknown) {
  const cleaned = sanitizeText(value, 280);
  const match = cleaned.match(/-?\d+(?:\.\d+)?/);
  if (!match) return null;

  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseNumberSequence(value: unknown) {
  const cleaned = sanitizeText(value, 120);
  const tokens = cleaned.match(/\d+/g);
  if (!tokens) return [];

  return tokens
    .map((token) => Number(token))
    .filter((token) => Number.isFinite(token));
}

function compareNullableNumber(left: number | null, right: number | null) {
  if (left == null && right == null) return 0;
  if (left == null) return 1;
  if (right == null) return -1;
  return left - right;
}

function compareNumberSequence(left: number[], right: number[]) {
  const maxLength = Math.max(left.length, right.length);

  for (let index = 0; index < maxLength; index += 1) {
    const leftValue = left[index];
    const rightValue = right[index];

    if (leftValue == null && rightValue == null) return 0;
    if (leftValue == null) return 1;
    if (rightValue == null) return -1;
    if (leftValue !== rightValue) return leftValue - rightValue;
  }

  return 0;
}

function sortChapterNodes(nodes: CurriculumNode[]) {
  return [...nodes].sort((left, right) => {
    const weekCompare = compareNullableNumber(
      parseFirstNumber(left.metadata.weekRange),
      parseFirstNumber(right.metadata.weekRange)
    );
    if (weekCompare !== 0) return weekCompare;

    if (left.position !== right.position) return left.position - right.position;
    return left.title.localeCompare(right.title);
  });
}

function sortLessonNodes(nodes: CurriculumNode[]) {
  return [...nodes].sort((left, right) => {
    const weekCompare = compareNullableNumber(
      parseFirstNumber(left.metadata.week),
      parseFirstNumber(right.metadata.week)
    );
    if (weekCompare !== 0) return weekCompare;

    const codeCompare = compareNumberSequence(
      parseNumberSequence(left.metadata.lessonCode),
      parseNumberSequence(right.metadata.lessonCode)
    );
    if (codeCompare !== 0) return codeCompare;

    if (left.position !== right.position) return left.position - right.position;
    return left.title.localeCompare(right.title);
  });
}

function slugify(value: string) {
  const base = value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return base || "item";
}

async function ensureUniqueSlug(input: {
  parentId: string | null;
  desiredSlug: string;
  excludeNodeId?: string | null;
}) {
  const siblings = await sql<{ slug: string }>`
    SELECT slug
    FROM curriculum_nodes
    WHERE parent_id IS NOT DISTINCT FROM ${input.parentId}
      AND id <> ${input.excludeNodeId ?? ""}
  `;

  const existing = new Set(
    siblings.rows
      .map((row) => row.slug)
      .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
  );

  let nextSlug = slugify(input.desiredSlug);
  if (!existing.has(nextSlug)) return nextSlug;

  let suffix = 2;
  while (existing.has(`${nextSlug}-${suffix}`)) {
    suffix += 1;
  }

  return `${nextSlug}-${suffix}`;
}

async function ensureCurriculumSchema() {
  if (curriculumSchemaReady) return curriculumSchemaReady;

  curriculumSchemaReady = (async () => {
    await sql`
      CREATE TABLE IF NOT EXISTS curriculum_nodes (
        id TEXT PRIMARY KEY,
        parent_id TEXT REFERENCES curriculum_nodes(id) ON DELETE CASCADE,
        node_type TEXT NOT NULL,
        title TEXT NOT NULL,
        slug TEXT NOT NULL DEFAULT '',
        position INTEGER NOT NULL DEFAULT 0,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_by_user_id TEXT,
        updated_by_user_id TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    await sql`ALTER TABLE curriculum_nodes ADD COLUMN IF NOT EXISTS slug TEXT;`;
    await sql`ALTER TABLE curriculum_nodes ADD COLUMN IF NOT EXISTS metadata JSONB;`;
    await sql`UPDATE curriculum_nodes SET slug = '' WHERE slug IS NULL;`;
    await sql`UPDATE curriculum_nodes SET metadata = '{}'::jsonb WHERE metadata IS NULL;`;
    await sql`ALTER TABLE curriculum_nodes ALTER COLUMN slug SET DEFAULT '';`;
    await sql`ALTER TABLE curriculum_nodes ALTER COLUMN slug SET NOT NULL;`;
    await sql`ALTER TABLE curriculum_nodes ALTER COLUMN metadata SET DEFAULT '{}'::jsonb;`;
    await sql`ALTER TABLE curriculum_nodes ALTER COLUMN metadata SET NOT NULL;`;

    await sql`UPDATE curriculum_nodes SET node_type = 'year' WHERE node_type = 'class';`;
    await sql`UPDATE curriculum_nodes SET node_type = 'chapter' WHERE node_type = 'module';`;
    await sql`UPDATE curriculum_nodes SET node_type = 'lesson' WHERE node_type = 'material';`;
    await sql`
      UPDATE curriculum_nodes AS node
      SET node_type = 'subject'
      FROM curriculum_nodes AS parent
      WHERE node.node_type = 'chapter'
        AND parent.id = node.parent_id
        AND parent.node_type = 'year'
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS curriculum_nodes_parent_position_idx
      ON curriculum_nodes (parent_id, position, created_at)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS curriculum_nodes_parent_type_idx
      ON curriculum_nodes (parent_id, node_type)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS curriculum_nodes_parent_slug_idx
      ON curriculum_nodes (parent_id, slug)
    `;
  })();

  return curriculumSchemaReady;
}

function mapRow(row: CurriculumNodeRow): Omit<CurriculumNode, "children"> {
  let metadata: Record<string, unknown> = {};

  if (isObjectRecord(row.metadata)) {
    metadata = row.metadata;
  } else if (typeof row.metadata === "string") {
    try {
      const parsed = JSON.parse(row.metadata);
      if (isObjectRecord(parsed)) {
        metadata = parsed;
      }
    } catch {
      metadata = {};
    }
  }

  return {
    id: row.id,
    parentId: row.parent_id,
    nodeType: normalizeNodeType(row.node_type),
    title: row.title,
    slug: sanitizeText(row.slug, 180) || slugify(row.title),
    position: row.position,
    metadata,
    createdByUserId: row.created_by_user_id ?? "",
    updatedByUserId: row.updated_by_user_id ?? "",
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

async function getNodeById(nodeId: string) {
  const result = await sql<CurriculumNodeRow>`
    SELECT
      id,
      parent_id,
      node_type,
      title,
      slug,
      position,
      metadata,
      created_by_user_id,
      updated_by_user_id,
      created_at,
      updated_at
    FROM curriculum_nodes
    WHERE id = ${nodeId}
    LIMIT 1
  `;

  return result.rows[0] ?? null;
}

async function getNextPosition(parentId: string | null) {
  const result = await sql<{ next_position: number }>`
    SELECT COALESCE(MAX(position), -1) + 1 AS next_position
    FROM curriculum_nodes
    WHERE parent_id IS NOT DISTINCT FROM ${parentId}
  `;

  return Number(result.rows[0]?.next_position ?? 0);
}

function buildTree(
  rows: Array<Omit<CurriculumNode, "children">>,
  parentId: string | null
): CurriculumNode[] {
  const siblings = rows
    .filter((row) => row.parentId === parentId)
    .sort((a, b) => {
      if (a.position !== b.position) return a.position - b.position;
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

  return siblings.map((row) => ({
    ...row,
    children: buildTree(rows, row.id),
  }));
}

async function seedDefaultCurriculumIfEmpty() {
  if (curriculumSeedReady) return curriculumSeedReady;

  curriculumSeedReady = (async () => {
    const yearResult = await sql<{ id: string }>`
      SELECT id
      FROM curriculum_nodes
      WHERE parent_id IS NULL
        AND node_type = 'year'
        AND slug = 'year-7'
      LIMIT 1
    `;

    const yearId = yearResult.rows[0]?.id ?? randomUUID();

    if (!yearResult.rows[0]) {
      await sql`
        INSERT INTO curriculum_nodes (id, parent_id, node_type, title, slug, position, metadata)
        VALUES (
          ${yearId},
          ${null},
          ${"year"},
          ${"Year 7"},
          ${"year-7"},
          ${0},
          ${toJsonbString({ yearLevel: 7 })}::jsonb
        )
      `;
    }

    const subjectResult = await sql<{ id: string }>`
      SELECT id
      FROM curriculum_nodes
      WHERE parent_id = ${yearId}
        AND node_type = 'subject'
        AND slug = 'science'
      LIMIT 1
    `;

    const subjectId = subjectResult.rows[0]?.id ?? randomUUID();

    if (!subjectResult.rows[0]) {
      await sql`
        INSERT INTO curriculum_nodes (id, parent_id, node_type, title, slug, position, metadata)
        VALUES (
          ${subjectId},
          ${yearId},
          ${"subject"},
          ${"Science"},
          ${"science"},
          ${0},
          ${toJsonbString({
            description: "Physics, chemistry, biology, and scientific inquiry.",
          })}::jsonb
        )
      `;
    }

    const existingChapterCountResult = await sql<{ count: string }>`
      SELECT COUNT(*)::text AS count
      FROM curriculum_nodes
      WHERE parent_id = ${subjectId}
        AND node_type = 'chapter'
    `;
    const existingChapterCount = Number(existingChapterCountResult.rows[0]?.count ?? 0);
    if (existingChapterCount > 0) return;

    for (const [chapterIndex, chapter] of year7ScienceChapters.entries()) {
      const chapterId = randomUUID();
      await sql`
        INSERT INTO curriculum_nodes (id, parent_id, node_type, title, slug, position, metadata)
        VALUES (
          ${chapterId},
          ${subjectId},
          ${"chapter"},
          ${chapter.shortTitle},
          ${chapter.slug},
          ${chapterIndex},
          ${toJsonbString({
            weekRange: chapter.weekRange,
            strand: chapter.strand,
            unitTitle: chapter.unitTitle,
            learningOutcomes: chapter.learningOutcomes,
          })}::jsonb
        )
      `;

      for (const [lessonIndex, lesson] of chapter.lessons.entries()) {
        const lessonId = randomUUID();
        const lessonSlug = lesson.slug ?? slugify(`${lesson.lessonCode}-${lesson.title}`);

        await sql`
          INSERT INTO curriculum_nodes (id, parent_id, node_type, title, slug, position, metadata)
          VALUES (
            ${lessonId},
            ${chapterId},
            ${"lesson"},
            ${lesson.title},
            ${lessonSlug},
            ${lessonIndex},
            ${toJsonbString({
              week: lesson.week,
              lessonCode: lesson.lessonCode,
            })}::jsonb
          )
        `;
      }
    }
  })();

  return curriculumSeedReady;
}

async function ensureCurriculumReady() {
  await ensureCurriculumSchema();
  await seedDefaultCurriculumIfEmpty();
}

export async function listCurriculumTree() {
  await ensureCurriculumReady();

  const result = await sql<CurriculumNodeRow>`
    SELECT
      id,
      parent_id,
      node_type,
      title,
      slug,
      position,
      metadata,
      created_by_user_id,
      updated_by_user_id,
      created_at,
      updated_at
    FROM curriculum_nodes
  `;

  const mapped = result.rows.map((row) => mapRow(row));
  return buildTree(mapped, null);
}

export async function createCurriculumNode(input: {
  nodeType: string;
  parentId?: string | null;
  title: string;
  metadata?: unknown;
  actorUserId?: string;
}) {
  await ensureCurriculumReady();

  const nodeType = normalizeNodeType(input.nodeType);
  const parentId = normalizeId(input.parentId);
  const title = normalizeTitle(input.title);
  const metadata = normalizeMetadata(nodeType, input.metadata);
  if (nodeType === "year" && metadata.yearLevel == null) {
    metadata.yearLevel = parseYearLevelFromTitle(title);
  }
  const actorUserId = normalizeId(input.actorUserId);
  const expectedParentType = parentTypeByNode[nodeType];

  if (expectedParentType === null) {
    if (parentId) {
      throw new Error("Year nodes cannot have a parent.");
    }
  } else {
    if (!parentId) {
      throw new Error(`${nodeType} requires a parent ${expectedParentType}.`);
    }

    const parent = await getNodeById(parentId);
    if (!parent) {
      throw new Error("Parent node was not found.");
    }

    if (normalizeNodeType(parent.node_type) !== expectedParentType) {
      throw new Error(
        `${nodeType} must be placed under a ${expectedParentType}, not ${parent.node_type}.`
      );
    }
  }

  const id = randomUUID();
  const nextPosition = await getNextPosition(parentId);
  const slug = await ensureUniqueSlug({
    parentId,
    desiredSlug: title,
  });

  const result = await sql<CurriculumNodeRow>`
    INSERT INTO curriculum_nodes (
      id,
      parent_id,
      node_type,
      title,
      slug,
      position,
      metadata,
      created_by_user_id,
      updated_by_user_id
    )
    VALUES (
      ${id},
      ${parentId},
      ${nodeType},
      ${title},
      ${slug},
      ${nextPosition},
      ${toJsonbString(metadata)}::jsonb,
      ${actorUserId},
      ${actorUserId}
    )
    RETURNING
      id,
      parent_id,
      node_type,
      title,
      slug,
      position,
      metadata,
      created_by_user_id,
      updated_by_user_id,
      created_at,
      updated_at
  `;

  const row = result.rows[0];
  if (!row) {
    throw new Error("Failed to create curriculum node.");
  }

  return {
    ...mapRow(row),
    children: [],
  };
}

export async function updateCurriculumNode(input: {
  nodeId: string;
  title: string;
  metadata?: unknown;
  actorUserId?: string;
}) {
  await ensureCurriculumReady();

  const nodeId = normalizeId(input.nodeId);
  const title = normalizeTitle(input.title);
  const actorUserId = normalizeId(input.actorUserId);

  if (!nodeId) {
    throw new Error("Node id is required.");
  }

  const existing = await getNodeById(nodeId);
  if (!existing) {
    throw new Error("Curriculum node not found.");
  }

  const nodeType = normalizeNodeType(existing.node_type);
  const metadata = normalizeMetadata(nodeType, input.metadata);
  if (nodeType === "year" && metadata.yearLevel == null) {
    metadata.yearLevel = parseYearLevelFromTitle(title);
  }

  const result = await sql<CurriculumNodeRow>`
    UPDATE curriculum_nodes
    SET
      title = ${title},
      metadata = ${toJsonbString(metadata)}::jsonb,
      updated_by_user_id = ${actorUserId},
      updated_at = NOW()
    WHERE id = ${nodeId}
    RETURNING
      id,
      parent_id,
      node_type,
      title,
      slug,
      position,
      metadata,
      created_by_user_id,
      updated_by_user_id,
      created_at,
      updated_at
  `;

  const row = result.rows[0];
  if (!row) {
    throw new Error("Curriculum node not found.");
  }

  return {
    ...mapRow(row),
    children: [],
  };
}

export async function deleteCurriculumNode(nodeIdInput: string) {
  await ensureCurriculumReady();

  const nodeId = normalizeId(nodeIdInput);
  if (!nodeId) {
    throw new Error("Node id is required.");
  }

  const result = await sql<{ id: string }>`
    DELETE FROM curriculum_nodes
    WHERE id = ${nodeId}
    RETURNING id
  `;

  if (!result.rows[0]) {
    throw new Error("Curriculum node not found.");
  }
}

export async function reorderCurriculumSiblings(input: {
  parentId?: string | null;
  orderedNodeIds: string[];
  actorUserId?: string;
}) {
  await ensureCurriculumReady();

  const parentId = normalizeId(input.parentId);
  const orderedNodeIds = Array.from(
    new Set(
      input.orderedNodeIds
        .map((value) => value.trim())
        .filter((value) => value.length > 0)
    )
  );

  if (orderedNodeIds.length === 0) {
    throw new Error("orderedNodeIds is required.");
  }

  const actorUserId = normalizeId(input.actorUserId);

  const siblings = await sql<{ id: string }>`
    SELECT id
    FROM curriculum_nodes
    WHERE parent_id IS NOT DISTINCT FROM ${parentId}
    ORDER BY position ASC, created_at ASC
  `;

  const currentNodeIds = siblings.rows.map((row) => row.id);

  if (currentNodeIds.length !== orderedNodeIds.length) {
    throw new Error("orderedNodeIds must include every sibling exactly once.");
  }

  const currentSet = new Set(currentNodeIds);
  if (orderedNodeIds.some((id) => !currentSet.has(id))) {
    throw new Error("orderedNodeIds contains invalid node ids.");
  }

  for (const [position, nodeId] of orderedNodeIds.entries()) {
    await sql`
      UPDATE curriculum_nodes
      SET
        position = ${position},
        updated_by_user_id = ${actorUserId},
        updated_at = NOW()
      WHERE id = ${nodeId}
        AND parent_id IS NOT DISTINCT FROM ${parentId}
    `;
  }
}

function mapLesson(node: CurriculumNode): CurriculumLessonSummary {
  return {
    id: node.id,
    title: node.title,
    slug: node.slug,
    position: node.position,
    week: extractString(node.metadata.week),
    lessonCode: extractString(node.metadata.lessonCode),
  };
}

function mapChapter(node: CurriculumNode): CurriculumChapterSummary {
  return {
    id: node.id,
    title: node.title,
    slug: node.slug,
    position: node.position,
    weekRange: extractString(node.metadata.weekRange),
    lessonCount: node.children.length,
  };
}

function mapSubject(node: CurriculumNode): CurriculumSubjectSummary {
  const sortedChapters = sortChapterNodes(node.children);
  const chapters = sortedChapters.map(mapChapter);
  const lessonCount = sortedChapters.reduce((sum, chapter) => sum + chapter.children.length, 0);

  return {
    id: node.id,
    title: node.title,
    slug: node.slug,
    position: node.position,
    description: extractString(node.metadata.description),
    chapterCount: chapters.length,
    lessonCount,
    chapters,
  };
}

function mapYear(node: CurriculumNode): CurriculumYearSummary {
  return {
    id: node.id,
    title: node.title,
    slug: node.slug,
    position: node.position,
    yearLevel: extractYearLevel(node.metadata),
    subjects: node.children.map(mapSubject),
  };
}

export async function listCurriculumOutline() {
  const tree = await listCurriculumTree();
  return tree.map(mapYear);
}

export async function getCurriculumChapterContext(input: {
  yearSlug: string;
  subjectSlug: string;
  chapterSlug: string;
}): Promise<CurriculumChapterContext | null> {
  const yearSlug = slugify(input.yearSlug);
  const subjectSlug = slugify(input.subjectSlug);
  const chapterSlug = slugify(input.chapterSlug);

  const tree = await listCurriculumTree();

  const yearNode = tree.find((node) => node.slug === yearSlug);
  if (!yearNode) return null;

  const subjectNode = yearNode.children.find((node) => node.slug === subjectSlug);
  if (!subjectNode) return null;

  const chapters = sortChapterNodes(subjectNode.children);
  const chapterIndex = chapters.findIndex((node) => node.slug === chapterSlug);
  if (chapterIndex < 0) return null;

  const chapterNode = chapters[chapterIndex];
  const previousChapter = chapterIndex > 0 ? mapChapter(chapters[chapterIndex - 1]) : null;
  const nextChapter = chapterIndex < chapters.length - 1 ? mapChapter(chapters[chapterIndex + 1]) : null;
  const lessons = sortLessonNodes(chapterNode.children);

  const chapter = {
    ...mapChapter(chapterNode),
    lessons: lessons.map(mapLesson),
    strand: extractString(chapterNode.metadata.strand),
    unitTitle: extractString(chapterNode.metadata.unitTitle),
    learningOutcomes: extractLearningOutcomes(chapterNode.metadata),
  };

  return {
    year: mapYear(yearNode),
    subject: mapSubject(subjectNode),
    chapter,
    previousChapter,
    nextChapter,
  };
}

export async function getCurriculumLessonContext(input: {
  yearSlug: string;
  subjectSlug: string;
  chapterSlug: string;
  lessonSlug: string;
}): Promise<CurriculumLessonContext | null> {
  const yearSlug = slugify(input.yearSlug);
  const subjectSlug = slugify(input.subjectSlug);
  const chapterSlug = slugify(input.chapterSlug);
  const lessonSlug = slugify(input.lessonSlug);

  const chapterContext = await getCurriculumChapterContext({
    yearSlug,
    subjectSlug,
    chapterSlug,
  });

  if (!chapterContext) return null;

  const lessonIndex = chapterContext.chapter.lessons.findIndex((lesson) => lesson.slug === lessonSlug);
  if (lessonIndex < 0) return null;

  const lesson = chapterContext.chapter.lessons[lessonIndex];
  const previousLesson = lessonIndex > 0 ? chapterContext.chapter.lessons[lessonIndex - 1] : null;
  const nextLesson =
    lessonIndex < chapterContext.chapter.lessons.length - 1
      ? chapterContext.chapter.lessons[lessonIndex + 1]
      : null;

  return {
    year: chapterContext.year,
    subject: chapterContext.subject,
    chapter: {
      id: chapterContext.chapter.id,
      title: chapterContext.chapter.title,
      slug: chapterContext.chapter.slug,
      position: chapterContext.chapter.position,
      weekRange: chapterContext.chapter.weekRange,
      lessonCount: chapterContext.chapter.lessonCount,
    },
    lesson,
    previousLesson,
    nextLesson,
  };
}
