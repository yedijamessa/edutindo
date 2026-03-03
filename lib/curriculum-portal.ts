import "server-only";

import { randomUUID } from "crypto";
import { year7ScienceChapters } from "@/lib/curriculum/year7/science";
import { sqlQuery as sql } from "@/lib/postgres-query";

export const DEFAULT_CURRICULUM_SCHOOL_TITLE = "EDUTINDO School";
export const DEFAULT_CURRICULUM_SCHOOL_SLUG = "edutindo";
export const CURRICULUM_YEAR_OPTIONS = [
  { slug: "year-7", title: "Year 7", level: 7, position: 0 },
  { slug: "year-8", title: "Year 8", level: 8, position: 1 },
  { slug: "year-9", title: "Year 9", level: 9, position: 2 },
] as const;

export type CurriculumNodeType = "school" | "year" | "subject" | "chapter" | "lesson";

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

export interface CurriculumAssignmentTag {
  schoolSlug: string;
  yearSlug: string;
}

export interface CurriculumSchoolSummary {
  id: string;
  title: string;
  slug: string;
  position: number;
  years: CurriculumYearSummary[];
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
  preTestQuizId: string;
  postTestQuizId: string;
  preTestEnabled: boolean;
  postTestEnabled: boolean;
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
  school: CurriculumSchoolSummary;
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
  school: CurriculumSchoolSummary;
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

const NODE_TYPES = new Set<CurriculumNodeType>(["school", "year", "subject", "chapter", "lesson"]);

const LEGACY_TYPE_MAP: Record<LegacyNodeType, CurriculumNodeType> = {
  class: "year",
  module: "chapter",
  material: "lesson",
};

const parentTypeByNode: Record<CurriculumNodeType, CurriculumNodeType | null> = {
  school: null,
  year: "school",
  subject: null,
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

function getYearOptionBySlug(yearSlugInput: string) {
  const yearSlug = slugify(yearSlugInput);
  return CURRICULUM_YEAR_OPTIONS.find((option) => option.slug === yearSlug) ?? null;
}

function normalizeAssignmentTags(input: unknown): CurriculumAssignmentTag[] {
  if (!Array.isArray(input)) return [];

  const seen = new Set<string>();
  const normalized: CurriculumAssignmentTag[] = [];

  for (const item of input) {
    if (!isObjectRecord(item)) continue;

    const schoolSlug = slugify(sanitizeText(item.schoolSlug, 180));
    const yearOption = getYearOptionBySlug(sanitizeText(item.yearSlug, 120));

    if (!schoolSlug || !yearOption) continue;

    const key = `${schoolSlug}:${yearOption.slug}`;
    if (seen.has(key)) continue;
    seen.add(key);

    normalized.push({
      schoolSlug,
      yearSlug: yearOption.slug,
    });
  }

  return normalized;
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

  if (nodeType === "school") {
    return {};
  }

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
      preTestQuizId: sanitizeText(input.preTestQuizId, 180),
      postTestQuizId: sanitizeText(input.postTestQuizId, 180),
      preTestEnabled: parseBoolean(input.preTestEnabled),
      postTestEnabled: parseBoolean(input.postTestEnabled),
      assignmentTags: normalizeAssignmentTags(input.assignmentTags),
    };
  }

  return {
    week: sanitizeText(input.week, 40),
    lessonCode: sanitizeText(input.lessonCode, 40),
    assignmentTags: normalizeAssignmentTags(input.assignmentTags),
  };
}

function extractString(value: unknown) {
  return sanitizeText(value, 280);
}

function parseBoolean(value: unknown) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const cleaned = value.trim().toLowerCase();
    return cleaned === "true" || cleaned === "1" || cleaned === "yes" || cleaned === "on";
  }
  return false;
}

function extractBoolean(value: unknown) {
  return parseBoolean(value);
}

