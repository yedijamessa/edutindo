import "@/lib/server-only";

import { randomUUID } from "crypto";
import {
  ensureCurriculumReady,
  getCurriculumLessonContext,
  getCurriculumNodeLineage,
  listCurriculumSchools,
  listCurriculumTree,
  updateCurriculumNode,
  type CurriculumNode,
  type CurriculumAssignmentTag,
} from "@/lib/curriculum-portal";
import { ensureAuthSchema, type AuthUser } from "@/lib/auth";
import { sqlQuery as sql } from "@/lib/postgres-query";
import type {
  ModuleEditorBlock,
  ModuleEditorBreadcrumb,
  ModuleCatalogModuleSummary,
  ModuleCatalogSchoolGroup,
  ModuleCatalogSubjectGroup,
  ModuleEditorDocument,
  ModuleLessonAssignment,
  ModuleEditorNodeType,
  ModuleEditorPage,
  ModuleEditorQuizMatchPair,
  ModuleEditorQuizOption,
  ModuleEditorQuizOrderingItem,
  ModuleEditorQuizType,
  ModuleEditorTarget,
  ModuleEditorTextBlock,
} from "@/types/module-editor";

type ModuleEditorModuleRow = {
  id: string;
  title: string;
  module_code: string | null;
  unique_identifier: string | null;
  pages: unknown;
  catalog_subject_slug: string | null;
  catalog_subject_title: string | null;
  catalog_chapter_slug: string | null;
  catalog_chapter_title: string | null;
  created_at: Date;
  updated_at: Date;
};

type ModuleEditorAssignmentRow = {
  lesson_id: string;
  module_id: string;
  assigned_at: Date;
};

type StudentLessonAssignmentRow = {
  lesson_id: string;
  module_id: string;
  school_slug: string;
  assigned_at: Date;
};

export type StudentAssignedModuleLesson = {
  id: string;
  moduleId: string;
  moduleTitle: string;
  lessonId: string;
  lessonTitle: string;
  subject: string;
  subjectSlug: string;
  chapterTitle: string;
  description: string;
  href: string;
  createdAt: string;
};

let moduleEditorSchemaReady: Promise<void> | null = null;

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeAssignmentTags(value: unknown): CurriculumAssignmentTag[] {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();
  const tags: CurriculumAssignmentTag[] = [];

  for (const item of value) {
    if (!isObjectRecord(item)) continue;

    const schoolSlug = sanitizeText(item.schoolSlug, 120).toLowerCase();
    const yearSlug = sanitizeText(item.yearSlug, 120).toLowerCase();
    if (!schoolSlug || !yearSlug) continue;

    const key = `${schoolSlug}:${yearSlug}`;
    if (seen.has(key)) continue;

    seen.add(key);
    tags.push({ schoolSlug, yearSlug });
  }

  return tags;
}

function sanitizeText(value: unknown, maxLength: number) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function sanitizeLongText(value: unknown, maxLength: number) {
  return String(value ?? "").slice(0, maxLength);
}

function slugifyCatalogValue(value: unknown) {
  return sanitizeText(value, 180)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);
}

function sanitizeUrl(value: unknown) {
  const cleaned = String(value ?? "").trim();
  if (!cleaned) return "";

  if (/^data:image\/(?:png|jpe?g|gif|webp|svg\+xml);base64,[a-z0-9+/=]+$/i.test(cleaned)) {
    return cleaned;
  }

  try {
    const parsed = new URL(cleaned);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return "";
    }
    return parsed.toString();
  } catch {
    return "";
  }
}

function isModuleEditorNodeType(value: string): value is ModuleEditorNodeType {
  return value === "chapter" || value === "lesson";
}

function mapBreadcrumb(node: CurriculumNode): ModuleEditorBreadcrumb {
  return {
    id: node.id,
    title: node.title,
    slug: node.slug,
    nodeType: node.nodeType,
  };
}

function createTextBlock(title = "", body = ""): ModuleEditorTextBlock {
  return {
    id: randomUUID(),
    type: "text",
    title,
    body,
  };
}

function createQuizOptions(): ModuleEditorQuizOption[] {
  return [
    { id: randomUUID(), text: "Option 1" },
    { id: randomUUID(), text: "Option 2" },
    { id: randomUUID(), text: "Option 3" },
    { id: randomUUID(), text: "Option 4" },
  ];
}

function createDefaultMatchingPairs(): ModuleEditorQuizMatchPair[] {
  return [
    { id: randomUUID(), prompt: "Prompt 1", match: "Match 1" },
    { id: randomUUID(), prompt: "Prompt 2", match: "Match 2" },
    { id: randomUUID(), prompt: "Prompt 3", match: "Match 3" },
  ];
}

function createDefaultOrderingItems(): ModuleEditorQuizOrderingItem[] {
  return [
    { id: randomUUID(), text: "Step 1" },
    { id: randomUUID(), text: "Step 2" },
    { id: randomUUID(), text: "Step 3" },
    { id: randomUUID(), text: "Step 4" },
  ];
}

function getDefaultOptionsForQuizType(quizType: ModuleEditorQuizType): ModuleEditorQuizOption[] {
  if (quizType === "true-false") {
    return [
      { id: randomUUID(), text: "True" },
      { id: randomUUID(), text: "False" },
    ];
  }

  if (
    quizType === "short-answer" ||
    quizType === "fill-in-the-blank" ||
    quizType === "matching" ||
    quizType === "ordering" ||
    quizType === "essay"
  ) {
    return [];
  }

  return createQuizOptions();
}

function normalizeQuizType(value: unknown): ModuleEditorQuizType {
  const cleaned = sanitizeText(value, 40);

  if (
    cleaned === "multiple-choice-single" ||
    cleaned === "multiple-choice-multiple" ||
    cleaned === "true-false" ||
    cleaned === "short-answer" ||
    cleaned === "fill-in-the-blank" ||
    cleaned === "matching" ||
    cleaned === "ordering" ||
    cleaned === "essay"
  ) {
    return cleaned;
  }

  return "multiple-choice-single";
}

