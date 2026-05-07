import { randomUUID } from "crypto";
import path from "path";
import dotenv from "dotenv";
import {
  DEFAULT_CURRICULUM_SCHOOL_SLUG,
  createCurriculumNode,
  listCurriculumTree,
  reorderCurriculumSiblings,
  type CurriculumNode,
  updateCurriculumNode,
} from "@/lib/curriculum-portal";
import {
  year7ScienceChapters,
  type Year7ScienceChapter,
  type Year7ScienceLesson,
} from "@/lib/curriculum/year7/science";
import { getModuleEditorDocument, saveModuleEditorDocument } from "@/lib/module-editor";
import type { ModuleEditorBlock, ModuleEditorPage } from "@/types/module-editor";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const ACTOR_USER_ID = "system-science-year7-seed";
const SCIENCE_SUBJECT_TITLE = "Science";
const SCIENCE_SUBJECT_SLUG = "science";
const YEAR_SLUG = "year-7";
const overwriteDocs = process.argv.includes("--overwrite-docs");

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

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function collectChildren(parent: CurriculumNode, nodeType: CurriculumNode["nodeType"]) {
  return parent.children.filter((child) => child.nodeType === nodeType);
}

function findScienceSubject(tree: CurriculumNode[]) {
  return (
    tree.find((node) => node.nodeType === "subject" && node.slug === SCIENCE_SUBJECT_SLUG) ??
    tree.find(
      (node) => node.nodeType === "subject" && normalizeText(node.title) === normalizeText(SCIENCE_SUBJECT_TITLE)
    ) ??
    null
  );
}

function getChapterCandidateSlugs(chapter: Year7ScienceChapter) {
  return Array.from(new Set([chapter.slug, slugify(chapter.shortTitle), slugify(chapter.unitTitle)]));
}

function findChapterNode(subjectTree: CurriculumNode, chapter: Year7ScienceChapter) {
  const candidateSlugs = new Set(getChapterCandidateSlugs(chapter));

  return (
    collectChildren(subjectTree, "chapter").find((item) => candidateSlugs.has(item.slug)) ??
    collectChildren(subjectTree, "chapter").find(
      (item) => normalizeText(item.title) === normalizeText(chapter.shortTitle)
    ) ??
    null
  );
}

function getLessonCandidateSlugs(lesson: Year7ScienceLesson) {
  return Array.from(new Set([lesson.slug, slugify(lesson.title)].filter(Boolean) as string[]));
}

function findLessonNode(
  chapterTree: CurriculumNode,
  lesson: Year7ScienceLesson,
  lessonIndex: number,
  usedNodeIds: Set<string>
) {
  const lessons = collectChildren(chapterTree, "lesson");
  const candidateSlugs = new Set(getLessonCandidateSlugs(lesson));

  const bySlug =
    lessons.find((item) => !usedNodeIds.has(item.id) && candidateSlugs.has(item.slug)) ?? null;
  if (bySlug) return bySlug;

  const byCode =
    lessons.find(
      (item) =>
        !usedNodeIds.has(item.id) &&
        normalizeText(String(item.metadata.lessonCode ?? "")) === normalizeText(lesson.lessonCode)
    ) ?? null;
  if (byCode) return byCode;

  const byTitle =
    lessons.find((item) => !usedNodeIds.has(item.id) && normalizeText(item.title) === normalizeText(lesson.title)) ??
    null;
  if (byTitle) return byTitle;

  const byPosition = lessons[lessonIndex] ?? null;
  if (byPosition && !usedNodeIds.has(byPosition.id)) {
    return byPosition;
  }

  return null;
}

function getSubjectMetadata() {
  return {
    description:
      "Year 7 Science curriculum aligned to the supplied biology, chemistry, and physics textbook contents.",
  };
}

function getAssignmentTags(existingMetadata?: Record<string, unknown>) {
  const existingTags = Array.isArray(existingMetadata?.assignmentTags) ? existingMetadata.assignmentTags : [];

  if (existingTags.length > 0) {
    return existingTags;
  }

  return [{ schoolSlug: DEFAULT_CURRICULUM_SCHOOL_SLUG, yearSlug: YEAR_SLUG }];
}