function extractAssignmentTags(metadata: Record<string, unknown>) {
  return normalizeAssignmentTags(metadata.assignmentTags);
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

async function findSiblingWithSameTitle(input: {
  parentId: string | null;
  nodeType: CurriculumNodeType;
  title: string;
  excludeNodeId?: string | null;
}) {
  const result = await sql<{ id: string }>`
    SELECT id
    FROM curriculum_nodes
    WHERE parent_id IS NOT DISTINCT FROM ${input.parentId}
      AND node_type = ${input.nodeType}
      AND LOWER(TRIM(title)) = LOWER(TRIM(${input.title}))
      AND id <> ${input.excludeNodeId ?? ""}
    LIMIT 1
  `;

  return result.rows[0]?.id ?? null;
}

function getNodeTypeLabel(nodeType: CurriculumNodeType) {
  return `${nodeType[0].toUpperCase()}${nodeType.slice(1)}`;
}

async function ensureCurriculumSchema() {
  if (curriculumSchemaReady) return curriculumSchemaReady;

  curriculumSchemaReady = (async () => {
    try {
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
    } catch (error) {
      curriculumSchemaReady = null;
      throw error;
    }
  })();

  return curriculumSchemaReady;
}

async function ensureDefaultSchool() {
  const schoolResult = await sql<{ id: string }>`
    SELECT id
    FROM curriculum_nodes
    WHERE parent_id IS NULL
      AND node_type = 'school'
      AND slug = ${DEFAULT_CURRICULUM_SCHOOL_SLUG}
    LIMIT 1
  `;

  const schoolId = schoolResult.rows[0]?.id ?? randomUUID();

  if (!schoolResult.rows[0]) {
    await sql`
      INSERT INTO curriculum_nodes (id, parent_id, node_type, title, slug, position, metadata)
      VALUES (
        ${schoolId},
        ${null},
        ${"school"},
        ${DEFAULT_CURRICULUM_SCHOOL_TITLE},
        ${DEFAULT_CURRICULUM_SCHOOL_SLUG},
        ${0},
        ${toJsonbString({})}::jsonb
      )
    `;
  } else {
    await sql`
      UPDATE curriculum_nodes
      SET
        title = ${DEFAULT_CURRICULUM_SCHOOL_TITLE},
        updated_at = NOW()
      WHERE id = ${schoolId}
        AND title <> ${DEFAULT_CURRICULUM_SCHOOL_TITLE}
    `;
  }

  await sql`
    UPDATE curriculum_nodes
    SET
      parent_id = ${schoolId},
      updated_at = NOW()
    WHERE parent_id IS NULL
      AND node_type = 'year'
  `;

  return schoolId;
}

async function findNodeBySlug(parentId: string | null, nodeType: CurriculumNodeType, slug: string) {
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
    WHERE parent_id IS NOT DISTINCT FROM ${parentId}
      AND node_type = ${nodeType}
      AND slug = ${slug}
    LIMIT 1
  `;

  const row = result.rows[0];
  return row ? mapRow(row) : null;
}

async function createNodeRecord(input: {
  parentId: string | null;
  nodeType: CurriculumNodeType;
  title: string;
  slug: string;
  position: number;
  metadata: Record<string, unknown>;
}) {
  const id = randomUUID();

  await sql`
    INSERT INTO curriculum_nodes (id, parent_id, node_type, title, slug, position, metadata)
    VALUES (
      ${id},
      ${input.parentId},
      ${input.nodeType},
      ${input.title},
      ${input.slug},
      ${input.position},
      ${toJsonbString(input.metadata)}::jsonb
    )
  `;

  return id;
}

function mergeUniqueAssignmentTags(
  left: CurriculumAssignmentTag[],
  right: CurriculumAssignmentTag[]
) {
  return normalizeAssignmentTags([...left, ...right]);
}

function hasAssignmentTag(
  tags: CurriculumAssignmentTag[],
  schoolSlug: string,
  yearSlug: string
) {
  return tags.some((tag) => tag.schoolSlug === schoolSlug && tag.yearSlug === yearSlug);
}

async function migrateLegacyCurriculumStructure() {
  const flatNodes = await listAllCurriculumNodesFlat();

  const schoolNodes = flatNodes.filter((node) => node.nodeType === "school" && node.parentId === null);
  const topLevelSubjects = flatNodes.filter((node) => node.nodeType === "subject" && node.parentId === null);
  if (topLevelSubjects.length > 0) {
    return;
  }

  const byParentId = new Map<string | null, CurriculumNode[]>();
  for (const node of flatNodes) {
    const siblings = byParentId.get(node.parentId) ?? [];
    siblings.push({ ...node, children: [] });
    byParentId.set(node.parentId, siblings);
  }

  const defaultSchool = schoolNodes.find((node) => node.slug === DEFAULT_CURRICULUM_SCHOOL_SLUG) ?? schoolNodes[0] ?? null;
  const schoolScope = defaultSchool
    ? { slug: defaultSchool.slug, title: defaultSchool.title }
    : { slug: DEFAULT_CURRICULUM_SCHOOL_SLUG, title: DEFAULT_CURRICULUM_SCHOOL_TITLE };

  const yearNodes = flatNodes.filter((node) => node.nodeType === "year");

  for (const yearNode of yearNodes) {
    const yearOption =
      getYearOptionBySlug(yearNode.slug) ??
      CURRICULUM_YEAR_OPTIONS.find((option) => option.level === extractYearLevel(yearNode.metadata));
    if (!yearOption) continue;

    const schoolNode =
      schoolNodes.find((node) => node.id === yearNode.parentId) ??
      schoolNodes.find((node) => node.slug === schoolScope.slug) ??
      null;
    const schoolSlug = schoolNode?.slug ?? schoolScope.slug;

    const legacySubjects = (byParentId.get(yearNode.id) ?? []).filter((node) => node.nodeType === "subject");

    for (const legacySubject of legacySubjects) {
      let subjectNode = await findNodeBySlug(null, "subject", legacySubject.slug);
      if (!subjectNode) {
        const subjectId = await createNodeRecord({
          parentId: null,
          nodeType: "subject",
          title: legacySubject.title,
          slug: legacySubject.slug,
          position: await getNextPosition(null),
          metadata: {
            description: extractString(legacySubject.metadata.description),
          },
        });
        const created = await findNodeBySlug(null, "subject", legacySubject.slug);
        subjectNode = created ?? {
          ...legacySubject,
          id: subjectId,
          parentId: null,
        };
      }

      const legacyChapters = (byParentId.get(legacySubject.id) ?? []).filter((node) => node.nodeType === "chapter");

      for (const legacyChapter of legacyChapters) {
        let chapterNode = await findNodeBySlug(subjectNode.id, "chapter", legacyChapter.slug);
        const nextChapterTags = mergeUniqueAssignmentTags(
          extractAssignmentTags(legacyChapter.metadata),
          [{ schoolSlug, yearSlug: yearOption.slug }]
        );

        if (!chapterNode) {
          await createNodeRecord({
            parentId: subjectNode.id,
            nodeType: "chapter",
            title: legacyChapter.title,
            slug: legacyChapter.slug,
            position: await getNextPosition(subjectNode.id),
            metadata: {
              weekRange: extractString(legacyChapter.metadata.weekRange),
              strand: extractString(legacyChapter.metadata.strand),
              unitTitle: extractString(legacyChapter.metadata.unitTitle),
              learningOutcomes: extractLearningOutcomes(legacyChapter.metadata),
              preTestQuizId: extractString(legacyChapter.metadata.preTestQuizId),
              postTestQuizId: extractString(legacyChapter.metadata.postTestQuizId),
              preTestEnabled: extractBoolean(legacyChapter.metadata.preTestEnabled),
              postTestEnabled: extractBoolean(legacyChapter.metadata.postTestEnabled),
              assignmentTags: nextChapterTags,
            },
          });
          chapterNode = await findNodeBySlug(subjectNode.id, "chapter", legacyChapter.slug);
        } else if (!hasAssignmentTag(extractAssignmentTags(chapterNode.metadata), schoolSlug, yearOption.slug)) {
          await sql`
            UPDATE curriculum_nodes
            SET
              metadata = ${toJsonbString({
                ...chapterNode.metadata,
                assignmentTags: nextChapterTags,
              })}::jsonb,
              updated_at = NOW()
            WHERE id = ${chapterNode.id}
          `;
          chapterNode = await findNodeBySlug(subjectNode.id, "chapter", legacyChapter.slug);
        }

        if (!chapterNode) continue;

        const legacyLessons = (byParentId.get(legacyChapter.id) ?? []).filter((node) => node.nodeType === "lesson");

        for (const legacyLesson of legacyLessons) {
          const existingLesson = await findNodeBySlug(chapterNode.id, "lesson", legacyLesson.slug);
          if (existingLesson) continue;

          await createNodeRecord({
            parentId: chapterNode.id,
            nodeType: "lesson",
            title: legacyLesson.title,
            slug: legacyLesson.slug,
            position: await getNextPosition(chapterNode.id),
            metadata: {
              week: extractString(legacyLesson.metadata.week),
              lessonCode: extractString(legacyLesson.metadata.lessonCode),
              assignmentTags: extractAssignmentTags(legacyLesson.metadata),
            },
          });
        }
      }
    }
  }
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

async function listAllCurriculumNodesFlat() {
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

  return result.rows.map((row) => mapRow(row));
}

async function seedDefaultCurriculumIfEmpty() {
  if (curriculumSeedReady) return curriculumSeedReady;

  curriculumSeedReady = (async () => {
    await ensureDefaultSchool();
    await migrateLegacyCurriculumStructure();

    const subjectResult = await sql<{ id: string }>`
      SELECT id
      FROM curriculum_nodes
      WHERE parent_id IS NULL
        AND node_type = 'subject'
      LIMIT 1
    `;
    if (subjectResult.rows[0]) return;

    const subjectId = await createNodeRecord({
      parentId: null,
      nodeType: "subject",
      title: "Science",
      slug: "science",
      position: await getNextPosition(null),
      metadata: {
        description: "Physics, chemistry, biology, and scientific inquiry.",
      },
    });

    for (const [chapterIndex, chapter] of year7ScienceChapters.entries()) {
      const chapterId = await createNodeRecord({
        parentId: subjectId,
        nodeType: "chapter",
        title: chapter.shortTitle,
        slug: chapter.slug,
        position: chapterIndex,
        metadata: {
          weekRange: chapter.weekRange,
          strand: chapter.strand,
          unitTitle: chapter.unitTitle,
          learningOutcomes: chapter.learningOutcomes,
          assignmentTags: [{ schoolSlug: DEFAULT_CURRICULUM_SCHOOL_SLUG, yearSlug: "year-7" }],
        },
      });

      for (const [lessonIndex, lesson] of chapter.lessons.entries()) {
        const lessonSlug = lesson.slug ?? slugify(`${lesson.lessonCode}-${lesson.title}`);

        await createNodeRecord({
          parentId: chapterId,
          nodeType: "lesson",
          title: lesson.title,
          slug: lessonSlug,
          position: lessonIndex,
          metadata: {
            week: lesson.week,
            lessonCode: lesson.lessonCode,
          },
        });
      }
    }
  })();

  return curriculumSeedReady;
}

export async function ensureCurriculumReady() {
  await ensureCurriculumSchema();
  await seedDefaultCurriculumIfEmpty();
}

export async function getCurriculumNodeLineage(nodeIdInput: string) {
  await ensureCurriculumReady();

  const nodeId = normalizeId(nodeIdInput);
  if (!nodeId) return [];

  const lineage: CurriculumNode[] = [];
  let currentId: string | null = nodeId;

  while (currentId) {
    const row = await getNodeById(currentId);
    if (!row) break;

    const mapped = mapRow(row);
    lineage.unshift({
      ...mapped,
      children: [],
    });

    currentId = mapped.parentId;
  }

  return lineage;
}

export async function listCurriculumTree() {
  await ensureCurriculumReady();
  const mapped = await listAllCurriculumNodesFlat();
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
      throw new Error(`${nodeType} nodes cannot have a parent.`);
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

  const duplicateSiblingId = await findSiblingWithSameTitle({
    parentId,
    nodeType,
    title,
  });

  if (duplicateSiblingId) {
    throw new Error(`${getNodeTypeLabel(nodeType)} already exists here.`);
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
  if (
    nodeType === "school" &&
    sanitizeText(existing.slug, 180) === DEFAULT_CURRICULUM_SCHOOL_SLUG &&
    title !== DEFAULT_CURRICULUM_SCHOOL_TITLE
  ) {
    throw new Error("Default EDUTINDO school title cannot be changed.");
  }

  const metadata = normalizeMetadata(nodeType, input.metadata);
  if (nodeType === "year" && metadata.yearLevel == null) {
    metadata.yearLevel = parseYearLevelFromTitle(title);
  }

  const duplicateSiblingId = await findSiblingWithSameTitle({
    parentId: existing.parent_id,
    nodeType,
    title,
    excludeNodeId: nodeId,
  });

  if (duplicateSiblingId) {
    throw new Error(`${getNodeTypeLabel(nodeType)} already exists here.`);
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

  const existingNode = await getNodeById(nodeId);
  if (!existingNode) {
    throw new Error("Curriculum node not found.");
  }

  if (
    normalizeNodeType(existingNode.node_type) === "school" &&
    sanitizeText(existingNode.slug, 180) === DEFAULT_CURRICULUM_SCHOOL_SLUG
  ) {
    throw new Error("Default EDUTINDO school cannot be deleted.");
  }

  const deleted = await sql<{ id: string }>`
    DELETE FROM curriculum_nodes
    WHERE id = ${nodeId}
    RETURNING id
  `;

  if (!deleted.rows[0]) {
    throw new Error("Curriculum node not found.");
  }
}

export async function reorderCurriculumSiblings(input: {
  parentId?: string | null;
  nodeType?: string | null;
  orderedNodeIds: string[];
  actorUserId?: string;
}) {
  await ensureCurriculumReady();

  const parentId = normalizeId(input.parentId);
  const nodeType = input.nodeType ? normalizeNodeType(input.nodeType) : null;
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
      AND (${nodeType}::text IS NULL OR node_type = ${nodeType})
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
        AND (${nodeType}::text IS NULL OR node_type = ${nodeType})
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

function mapSchool(node: CurriculumNode, years: CurriculumYearSummary[] = []): CurriculumSchoolSummary {
  return {
    id: node.id,
    title: node.title,
    slug: node.slug,
    position: node.position,
    years,
  };
}

function mapChapter(node: CurriculumNode, lessonNodes?: CurriculumNode[]): CurriculumChapterSummary {
  const lessons = lessonNodes ?? node.children.filter((child) => child.nodeType === "lesson");
  return {
    id: node.id,
    title: node.title,
    slug: node.slug,
    position: node.position,
    weekRange: extractString(node.metadata.weekRange),
    lessonCount: lessons.length,
    preTestQuizId: extractString(node.metadata.preTestQuizId),
    postTestQuizId: extractString(node.metadata.postTestQuizId),
    preTestEnabled: extractBoolean(node.metadata.preTestEnabled),
    postTestEnabled: extractBoolean(node.metadata.postTestEnabled),
  };
}

function mapSubject(
  node: CurriculumNode,
  chapters: Array<{ chapterNode: CurriculumNode; lessonNodes: CurriculumNode[] }> = []
): CurriculumSubjectSummary {
  const chapterSummaries = chapters.map(({ chapterNode, lessonNodes }) => mapChapter(chapterNode, lessonNodes));
  const lessonCount = chapters.reduce((sum, chapter) => sum + chapter.lessonNodes.length, 0);

  return {
    id: node.id,
    title: node.title,
    slug: node.slug,
    position: node.position,
    description: extractString(node.metadata.description),
    chapterCount: chapterSummaries.length,
    lessonCount,
    chapters: chapterSummaries,
  };
}

function mapYear(
  schoolNode: CurriculumNode,
  yearSlug: string,
  subjects: CurriculumSubjectSummary[]
): CurriculumYearSummary {
  const yearOption = getYearOptionBySlug(yearSlug);

  return {
    id: `${schoolNode.id}:${yearSlug}`,
    title: yearOption?.title ?? "Year",
    slug: yearOption?.slug ?? yearSlug,
    position: yearOption?.position ?? 0,
    yearLevel: yearOption?.level ?? null,
    subjects,
  };
}

function getTopLevelSchools(tree: CurriculumNode[]) {
  return tree.filter((node) => node.nodeType === "school" && node.parentId === null);
}

function getTopLevelSubjects(tree: CurriculumNode[]) {
  return tree.filter((node) => node.nodeType === "subject" && node.parentId === null);
}

function matchesAssignmentTag(
  tags: CurriculumAssignmentTag[],
  schoolSlug: string,
  yearSlug: string
) {
  return tags.some((tag) => tag.schoolSlug === schoolSlug && tag.yearSlug === yearSlug);
}

function getVisibleLessonsForScope(
  chapterNode: CurriculumNode,
  schoolSlug: string,
  yearSlug: string
) {
  const chapterTags = extractAssignmentTags(chapterNode.metadata);
  const lessonNodes = sortLessonNodes(chapterNode.children.filter((node) => node.nodeType === "lesson"));

  return lessonNodes.filter((lessonNode) => {
    const lessonTags = extractAssignmentTags(lessonNode.metadata);
    if (lessonTags.length > 0) {
      return matchesAssignmentTag(lessonTags, schoolSlug, yearSlug);
    }

    if (chapterTags.length > 0) {
      return matchesAssignmentTag(chapterTags, schoolSlug, yearSlug);
    }

    return false;
  });
}

function getVisibleChaptersForScope(
  subjectNode: CurriculumNode,
  schoolSlug: string,
  yearSlug: string
) {
  return sortChapterNodes(subjectNode.children.filter((node) => node.nodeType === "chapter"))
    .map((chapterNode) => ({
      chapterNode,
      lessonNodes: getVisibleLessonsForScope(chapterNode, schoolSlug, yearSlug),
    }))
    .filter((item) => item.lessonNodes.length > 0);
}

function mapSubjectForScope(
  subjectNode: CurriculumNode,
  schoolSlug: string,
  yearSlug: string
) {
  const visibleChapters = getVisibleChaptersForScope(subjectNode, schoolSlug, yearSlug);
  if (visibleChapters.length === 0) return null;
  return mapSubject(subjectNode, visibleChapters);
}

export async function listCurriculumOutline() {
  const schools = await listCurriculumSchools();
  const defaultSchool =
    schools.find((school) => school.slug === DEFAULT_CURRICULUM_SCHOOL_SLUG) ?? schools[0] ?? null;
  return defaultSchool?.years ?? [];
}

export async function listCurriculumSchools() {
  const tree = await listCurriculumTree();
  const schoolNodes = getTopLevelSchools(tree);
  const subjectNodes = getTopLevelSubjects(tree);

  return schoolNodes.map((schoolNode) => {
    const years = CURRICULUM_YEAR_OPTIONS.map((yearOption) => {
      const subjects = subjectNodes
        .map((subjectNode) => mapSubjectForScope(subjectNode, schoolNode.slug, yearOption.slug))
        .filter((subject): subject is CurriculumSubjectSummary => Boolean(subject));

      return mapYear(schoolNode, yearOption.slug, subjects);
    }).filter((year) => year.subjects.length > 0);

    return mapSchool(schoolNode, years);
  });
}

function findSchoolNodeForLookup(
  tree: CurriculumNode[],
  input: {
    schoolSlug?: string;
    yearSlug: string;
    subjectSlug?: string;
    chapterSlug?: string;
    lessonSlug?: string;
  }
) {
  const schools = getTopLevelSchools(tree);
  if (schools.length === 0) return null;

  if (input.schoolSlug) {
    return schools.find((node) => node.slug === input.schoolSlug) ?? null;
  }

  return schools.find((node) => node.slug === DEFAULT_CURRICULUM_SCHOOL_SLUG) ?? schools[0];
}

export async function getCurriculumChapterContext(input: {
  schoolSlug?: string;
  yearSlug: string;
  subjectSlug: string;
  chapterSlug: string;
}): Promise<CurriculumChapterContext | null> {
  const schoolSlug = input.schoolSlug ? slugify(input.schoolSlug) : undefined;
  const yearSlug = slugify(input.yearSlug);
  const subjectSlug = slugify(input.subjectSlug);
  const chapterSlug = slugify(input.chapterSlug);
  const yearOption = getYearOptionBySlug(yearSlug);
  if (!yearOption) return null;

  const tree = await listCurriculumTree();

  const schoolNode = findSchoolNodeForLookup(tree, {
    schoolSlug,
    yearSlug,
    subjectSlug,
    chapterSlug,
  });
  if (!schoolNode) return null;

  const subjectNode = getTopLevelSubjects(tree).find((node) => node.slug === subjectSlug);
  if (!subjectNode) return null;

  const scopedChapters = getVisibleChaptersForScope(subjectNode, schoolNode.slug, yearOption.slug);
  const chapterIndex = scopedChapters.findIndex((item) => item.chapterNode.slug === chapterSlug);
  if (chapterIndex < 0) return null;

  const { chapterNode, lessonNodes } = scopedChapters[chapterIndex];
  const previousChapter =
    chapterIndex > 0
      ? mapChapter(scopedChapters[chapterIndex - 1].chapterNode, scopedChapters[chapterIndex - 1].lessonNodes)
      : null;
  const nextChapter =
    chapterIndex < scopedChapters.length - 1
      ? mapChapter(scopedChapters[chapterIndex + 1].chapterNode, scopedChapters[chapterIndex + 1].lessonNodes)
      : null;

  const chapter = {
    ...mapChapter(chapterNode, lessonNodes),
    lessons: lessonNodes.map(mapLesson),
    strand: extractString(chapterNode.metadata.strand),
    unitTitle: extractString(chapterNode.metadata.unitTitle),
    learningOutcomes: extractLearningOutcomes(chapterNode.metadata),
  };

  const scopedSubject = mapSubjectForScope(subjectNode, schoolNode.slug, yearOption.slug);
  if (!scopedSubject) return null;

  const schoolSummary = mapSchool(
    schoolNode,
    CURRICULUM_YEAR_OPTIONS.map((option) => {
      const subjects = getTopLevelSubjects(tree)
        .map((node) => mapSubjectForScope(node, schoolNode.slug, option.slug))
        .filter((subject): subject is CurriculumSubjectSummary => Boolean(subject));

      return mapYear(schoolNode, option.slug, subjects);
    }).filter((year) => year.subjects.length > 0)
  );

  return {
    school: schoolSummary,
    year: mapYear(schoolNode, yearOption.slug, schoolSummary.years.find((year) => year.slug === yearOption.slug)?.subjects ?? []),
    subject: scopedSubject,
    chapter,
    previousChapter,
    nextChapter,
  };
}

export async function getCurriculumLessonContext(input: {
  schoolSlug?: string;
  yearSlug: string;
  subjectSlug: string;
  chapterSlug: string;
  lessonSlug: string;
}): Promise<CurriculumLessonContext | null> {
  const schoolSlug = input.schoolSlug ? slugify(input.schoolSlug) : undefined;
  const yearSlug = slugify(input.yearSlug);
  const subjectSlug = slugify(input.subjectSlug);
  const chapterSlug = slugify(input.chapterSlug);
  const lessonSlug = slugify(input.lessonSlug);

  const chapterContext = await getCurriculumChapterContext({
    schoolSlug,
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
    school: chapterContext.school,
    year: chapterContext.year,
    subject: chapterContext.subject,
    chapter: {
      id: chapterContext.chapter.id,
      title: chapterContext.chapter.title,
      slug: chapterContext.chapter.slug,
      position: chapterContext.chapter.position,
      weekRange: chapterContext.chapter.weekRange,
      lessonCount: chapterContext.chapter.lessonCount,
      preTestQuizId: chapterContext.chapter.preTestQuizId,
      postTestQuizId: chapterContext.chapter.postTestQuizId,
      preTestEnabled: chapterContext.chapter.preTestEnabled,
      postTestEnabled: chapterContext.chapter.postTestEnabled,
    },
    lesson,
    previousLesson,
    nextLesson,
  };
}