function createDefaultPage(title: string): ModuleEditorPage {
  return {
    id: randomUUID(),
    title,
    description: "",
    blocks: [createTextBlock(title, "Start building this page here.")],
  };
}

function normalizeQuizOptions(input: unknown): ModuleEditorQuizOption[] {
  const rawOptions = Array.isArray(input) ? input : [];
  const options = rawOptions
    .map((option) => {
      if (!isObjectRecord(option)) return null;
      return {
        id: sanitizeText(option.id, 80) || randomUUID(),
        text: sanitizeText(option.text, 240),
      };
    })
    .filter((option): option is ModuleEditorQuizOption => option !== null)
    .slice(0, 8);

  if (options.length >= 2) {
    return options;
  }

  const fallback = createQuizOptions();
  return fallback.slice(0, 2);
}

function normalizeAcceptableAnswers(input: unknown) {
  if (!Array.isArray(input)) return [];

  return Array.from(
    new Set(
      input
        .map((answer) => sanitizeText(answer, 240))
        .filter((answer) => answer.length > 0)
    )
  ).slice(0, 12);
}

function normalizeMatchingPairs(input: unknown) {
  const rawPairs = Array.isArray(input) ? input : [];
  const pairs = rawPairs
    .map((pair) => {
      if (!isObjectRecord(pair)) return null;

      return {
        id: sanitizeText(pair.id, 80) || randomUUID(),
        prompt: sanitizeText(pair.prompt, 240),
        match: sanitizeText(pair.match, 240),
      };
    })
    .filter((pair): pair is ModuleEditorQuizMatchPair => pair !== null)
    .slice(0, 12);

  if (pairs.length >= 2) {
    return pairs;
  }

  return createDefaultMatchingPairs();
}

function normalizeOrderingItems(input: unknown) {
  const rawItems = Array.isArray(input) ? input : [];
  const items = rawItems
    .map((item) => {
      if (!isObjectRecord(item)) return null;

      return {
        id: sanitizeText(item.id, 80) || randomUUID(),
        text: sanitizeText(item.text, 240),
      };
    })
    .filter((item): item is ModuleEditorQuizOrderingItem => item !== null)
    .slice(0, 12);

  if (items.length >= 2) {
    return items;
  }

  return createDefaultOrderingItems();
}

function normalizeBlock(input: unknown): ModuleEditorBlock | null {
  if (!isObjectRecord(input)) return null;

  const id = sanitizeText(input.id, 80) || randomUUID();
  const type = sanitizeText(input.type, 20);

  if (type === "text") {
    return {
      id,
      type: "text",
      title: sanitizeText(input.title, 180),
      body: sanitizeLongText(input.body, 12000),
    };
  }

  if (type === "image") {
    return {
      id,
      type: "image",
      imageUrl: sanitizeUrl(input.imageUrl),
      altText: sanitizeText(input.altText, 240),
      caption: sanitizeLongText(input.caption, 1000),
    };
  }

  if (type === "quiz") {
    const quizType = normalizeQuizType(input.quizType);
    const usesOptions =
      quizType === "multiple-choice-single" ||
      quizType === "multiple-choice-multiple" ||
      quizType === "true-false";
    const usesAcceptableAnswers = quizType === "short-answer" || quizType === "fill-in-the-blank";
    const usesMatchingPairs = quizType === "matching";
    const usesOrderingItems = quizType === "ordering";
    const options =
      quizType === "true-false"
        ? getDefaultOptionsForQuizType("true-false")
        : usesOptions
          ? normalizeQuizOptions(input.options)
          : [];
    const legacyCorrectOptionId = sanitizeText(input.correctOptionId, 80);
    const requestedCorrectOptionIds = Array.isArray(input.correctOptionIds)
      ? input.correctOptionIds.map((value) => sanitizeText(value, 80)).filter((value) => value.length > 0)
      : legacyCorrectOptionId
        ? [legacyCorrectOptionId]
        : [];
    const matchingCorrectOptionIds = usesOptions
      ? options
          .filter((option) => requestedCorrectOptionIds.includes(option.id))
          .map((option) => option.id)
      : [];
    const acceptableAnswers = usesAcceptableAnswers ? normalizeAcceptableAnswers(input.acceptableAnswers) : [];
    const matchingPairs = usesMatchingPairs ? normalizeMatchingPairs(input.matchingPairs) : [];
    const orderingItems = usesOrderingItems ? normalizeOrderingItems(input.orderingItems) : [];

    const nextCorrectOptionIds =
      quizType === "multiple-choice-multiple"
        ? matchingCorrectOptionIds.length > 0
          ? matchingCorrectOptionIds
          : options[0]?.id
            ? [options[0].id]
            : []
        : usesOptions
          ? matchingCorrectOptionIds[0]
            ? [matchingCorrectOptionIds[0]]
            : options[0]?.id
              ? [options[0].id]
              : []
          : [];

    return {
      id,
      type: "quiz",
      quizType,
      prompt: sanitizeLongText(input.prompt, 3000),
      options,
      correctOptionIds: nextCorrectOptionIds,
      acceptableAnswers,
      matchingPairs,
      orderingItems,
      explanation: sanitizeLongText(input.explanation, 3000),
    };
  }

  return null;
}

function normalizePages(input: unknown, fallbackTitle: string): ModuleEditorPage[] {
  const rawPages = Array.isArray(input) ? input : [];
  const pages = rawPages
    .map((page, index) => {
      if (!isObjectRecord(page)) return null;
      const blocks = Array.isArray(page.blocks)
        ? page.blocks.map(normalizeBlock).filter((block): block is ModuleEditorBlock => block !== null).slice(0, 24)
        : [];

      return {
        id: sanitizeText(page.id, 80) || randomUUID(),
        title: sanitizeText(page.title, 180) || `${fallbackTitle} Page ${index + 1}`,
        description: sanitizeLongText(page.description, 1000),
        blocks: blocks.length > 0 ? blocks : [createTextBlock()],
      };
    })
    .filter((page): page is ModuleEditorPage => page !== null)
    .slice(0, 50);

  if (pages.length > 0) {
    return pages;
  }

  return [createDefaultPage(`${fallbackTitle} Page 1`)];
}