function getChapterMetadata(chapter: Year7ScienceChapter, existingMetadata?: Record<string, unknown>) {
  return {
    weekRange: chapter.weekRange,
    strand: chapter.strand,
    unitTitle: chapter.unitTitle,
    learningOutcomes: chapter.learningOutcomes,
    preTestQuizId: String(existingMetadata?.preTestQuizId ?? ""),
    postTestQuizId: String(existingMetadata?.postTestQuizId ?? ""),
    preTestEnabled: Boolean(existingMetadata?.preTestEnabled),
    postTestEnabled: Boolean(existingMetadata?.postTestEnabled),
    assignmentTags: getAssignmentTags(existingMetadata),
  };
}

function getLessonMetadata(lesson: Year7ScienceLesson, existingMetadata?: Record<string, unknown>) {
  return {
    week: lesson.week,
    lessonCode: lesson.lessonCode,
    assignmentTags: getAssignmentTags(existingMetadata),
  };
}

function createTextBlock(title: string, body: string): ModuleEditorBlock {
  return {
    id: randomUUID(),
    type: "text",
    title,
    body,
  };
}

function createPage(title: string, description: string, blocks: ModuleEditorBlock[]): ModuleEditorPage {
  return {
    id: randomUUID(),
    title,
    description,
    blocks,
  };
}

function buildLessonPages(chapter: Year7ScienceChapter, lesson: Year7ScienceLesson) {
  return [
    createPage(
      lesson.title,
      `Auto-generated Year 7 Science module for ${chapter.shortTitle}.`,
      [
        createTextBlock(
          "Module Overview",
          [
            `Strand: ${chapter.strand}`,
            `Chapter: ${chapter.shortTitle}`,
            `Lesson code: ${lesson.lessonCode}`,
            `Suggested week: ${lesson.week}`,
            "",
            "This placeholder module was generated from the supplied Year 7 Science textbook contents.",
          ].join("\n")
        ),
        createTextBlock(
          "Build Next",
          `Add the main explanation, examples, one practical activity, and a short check for "${lesson.title}".`
        ),
      ]
    ),
  ];
}

async function ensureScienceSubject() {
  const tree = await listCurriculumTree();
  const existing = findScienceSubject(tree);

  if (existing) {
    return updateCurriculumNode({
      nodeId: existing.id,
      title: SCIENCE_SUBJECT_TITLE,
      metadata: getSubjectMetadata(),
      actorUserId: ACTOR_USER_ID,
    });
  }

  return createCurriculumNode({
    nodeType: "subject",
    title: SCIENCE_SUBJECT_TITLE,
    metadata: getSubjectMetadata(),
    actorUserId: ACTOR_USER_ID,
  });
}

async function ensureChapter(subjectId: string, subjectTree: CurriculumNode, chapter: Year7ScienceChapter) {
  const existing = findChapterNode(subjectTree, chapter);

  if (existing) {
    return updateCurriculumNode({
      nodeId: existing.id,
      title: chapter.shortTitle,
      metadata: getChapterMetadata(chapter, existing.metadata),
      actorUserId: ACTOR_USER_ID,
    });
  }

  return createCurriculumNode({
    nodeType: "chapter",
    parentId: subjectId,
    title: chapter.shortTitle,
    metadata: getChapterMetadata(chapter),
    actorUserId: ACTOR_USER_ID,
  });
}

async function ensureLesson(
  chapterId: string,
  chapterTree: CurriculumNode,
  lesson: Year7ScienceLesson,
  lessonIndex: number,
  usedNodeIds: Set<string>
) {
  const existing = findLessonNode(chapterTree, lesson, lessonIndex, usedNodeIds);

  if (existing) {
    usedNodeIds.add(existing.id);
    return updateCurriculumNode({
      nodeId: existing.id,
      title: lesson.title,
      metadata: getLessonMetadata(lesson, existing.metadata),
      actorUserId: ACTOR_USER_ID,
    });
  }

  return createCurriculumNode({
    nodeType: "lesson",
    parentId: chapterId,
    title: lesson.title,
    metadata: getLessonMetadata(lesson),
    actorUserId: ACTOR_USER_ID,
  });
}