async function ensureModuleEditorSchema() {
  if (moduleEditorSchemaReady) return moduleEditorSchemaReady;

  moduleEditorSchemaReady = (async () => {
    try {
      await ensureCurriculumReady();

      await sql`
        CREATE TABLE IF NOT EXISTS module_editor_documents (
          curriculum_node_id TEXT PRIMARY KEY REFERENCES curriculum_nodes(id) ON DELETE CASCADE,
          node_type TEXT NOT NULL,
          title TEXT NOT NULL DEFAULT '',
          pages JSONB NOT NULL DEFAULT '[]'::jsonb,
          updated_by_user_id TEXT,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS module_editor_modules (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL DEFAULT '',
          module_code TEXT,
          unique_identifier TEXT,
          pages JSONB NOT NULL DEFAULT '[]'::jsonb,
          catalog_subject_slug TEXT,
          catalog_subject_title TEXT,
          catalog_chapter_slug TEXT,
          catalog_chapter_title TEXT,
          updated_by_user_id TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;

      await sql`
        ALTER TABLE module_editor_modules
        ADD COLUMN IF NOT EXISTS module_code TEXT
      `;

      await sql`
        ALTER TABLE module_editor_modules
        ADD COLUMN IF NOT EXISTS unique_identifier TEXT
      `;

      await sql`
        ALTER TABLE module_editor_modules
        ADD COLUMN IF NOT EXISTS catalog_subject_slug TEXT
      `;

      await sql`
        ALTER TABLE module_editor_modules
        ADD COLUMN IF NOT EXISTS catalog_subject_title TEXT
      `;

      await sql`
        ALTER TABLE module_editor_modules
        ADD COLUMN IF NOT EXISTS catalog_chapter_slug TEXT
      `;

      await sql`
        ALTER TABLE module_editor_modules
        ADD COLUMN IF NOT EXISTS catalog_chapter_title TEXT
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS module_editor_lesson_assignments (
          lesson_id TEXT PRIMARY KEY REFERENCES curriculum_nodes(id) ON DELETE CASCADE,
          module_id TEXT NOT NULL REFERENCES module_editor_modules(id) ON DELETE CASCADE,
          assigned_by_user_id TEXT,
          assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS module_editor_modules_updated_at_idx
        ON module_editor_modules (updated_at DESC)
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS module_editor_lesson_assignments_module_id_idx
        ON module_editor_lesson_assignments (module_id, assigned_at DESC)
      `;

      await sql`
        INSERT INTO module_editor_modules (
          id,
          title,
          module_code,
          unique_identifier,
          pages,
          updated_by_user_id,
          created_at,
          updated_at
        )
        SELECT
          curriculum_node_id,
          title,
          NULL,
          NULL,
          pages,
          updated_by_user_id,
          COALESCE(updated_at, NOW()),
          COALESCE(updated_at, NOW())
        FROM module_editor_documents
        ON CONFLICT (id) DO NOTHING
      `;

      await sql`
        INSERT INTO module_editor_lesson_assignments (
          lesson_id,
          module_id,
          assigned_by_user_id,
          assigned_at
        )
        SELECT
          curriculum_node_id,
          curriculum_node_id,
          updated_by_user_id,
          COALESCE(updated_at, NOW())
        FROM module_editor_documents
        WHERE node_type = 'lesson'
        ON CONFLICT (lesson_id) DO NOTHING
      `;

      await sql`
        WITH first_assignment AS (
          SELECT DISTINCT ON (assignment.module_id)
            assignment.module_id,
            subject.slug AS subject_slug,
            subject.title AS subject_title,
            chapter.slug AS chapter_slug,
            chapter.title AS chapter_title
          FROM module_editor_lesson_assignments assignment
          INNER JOIN curriculum_nodes lesson
            ON lesson.id = assignment.lesson_id
          INNER JOIN curriculum_nodes chapter
            ON chapter.id = lesson.parent_id
          INNER JOIN curriculum_nodes subject
            ON subject.id = chapter.parent_id
          ORDER BY assignment.module_id, assignment.assigned_at ASC
        )
        UPDATE module_editor_modules AS modules
        SET
          catalog_subject_slug = COALESCE(NULLIF(modules.catalog_subject_slug, ''), first_assignment.subject_slug),
          catalog_subject_title = COALESCE(NULLIF(modules.catalog_subject_title, ''), first_assignment.subject_title),
          catalog_chapter_slug = COALESCE(NULLIF(modules.catalog_chapter_slug, ''), first_assignment.chapter_slug),
          catalog_chapter_title = COALESCE(NULLIF(modules.catalog_chapter_title, ''), first_assignment.chapter_title)
        FROM first_assignment
        WHERE modules.id = first_assignment.module_id
      `;
    } catch (error) {
      moduleEditorSchemaReady = null;
      throw error;
    }
  })();

  return moduleEditorSchemaReady;
}

function getModuleTitle(value: unknown) {
  return sanitizeText(value, 180) || "Untitled Module";
}

function getCatalogSubjectTitle(value: unknown) {
  return sanitizeText(value, 180);
}

function getCatalogChapterTitle(value: unknown) {
  return sanitizeText(value, 180);
}

function mapModuleDocument(row: ModuleEditorModuleRow): ModuleEditorDocument {
  const title = getModuleTitle(row.title);
  const subjectTitle = getCatalogSubjectTitle(row.catalog_subject_title);
  const chapterTitle = getCatalogChapterTitle(row.catalog_chapter_title);
  const subjectSlug = slugifyCatalogValue(row.catalog_subject_slug || subjectTitle);
  const chapterSlug = slugifyCatalogValue(row.catalog_chapter_slug || chapterTitle);

  return {
    id: row.id,
    title,
    moduleCode: sanitizeText(row.module_code, 80),
    uniqueIdentifier: sanitizeText(row.unique_identifier, 120),
    pages: normalizePages(row.pages, title),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
    subjectSlug,
    subjectTitle,
    chapterSlug,
    chapterTitle,
  };
}

function mapTargetFromLineage(lineage: CurriculumNode[]): ModuleEditorTarget | null {
  const node = lineage.at(-1);

  if (!node || !isModuleEditorNodeType(node.nodeType)) {
    return null;
  }

  return {
    id: node.id,
    title: node.title,
    slug: node.slug,
    nodeType: node.nodeType,
    parentId: node.parentId,
    metadata: node.metadata,
    breadcrumbs: lineage.map(mapBreadcrumb),
  };
}

export async function listModuleEditorTargets() {
  await ensureModuleEditorSchema();
  const tree = await listCurriculumTree();
  const targets: ModuleEditorTarget[] = [];

  const visit = (node: CurriculumNode, lineage: CurriculumNode[]) => {
    const nextLineage = [...lineage, node];

    if (isModuleEditorNodeType(node.nodeType)) {
      targets.push({
        id: node.id,
        title: node.title,
        slug: node.slug,
        nodeType: node.nodeType,
        parentId: node.parentId,
        metadata: node.metadata,
        breadcrumbs: nextLineage.map(mapBreadcrumb),
      });
    }

    node.children.forEach((child) => visit(child, nextLineage));
  };

  tree.forEach((node) => visit(node, []));

  return targets.sort((left, right) =>
    left.breadcrumbs.map((item) => item.title).join(" / ").localeCompare(
      right.breadcrumbs.map((item) => item.title).join(" / ")
    )
  );
}

export async function getModuleEditorTarget(nodeId: string) {
  await ensureModuleEditorSchema();
  const lineage = await getCurriculumNodeLineage(nodeId);
  return mapTargetFromLineage(lineage);
}

export async function getAssignedModuleIdForLesson(lessonId: string): Promise<string | null> {
  await ensureModuleEditorSchema();
  const cleanedLessonId = sanitizeText(lessonId, 180);
  if (!cleanedLessonId) return null;

  const result = await sql<{ module_id: string }>`
    SELECT module_id
    FROM module_editor_lesson_assignments
    WHERE lesson_id = ${cleanedLessonId}
    LIMIT 1
  `;

  return result.rows[0]?.module_id ?? null;
}

export async function getModuleEditorDocument(moduleId: string): Promise<ModuleEditorDocument | null> {
  await ensureModuleEditorSchema();
  const cleanedModuleId = sanitizeText(moduleId, 180);
  if (!cleanedModuleId) return null;

  const result = await sql<ModuleEditorModuleRow>`
    SELECT
      id,
      title,
      module_code,
      unique_identifier,
      pages,
      catalog_subject_slug,
      catalog_subject_title,
      catalog_chapter_slug,
      catalog_chapter_title,
      created_at,
      updated_at
    FROM module_editor_modules
    WHERE id = ${cleanedModuleId}
    LIMIT 1
  `;

  const row = result.rows[0];
  return row ? mapModuleDocument(row) : null;
}

export async function getAssignedModuleDocumentForLesson(lessonId: string): Promise<ModuleEditorDocument | null> {
  const moduleId = await getAssignedModuleIdForLesson(lessonId);
  if (!moduleId) return null;

  return getModuleEditorDocument(moduleId);
}

export async function saveModuleEditorDocument(input: {
  moduleId?: string | null;
  title: unknown;
  moduleCode?: unknown;
  uniqueIdentifier?: unknown;
  pages: unknown;
  subjectSlug?: unknown;
  subjectTitle?: unknown;
  chapterSlug?: unknown;
  chapterTitle?: unknown;
  actorUserId?: string;
}) {
  await ensureModuleEditorSchema();
  const moduleId = sanitizeText(input.moduleId, 180) || randomUUID();
  const title = getModuleTitle(input.title);
  const moduleCode = sanitizeText(input.moduleCode, 80);
  const uniqueIdentifier = sanitizeText(input.uniqueIdentifier, 120);
  const pages = normalizePages(input.pages, title);
  const subjectTitle = getCatalogSubjectTitle(input.subjectTitle);
  const chapterTitle = getCatalogChapterTitle(input.chapterTitle);
  const subjectSlug = slugifyCatalogValue(input.subjectSlug || subjectTitle);
  const chapterSlug = slugifyCatalogValue(input.chapterSlug || chapterTitle);
  const actorUserId = sanitizeText(input.actorUserId, 180) || null;

  const result = await sql<ModuleEditorModuleRow>`
    INSERT INTO module_editor_modules (
      id,
      title,
      module_code,
      unique_identifier,
      pages,
      catalog_subject_slug,
      catalog_subject_title,
      catalog_chapter_slug,
      catalog_chapter_title,
      updated_by_user_id,
      created_at,
      updated_at
    )
    VALUES (
      ${moduleId},
      ${title},
      ${moduleCode || null},
      ${uniqueIdentifier || null},
      ${JSON.stringify(pages)},
      ${subjectSlug || null},
      ${subjectTitle || null},
      ${chapterSlug || null},
      ${chapterTitle || null},
      ${actorUserId},
      NOW(),
      NOW()
    )
    ON CONFLICT (id)
    DO UPDATE SET
      title = EXCLUDED.title,
      module_code = EXCLUDED.module_code,
      unique_identifier = EXCLUDED.unique_identifier,
      pages = EXCLUDED.pages,
      catalog_subject_slug = EXCLUDED.catalog_subject_slug,
      catalog_subject_title = EXCLUDED.catalog_subject_title,
      catalog_chapter_slug = EXCLUDED.catalog_chapter_slug,
      catalog_chapter_title = EXCLUDED.catalog_chapter_title,
      updated_by_user_id = EXCLUDED.updated_by_user_id,
      updated_at = NOW()
    RETURNING
      id,
      title,
      module_code,
      unique_identifier,
      pages,
      catalog_subject_slug,
      catalog_subject_title,
      catalog_chapter_slug,
      catalog_chapter_title,
      created_at,
      updated_at
  `;

  return mapModuleDocument(result.rows[0]);
}

export type ModuleListEntry = {
  moduleId: string;
  moduleTitle: string;
  moduleCode: string;
  uniqueIdentifier: string;
  pageCount: number;
  updatedAt: string;
  subjectSlug: string;
  subjectTitle: string;
  chapterSlug: string;
  chapterTitle: string;
  assignments: ModuleLessonAssignment[];
};

function mapLessonAssignment(target: ModuleEditorTarget): ModuleLessonAssignment {
  const school = target.breadcrumbs.find((item) => item.nodeType === "school");
  const year = target.breadcrumbs.find((item) => item.nodeType === "year");
  const subject = target.breadcrumbs.find((item) => item.nodeType === "subject");
  const chapter = target.breadcrumbs.find((item) => item.nodeType === "chapter");

  return {
    lessonId: target.id,
    lessonTitle: target.title,
    lessonSlug: target.slug,
    lessonCode: sanitizeText(target.metadata.lessonCode, 40),
    week: sanitizeText(target.metadata.week, 40),
    breadcrumbs: target.breadcrumbs,
    subjectTitle: subject?.title ?? "",
    chapterTitle: chapter?.title ?? "",
    schoolSlug: school?.slug ?? "",
    yearSlug: year?.slug ?? "",
    subjectSlug: subject?.slug ?? "",
    chapterSlug: chapter?.slug ?? "",
  };
}

export async function listModuleDocuments(): Promise<ModuleListEntry[]> {
  await ensureModuleEditorSchema();
  const targets = await listModuleEditorTargets();
  const [moduleResult, assignmentResult] = await Promise.all([
    sql<ModuleEditorModuleRow>`
      SELECT
        id,
        title,
        module_code,
        unique_identifier,
        pages,
        catalog_subject_slug,
        catalog_subject_title,
        catalog_chapter_slug,
        catalog_chapter_title,
        created_at,
        updated_at
      FROM module_editor_modules
      ORDER BY updated_at DESC
    `,
    sql<ModuleEditorAssignmentRow>`
      SELECT lesson_id, module_id, assigned_at
      FROM module_editor_lesson_assignments
      ORDER BY assigned_at DESC
    `,
  ]);

  const lessonMap = new Map<string, ModuleLessonAssignment>();
  for (const target of targets) {
    if (target.nodeType !== "lesson") continue;
    lessonMap.set(target.id, mapLessonAssignment(target));
  }

  const assignmentsByModuleId = new Map<string, ModuleLessonAssignment[]>();
  for (const row of assignmentResult.rows) {
    const lesson = lessonMap.get(row.lesson_id);
    if (!lesson) continue;

    const nextAssignments = assignmentsByModuleId.get(row.module_id) ?? [];
    nextAssignments.push(lesson);
    assignmentsByModuleId.set(row.module_id, nextAssignments);
  }

  return moduleResult.rows.map((row) => {
    const document = mapModuleDocument(row);
    const assignments = assignmentsByModuleId.get(row.id) ?? [];
    const fallbackAssignment = assignments[0] ?? null;

    return {
      moduleId: row.id,
      moduleTitle: document.title,
      moduleCode: document.moduleCode,
      uniqueIdentifier: document.uniqueIdentifier,
      pageCount: document.pages.length,
      updatedAt: document.updatedAt ?? new Date(row.updated_at).toISOString(),
      subjectSlug: document.subjectSlug || fallbackAssignment?.subjectSlug || "",
      subjectTitle: document.subjectTitle || fallbackAssignment?.subjectTitle || "",
      chapterSlug: document.chapterSlug || fallbackAssignment?.chapterSlug || "",
      chapterTitle: document.chapterTitle || fallbackAssignment?.chapterTitle || "",
      assignments,
    };
  });
}

export async function listStudentAssignedModuleLessons(
  user: Pick<AuthUser, "id" | "email"> | null | undefined
): Promise<StudentAssignedModuleLesson[]> {
  if (!user) return [];

  await Promise.all([ensureAuthSchema(), ensureModuleEditorSchema()]);

  const email = user.email.trim().toLowerCase();
  const assignmentResult = await sql<StudentLessonAssignmentRow>`
    SELECT lesson_id, module_id, school_slug, assigned_at
    FROM auth_student_lesson_assignments
    WHERE user_id = ${user.id} OR email = ${email}
    ORDER BY assigned_at DESC
  `;

  if (assignmentResult.rows.length === 0) {
    return [];
  }

  const modules = await listModuleDocuments();
  const lessonsByKey = new Map<string, StudentAssignedModuleLesson>();

  for (const row of assignmentResult.rows) {
    const module = modules.find((item) => item.moduleId === row.module_id);
    if (!module) continue;

    const lesson = module.assignments.find((item) => item.lessonId === row.lesson_id);
    if (!lesson) continue;

    const key = `${row.module_id}:${row.lesson_id}`;
    if (lessonsByKey.has(key)) continue;

    const subject = lesson.subjectTitle || module.subjectTitle || "General";
    const chapter = lesson.chapterTitle || module.chapterTitle;
    const schoolSlug = row.school_slug || lesson.schoolSlug;
    const lessonHref = `/student/materials/curriculum/${schoolSlug}/${lesson.yearSlug}/${lesson.subjectSlug}/${lesson.chapterSlug}/${lesson.lessonSlug}`;
    let lessonContext = await getCurriculumLessonContext({
      schoolSlug,
      yearSlug: lesson.yearSlug,
      subjectSlug: lesson.subjectSlug,
      chapterSlug: lesson.chapterSlug,
      lessonSlug: lesson.lessonSlug,
    });

    if (!lessonContext && schoolSlug && lesson.yearSlug) {
      const target = await getModuleEditorTarget(row.lesson_id);
      const currentTags = normalizeAssignmentTags(target?.metadata.assignmentTags);
      const tagKey = `${schoolSlug}:${lesson.yearSlug}`;
      const nextTags = currentTags.some((tag) => `${tag.schoolSlug}:${tag.yearSlug}` === tagKey)
        ? currentTags
        : [...currentTags, { schoolSlug, yearSlug: lesson.yearSlug }];

      if (target && nextTags.length !== currentTags.length) {
        await updateCurriculumNode({
          nodeId: row.lesson_id,
          title: target.title,
          metadata: {
            ...target.metadata,
            assignmentTags: nextTags,
          },
        });

        lessonContext = await getCurriculumLessonContext({
          schoolSlug,
          yearSlug: lesson.yearSlug,
          subjectSlug: lesson.subjectSlug,
          chapterSlug: lesson.chapterSlug,
          lessonSlug: lesson.lessonSlug,
        });
      }
    }

    if (!lessonContext) continue;

    lessonsByKey.set(key, {
      id: lesson.lessonId,
      moduleId: module.moduleId,
      moduleTitle: module.moduleTitle,
      lessonId: lesson.lessonId,
      lessonTitle: lesson.lessonTitle,
      subject,
      subjectSlug: lesson.subjectSlug || module.subjectSlug,
      chapterTitle: chapter,
      description: chapter ? `${subject} / ${chapter}` : `${subject} lesson`,
      href: lessonHref,
      createdAt: row.assigned_at.toISOString(),
    });
  }

  return Array.from(lessonsByKey.values());
}

function sortCurriculumNodesByPosition<T extends { position: number; title: string }>(nodes: T[]) {
  return [...nodes].sort((left, right) => {
    if (left.position !== right.position) {
      return left.position - right.position;
    }

    return left.title.localeCompare(right.title);
  });
}

export async function listModuleCatalog(): Promise<ModuleCatalogSubjectGroup[]> {
  await ensureModuleEditorSchema();
  const [tree, modules] = await Promise.all([listCurriculumTree(), listModuleDocuments()]);

  const subjectOrder = new Map<string, number>();
  const chapterOrder = new Map<string, number>();
  const subjects = new Map<
    string,
    {
      id: string | null;
      slug: string;
      title: string;
      chapters: Map<string, { id: string | null; slug: string; title: string; modules: ModuleCatalogModuleSummary[] }>;
    }
  >();

  const ensureSubject = (slugInput: string, titleInput: string, idInput?: string | null) => {
    const slug = slugifyCatalogValue(slugInput || titleInput) || "general";
    const title = sanitizeText(titleInput, 180) || "General";
    const existing = subjects.get(slug);

    if (existing) {
      if (!existing.id && idInput) {
        existing.id = idInput;
      }
      if (!existing.title && title) {
        existing.title = title;
      }
      return existing;
    }

    const next = {
      id: sanitizeText(idInput, 180) || null,
      slug,
      title,
      chapters: new Map<string, { id: string | null; slug: string; title: string; modules: ModuleCatalogModuleSummary[] }>(),
    };
    subjects.set(slug, next);
    return next;
  };

  const ensureChapter = (
    subject: {
      id: string | null;
      slug: string;
      title: string;
      chapters: Map<string, { id: string | null; slug: string; title: string; modules: ModuleCatalogModuleSummary[] }>;
    },
    slugInput: string,
    titleInput: string,
    idInput?: string | null
  ) => {
    const slug = slugifyCatalogValue(slugInput || titleInput) || "general";
    const title = sanitizeText(titleInput, 180) || "General";
    const existing = subject.chapters.get(slug);

    if (existing) {
      if (!existing.id && idInput) {
        existing.id = idInput;
      }
      if (!existing.title && title) {
        existing.title = title;
      }
      return existing;
    }

    const next = {
      id: sanitizeText(idInput, 180) || null,
      slug,
      title,
      modules: [] as ModuleCatalogModuleSummary[],
    };
    subject.chapters.set(slug, next);
    return next;
  };

  const topLevelSubjects = sortCurriculumNodesByPosition(
    tree.filter((node) => node.nodeType === "subject" && node.parentId === null)
  );

  topLevelSubjects.forEach((subjectNode, subjectIndex) => {
    subjectOrder.set(subjectNode.slug, subjectIndex);
    const subject = ensureSubject(subjectNode.slug, subjectNode.title, subjectNode.id);

    sortCurriculumNodesByPosition(
      subjectNode.children.filter((child) => child.nodeType === "chapter")
    ).forEach((chapterNode, chapterIndex) => {
      chapterOrder.set(`${subjectNode.slug}:${chapterNode.slug}`, chapterIndex);
      ensureChapter(subject, chapterNode.slug, chapterNode.title, chapterNode.id);
    });
  });

  const sortedModules = [...modules].sort((left, right) =>
    [left.subjectTitle || "General", left.chapterTitle || "General", left.moduleTitle].join(" / ").localeCompare(
      [right.subjectTitle || "General", right.chapterTitle || "General", right.moduleTitle].join(" / ")
    )
  );

  sortedModules.forEach((module) => {
    const subject = ensureSubject(module.subjectSlug, module.subjectTitle);
    const chapter = ensureChapter(subject, module.chapterSlug, module.chapterTitle);

    chapter.modules.push({
      moduleId: module.moduleId,
      moduleTitle: module.moduleTitle,
      moduleCode: module.moduleCode,
      uniqueIdentifier: module.uniqueIdentifier,
      pageCount: module.pageCount,
      updatedAt: module.updatedAt,
      assignmentCount: module.assignments.length,
      subjectSlug: subject.slug,
      subjectTitle: subject.title,
      chapterSlug: chapter.slug,
      chapterTitle: chapter.title,
    });
  });

  return Array.from(subjects.values())
    .sort((left, right) => {
      const leftOrder = subjectOrder.get(left.slug) ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = subjectOrder.get(right.slug) ?? Number.MAX_SAFE_INTEGER;

      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }

      return left.title.localeCompare(right.title);
    })
    .map((subject) => ({
      id: subject.id,
      slug: subject.slug,
      title: subject.title,
      chapters: Array.from(subject.chapters.values())
        .sort((left, right) => {
          const leftOrder = chapterOrder.get(`${subject.slug}:${left.slug}`) ?? Number.MAX_SAFE_INTEGER;
          const rightOrder = chapterOrder.get(`${subject.slug}:${right.slug}`) ?? Number.MAX_SAFE_INTEGER;

          if (leftOrder !== rightOrder) {
            return leftOrder - rightOrder;
          }

          return left.title.localeCompare(right.title);
        })
        .map((chapter) => ({
          id: chapter.id,
          slug: chapter.slug,
          title: chapter.title,
          modules: chapter.modules,
        })),
    }));
}

export async function listSchoolModuleCatalog(): Promise<ModuleCatalogSchoolGroup[]> {
  await ensureModuleEditorSchema();
  const [tree, schools, modules] = await Promise.all([
    listCurriculumTree(),
    listCurriculumSchools(),
    listModuleDocuments(),
  ]);

  const modulesByScopedChapter = new Map<string, Map<string, ModuleCatalogModuleSummary>>();
  const unassignedModulesByChapter = new Map<string, Map<string, ModuleCatalogModuleSummary>>();
  const assignedLessonIdsByScopedChapter = new Map<string, Set<string>>();

  const addModuleSummary = (
    groups: Map<string, Map<string, ModuleCatalogModuleSummary>>,
    key: string,
    summary: ModuleCatalogModuleSummary,
    placementCount = summary.assignmentCount
  ) => {
    const existingGroup = groups.get(key) ?? new Map<string, ModuleCatalogModuleSummary>();
    const existingModule = existingGroup.get(summary.moduleId);

    if (existingModule) {
      existingModule.assignmentCount += placementCount;
    } else {
      existingGroup.set(summary.moduleId, {
        ...summary,
        assignmentCount: placementCount,
      });
    }

    groups.set(key, existingGroup);
  };

  for (const module of modules) {
    const fallbackSubjectSlug = slugifyCatalogValue(module.subjectSlug || module.subjectTitle);
    const fallbackChapterSlug = slugifyCatalogValue(module.chapterSlug || module.chapterTitle);

    const baseSummary = {
      moduleId: module.moduleId,
      moduleTitle: module.moduleTitle,
      moduleCode: module.moduleCode,
      uniqueIdentifier: module.uniqueIdentifier,
      pageCount: module.pageCount,
      updatedAt: module.updatedAt,
      assignmentCount: module.assignments.length,
      hasEditorDocument: true,
      subjectSlug: fallbackSubjectSlug,
      subjectTitle: module.subjectTitle || fallbackSubjectSlug,
      chapterSlug: fallbackChapterSlug,
      chapterTitle: module.chapterTitle || fallbackChapterSlug,
    };

    let hasScopedAssignment = false;
    for (const assignment of module.assignments) {
      const schoolSlug = slugifyCatalogValue(assignment.schoolSlug);
      const yearSlug = slugifyCatalogValue(assignment.yearSlug);
      const subjectSlug = slugifyCatalogValue(assignment.subjectSlug || fallbackSubjectSlug);
      const chapterSlug = slugifyCatalogValue(assignment.chapterSlug || fallbackChapterSlug);
      if (!schoolSlug || !subjectSlug || !chapterSlug) continue;

      hasScopedAssignment = true;
      const scopedChapterKey = `${schoolSlug}:${subjectSlug}:${chapterSlug}`;
      const assignedLessonIds = assignedLessonIdsByScopedChapter.get(scopedChapterKey) ?? new Set<string>();
      assignedLessonIds.add(assignment.lessonId);
      assignedLessonIdsByScopedChapter.set(scopedChapterKey, assignedLessonIds);
      addModuleSummary(
        modulesByScopedChapter,
        scopedChapterKey,
        {
          ...baseSummary,
          schoolSlug,
          yearSlug,
          lessonId: assignment.lessonId,
          lessonSlug: assignment.lessonSlug,
          hasEditorDocument: true,
          subjectSlug,
          subjectTitle: assignment.subjectTitle || module.subjectTitle || subjectSlug,
          chapterSlug,
          chapterTitle: assignment.chapterTitle || module.chapterTitle || chapterSlug,
        },
        1
      );
    }

    if (!hasScopedAssignment && fallbackSubjectSlug && fallbackChapterSlug) {
      addModuleSummary(unassignedModulesByChapter, `${fallbackSubjectSlug}:${fallbackChapterSlug}`, baseSummary, 0);
    }
  }

  const subjectNodesBySlug = new Map(
    tree
      .filter((node) => node.nodeType === "subject" && node.parentId === null)
      .map((node) => [slugifyCatalogValue(node.slug || node.title), node])
  );
  const matchesScope = (tags: CurriculumAssignmentTag[], schoolSlug: string, yearSlug: string) =>
    tags.some((tag) => tag.schoolSlug === schoolSlug && tag.yearSlug === yearSlug);
  const getVisibleLessons = (chapterNode: CurriculumNode, schoolSlug: string, yearSlug: string) => {
    const chapterTags = normalizeAssignmentTags(chapterNode.metadata.assignmentTags);
    const lessons = sortCurriculumNodesByPosition(chapterNode.children.filter((node) => node.nodeType === "lesson"));

    return lessons.filter((lesson) => {
      const lessonTags = normalizeAssignmentTags(lesson.metadata.assignmentTags);
      if (lessonTags.length > 0) {
        return matchesScope(lessonTags, schoolSlug, yearSlug);
      }

      if (chapterTags.length > 0) {
        return matchesScope(chapterTags, schoolSlug, yearSlug);
      }

      return false;
    });
  };

  const getChapterModules = (schoolSlug: string, subjectSlug: string, chapterSlug: string) => {
    const combined = new Map<string, ModuleCatalogModuleSummary>();
    const scopedModules = modulesByScopedChapter.get(`${schoolSlug}:${subjectSlug}:${chapterSlug}`);
    const unassignedModules = unassignedModulesByChapter.get(`${subjectSlug}:${chapterSlug}`);

    for (const module of unassignedModules?.values() ?? []) {
      combined.set(module.moduleId, module);
    }

    for (const module of scopedModules?.values() ?? []) {
      combined.set(module.moduleId, module);
    }

    return Array.from(combined.values()).sort((left, right) => left.moduleTitle.localeCompare(right.moduleTitle));
  };

  return schools
    .map((school) => {
      const subjects = new Map<
        string,
        {
          id: string | null;
          slug: string;
          title: string;
          position: number;
          chapters: Map<
            string,
            {
              id: string | null;
              slug: string;
              title: string;
              position: number;
              modules: ModuleCatalogModuleSummary[];
            }
          >;
        }
      >();

      for (const year of school.years) {
        for (const subjectSummary of year.subjects) {
          const subjectSlug = slugifyCatalogValue(subjectSummary.slug || subjectSummary.title);
          if (!subjectSlug) continue;

          const existingSubject = subjects.get(subjectSlug);
          const subject =
            existingSubject ??
            {
              id: subjectSummary.id,
              slug: subjectSlug,
              title: subjectSummary.title,
              position: subjectSummary.position,
              chapters: new Map<
                string,
                {
                  id: string | null;
                  slug: string;
                  title: string;
                  position: number;
                  modules: ModuleCatalogModuleSummary[];
                }
              >(),
            };

          if (existingSubject) {
            subject.position = Math.min(subject.position, subjectSummary.position);
          } else {
            subjects.set(subjectSlug, subject);
          }

          for (const chapterSummary of subjectSummary.chapters) {
            const chapterSlug = slugifyCatalogValue(chapterSummary.slug || chapterSummary.title);
            if (!chapterSlug || subject.chapters.has(chapterSlug)) continue;
            const scopedChapterKey = `${school.slug}:${subjectSlug}:${chapterSlug}`;
            const chapterModules = getChapterModules(school.slug, subjectSlug, chapterSlug);
            const assignedLessonIds =
              assignedLessonIdsByScopedChapter.get(scopedChapterKey) ??
              new Set(
                chapterModules
                  .map((module) => module.lessonId)
                  .filter((lessonId): lessonId is string => Boolean(lessonId))
              );
            const subjectNode = subjectNodesBySlug.get(subjectSlug) ?? null;
            const chapterNode =
              subjectNode?.children.find(
                (node) => node.nodeType === "chapter" && slugifyCatalogValue(node.slug || node.title) === chapterSlug
              ) ?? null;

            if (chapterNode) {
              for (const lesson of getVisibleLessons(chapterNode, school.slug, year.slug)) {
                if (assignedLessonIds.has(lesson.id)) continue;

                chapterModules.push({
                  moduleId: lesson.id,
                  moduleTitle: lesson.title,
                  moduleCode: sanitizeText(lesson.metadata.lessonCode, 80),
                  uniqueIdentifier: sanitizeText(lesson.metadata.uniqueIdentifier, 120) || lesson.id,
                  pageCount: 0,
                  updatedAt: lesson.updatedAt.toISOString(),
                  assignmentCount: 1,
                  schoolSlug: school.slug,
                  yearSlug: year.slug,
                  lessonId: lesson.id,
                  lessonSlug: lesson.slug,
                  hasEditorDocument: false,
                  subjectSlug,
                  subjectTitle: subjectSummary.title,
                  chapterSlug,
                  chapterTitle: chapterSummary.title,
                });
                assignedLessonIds.add(lesson.id);
              }
            }

            chapterModules.sort((left, right) => left.moduleTitle.localeCompare(right.moduleTitle));

            subject.chapters.set(chapterSlug, {
              id: chapterSummary.id,
              slug: chapterSlug,
              title: chapterSummary.title,
              position: chapterSummary.position,
              modules: chapterModules,
            });
          }
        }
      }

      return {
        id: school.id,
        slug: school.slug,
        title: school.title,
        subjects: Array.from(subjects.values())
          .sort((left, right) => {
            if (left.position !== right.position) {
              return left.position - right.position;
            }

            return left.title.localeCompare(right.title);
          })
          .map((subject) => ({
            id: subject.id,
            slug: subject.slug,
            title: subject.title,
            chapters: Array.from(subject.chapters.values())
              .sort((left, right) => {
                if (left.position !== right.position) {
                  return left.position - right.position;
                }

                return left.title.localeCompare(right.title);
              })
              .map((chapter) => ({
                id: chapter.id,
                slug: chapter.slug,
                title: chapter.title,
                modules: chapter.modules,
              })),
          })),
      };
    })
    .sort((left, right) => left.title.localeCompare(right.title));
}

export async function assignModuleToLesson(input: {
  moduleId: string;
  lessonId: string;
  actorUserId?: string;
}) {
  await ensureModuleEditorSchema();
  const moduleId = sanitizeText(input.moduleId, 180);
  const lessonId = sanitizeText(input.lessonId, 180);
  const actorUserId = sanitizeText(input.actorUserId, 180) || null;

  if (!moduleId) {
    throw new Error("Module was not found.");
  }

  if (!lessonId) {
    throw new Error("Lesson was not found.");
  }

  const [moduleDocument, lessonTarget] = await Promise.all([
    getModuleEditorDocument(moduleId),
    getModuleEditorTarget(lessonId),
  ]);

  if (!moduleDocument) {
    throw new Error("Module was not found.");
  }

  if (!lessonTarget || lessonTarget.nodeType !== "lesson") {
    throw new Error("Lesson was not found.");
  }

  await sql`
    INSERT INTO module_editor_lesson_assignments (
      lesson_id,
      module_id,
      assigned_by_user_id,
      assigned_at
    )
    VALUES (
      ${lessonId},
      ${moduleId},
      ${actorUserId},
      NOW()
    )
    ON CONFLICT (lesson_id)
    DO UPDATE SET
      module_id = EXCLUDED.module_id,
      assigned_by_user_id = EXCLUDED.assigned_by_user_id,
      assigned_at = NOW()
  `;

  return {
    moduleId,
    lessonId,
  };
}

export async function unassignModuleFromLesson(lessonId: string): Promise<void> {
  await ensureModuleEditorSchema();
  const cleanedLessonId = sanitizeText(lessonId, 180);
  if (!cleanedLessonId) return;

  await sql`
    DELETE FROM module_editor_lesson_assignments
    WHERE lesson_id = ${cleanedLessonId}
  `;
}

export async function deleteModuleDocument(moduleId: string): Promise<void> {
  await ensureModuleEditorSchema();
  const cleanedModuleId = sanitizeText(moduleId, 180);
  if (!cleanedModuleId) return;

  await sql`
    DELETE FROM module_editor_modules
    WHERE id = ${cleanedModuleId}
  `;
}