async function reorderChapterLessons(chapterTree: CurriculumNode, ensuredLessonIds: string[]) {
  const currentLessonIds = collectChildren(chapterTree, "lesson").map((item) => item.id);
  const orderedNodeIds = [
    ...ensuredLessonIds,
    ...currentLessonIds.filter((id) => !ensuredLessonIds.includes(id)),
  ];

  if (orderedNodeIds.length === 0) return;

  await reorderCurriculumSiblings({
    parentId: chapterTree.id,
    nodeType: "lesson",
    orderedNodeIds,
    actorUserId: ACTOR_USER_ID,
  });
}

async function reorderScienceChapters(subjectTree: CurriculumNode, ensuredChapterIds: string[]) {
  const currentChapterIds = collectChildren(subjectTree, "chapter").map((item) => item.id);
  const orderedNodeIds = [
    ...ensuredChapterIds,
    ...currentChapterIds.filter((id) => !ensuredChapterIds.includes(id)),
  ];

  if (orderedNodeIds.length === 0) return;

  await reorderCurriculumSiblings({
    parentId: subjectTree.id,
    nodeType: "chapter",
    orderedNodeIds,
    actorUserId: ACTOR_USER_ID,
  });
}

async function ensureLessonDocument(chapter: Year7ScienceChapter, lesson: Year7ScienceLesson, lessonNodeId: string) {
  const existingDocument = await getModuleEditorDocument(lessonNodeId);
  if (existingDocument && !overwriteDocs) {
    return;
  }

  await saveModuleEditorDocument({
    nodeId: lessonNodeId,
    title: lesson.title,
    pages: buildLessonPages(chapter, lesson),
    actorUserId: ACTOR_USER_ID,
  });
}

async function syncScienceYear7Curriculum() {
  console.log("Syncing Year 7 Science curriculum...");

  const subject = await ensureScienceSubject();
  const ensuredChapterIds: string[] = [];

  for (const chapter of [...year7ScienceChapters].sort((left, right) => left.order - right.order)) {
    const subjectTreeBeforeChapter = findScienceSubject(await listCurriculumTree());
    if (!subjectTreeBeforeChapter) {
      throw new Error("Science subject could not be loaded from the curriculum tree.");
    }

    const chapterNode = await ensureChapter(subject.id, subjectTreeBeforeChapter, chapter);
    ensuredChapterIds.push(chapterNode.id);

    const refreshedSubjectTree = findScienceSubject(await listCurriculumTree());
    if (!refreshedSubjectTree) {
      throw new Error("Science subject could not be reloaded after chapter sync.");
    }

    const chapterTree = findChapterNode(refreshedSubjectTree, chapter);
    if (!chapterTree) {
      throw new Error(`Chapter ${chapter.shortTitle} could not be reloaded.`);
    }

    const usedLessonNodeIds = new Set<string>();
    const ensuredLessonIds: string[] = [];

    for (const [lessonIndex, lesson] of chapter.lessons.entries()) {
      const lessonNode = await ensureLesson(chapterNode.id, chapterTree, lesson, lessonIndex, usedLessonNodeIds);
      ensuredLessonIds.push(lessonNode.id);
      await ensureLessonDocument(chapter, lesson, lessonNode.id);
    }

    const latestSubjectTree = findScienceSubject(await listCurriculumTree());
    const latestChapterTree = latestSubjectTree ? findChapterNode(latestSubjectTree, chapter) : null;

    if (!latestChapterTree) {
      throw new Error(`Chapter ${chapter.shortTitle} could not be reloaded for reordering.`);
    }

    await reorderChapterLessons(latestChapterTree, ensuredLessonIds);
  }

  const finalSubjectTree = findScienceSubject(await listCurriculumTree());
  if (!finalSubjectTree) {
    throw new Error("Science subject could not be reloaded for chapter reordering.");
  }

  await reorderScienceChapters(finalSubjectTree, ensuredChapterIds);
}

async function main() {
  await syncScienceYear7Curriculum();
  console.log("Year 7 Science curriculum sync finished.");
}

main().catch((error) => {
  console.error("Year 7 Science curriculum sync failed.");
  console.error(error);
  process.exitCode = 1;
});
