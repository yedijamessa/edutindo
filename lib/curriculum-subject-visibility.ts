import "@/lib/server-only";

import {
  CURRICULUM_YEAR_OPTIONS,
  deleteCurriculumNode,
  listCurriculumTree,
  updateCurriculumNode,
  type CurriculumAssignmentTag,
  type CurriculumNode,
} from "@/lib/curriculum-portal";

export type CurriculumSubjectVisibilityAction = "show" | "hide" | "remove";

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getAssignmentTags(metadata: Record<string, unknown>): CurriculumAssignmentTag[] {
  return normalizeAssignmentTags(metadata.assignmentTags);
}

function getHiddenAssignmentTags(metadata: Record<string, unknown>): CurriculumAssignmentTag[] {
  return normalizeAssignmentTags(metadata.hiddenAssignmentTags);
}

function normalizeAssignmentTags(input: unknown): CurriculumAssignmentTag[] {
  if (!Array.isArray(input)) return [];

  const tags: CurriculumAssignmentTag[] = [];
  const seen = new Set<string>();

  for (const item of input) {
    if (typeof item !== "object" || item === null || Array.isArray(item)) continue;

    const record = item as Record<string, unknown>;
    const schoolSlug = normalizeSlug(String(record.schoolSlug ?? ""));
    const yearSlug = normalizeSlug(String(record.yearSlug ?? ""));

    if (!schoolSlug || !CURRICULUM_YEAR_OPTIONS.some((year) => year.slug === yearSlug)) continue;

    const key = `${schoolSlug}:${yearSlug}`;
    if (seen.has(key)) continue;

    seen.add(key);
    tags.push({ schoolSlug, yearSlug });
  }

  return tags;
}

function mergeTags(left: CurriculumAssignmentTag[], right: CurriculumAssignmentTag[]) {
  const merged = new Map<string, CurriculumAssignmentTag>();

  for (const tag of [...left, ...right]) {
    merged.set(`${tag.schoolSlug}:${tag.yearSlug}`, tag);
  }

  return Array.from(merged.values()).sort((a, b) =>
    `${a.schoolSlug}:${a.yearSlug}`.localeCompare(`${b.schoolSlug}:${b.yearSlug}`)
  );
}

function removeSchoolTags(tags: CurriculumAssignmentTag[], schoolSlug: string) {
  return tags.filter((tag) => tag.schoolSlug !== schoolSlug);
}

function getSchoolTags(tags: CurriculumAssignmentTag[], schoolSlug: string) {
  return tags.filter((tag) => tag.schoolSlug === schoolSlug);
}

function getFallbackVisibilityTags(node: CurriculumNode, schoolSlug: string) {
  const existingYearSlugs = getAssignmentTags(node.metadata)
    .map((tag) => tag.yearSlug)
    .filter((yearSlug, index, items) => items.indexOf(yearSlug) === index);

  const yearSlugs =
    existingYearSlugs.length > 0
      ? existingYearSlugs
      : [CURRICULUM_YEAR_OPTIONS[0]?.slug ?? "year-7"];

  return yearSlugs.map((yearSlug) => ({ schoolSlug, yearSlug }));
}

function getVisibilityTagsToRestore(node: CurriculumNode, schoolSlug: string) {
  const hiddenSchoolTags = getSchoolTags(getHiddenAssignmentTags(node.metadata), schoolSlug);
  if (hiddenSchoolTags.length > 0) return hiddenSchoolTags;

  const currentSchoolTags = getSchoolTags(getAssignmentTags(node.metadata), schoolSlug);
  if (currentSchoolTags.length > 0) return currentSchoolTags;

  return getFallbackVisibilityTags(node, schoolSlug);
}

function findSubject(tree: CurriculumNode[], subjectId: string) {
  return tree.find((node) => node.nodeType === "subject" && node.parentId === null && node.id === subjectId) ?? null;
}

function findSchool(tree: CurriculumNode[], schoolSlug: string) {
  return tree.find((node) => node.nodeType === "school" && node.parentId === null && node.slug === schoolSlug) ?? null;
}

function getSubjectContentNodes(subject: CurriculumNode) {
  const chapters = subject.children.filter((node) => node.nodeType === "chapter");
  const lessons = chapters.flatMap((chapter) => chapter.children.filter((node) => node.nodeType === "lesson"));

  return { chapters, lessons };
}

async function setNodeVisibleForSchool(input: {
  node: CurriculumNode;
  schoolSlug: string;
  actorUserId: string;
  restoredTags?: CurriculumAssignmentTag[];
}) {
  const assignmentTags = getAssignmentTags(input.node.metadata);
  const hiddenAssignmentTags = getHiddenAssignmentTags(input.node.metadata);
  const restoredTags = input.restoredTags ?? getVisibilityTagsToRestore(input.node, input.schoolSlug);

  await updateCurriculumNode({
    nodeId: input.node.id,
    title: input.node.title,
    metadata: {
      ...input.node.metadata,
      assignmentTags: mergeTags(assignmentTags, restoredTags),
      hiddenAssignmentTags: removeSchoolTags(hiddenAssignmentTags, input.schoolSlug),
    },
    actorUserId: input.actorUserId,
  });
}

async function setNodeHiddenForSchool(input: {
  node: CurriculumNode;
  schoolSlug: string;
  actorUserId: string;
}) {
  const assignmentTags = getAssignmentTags(input.node.metadata);
  const hiddenAssignmentTags = getHiddenAssignmentTags(input.node.metadata);
  const schoolTags = getSchoolTags(assignmentTags, input.schoolSlug);

  await updateCurriculumNode({
    nodeId: input.node.id,
    title: input.node.title,
    metadata: {
      ...input.node.metadata,
      assignmentTags: removeSchoolTags(assignmentTags, input.schoolSlug),
      hiddenAssignmentTags: mergeTags(
        removeSchoolTags(hiddenAssignmentTags, input.schoolSlug),
        schoolTags
      ),
    },
    actorUserId: input.actorUserId,
  });
}

async function setSubjectVisibleForSchool(input: {
  subject: CurriculumNode;
  schoolSlug: string;
  actorUserId: string;
}) {
  const { chapters, lessons } = getSubjectContentNodes(input.subject);
  const contentNodes = [input.subject, ...chapters, ...lessons];
  const subjectRestoredTags = mergeTags(
    [],
    contentNodes.flatMap((node) => getVisibilityTagsToRestore(node, input.schoolSlug))
  );

  await setNodeVisibleForSchool({
    node: input.subject,
    schoolSlug: input.schoolSlug,
    actorUserId: input.actorUserId,
    restoredTags: subjectRestoredTags,
  });

  for (const node of [...chapters, ...lessons]) {
    await setNodeVisibleForSchool({
      node,
      schoolSlug: input.schoolSlug,
      actorUserId: input.actorUserId,
    });
  }
}

async function setSubjectHiddenForSchool(input: {
  subject: CurriculumNode;
  schoolSlug: string;
  actorUserId: string;
}) {
  const { chapters, lessons } = getSubjectContentNodes(input.subject);

  for (const node of [input.subject, ...chapters, ...lessons]) {
    await setNodeHiddenForSchool({
      node,
      schoolSlug: input.schoolSlug,
      actorUserId: input.actorUserId,
    });
  }
}

export async function applyCurriculumSubjectVisibilityAction(input: {
  schoolSlug: string;
  subjectId: string;
  action: CurriculumSubjectVisibilityAction;
  actorUserId: string;
}) {
  const schoolSlug = normalizeSlug(input.schoolSlug);
  const tree = await listCurriculumTree();
  const school = findSchool(tree, schoolSlug);
  const subject = findSubject(tree, input.subjectId);

  if (!school) {
    throw new Error("School was not found.");
  }

  if (!subject) {
    throw new Error("Subject was not found.");
  }

  if (input.action === "show") {
    await setSubjectVisibleForSchool({ subject, schoolSlug: school.slug, actorUserId: input.actorUserId });
    return;
  }

  if (input.action === "hide") {
    await setSubjectHiddenForSchool({ subject, schoolSlug: school.slug, actorUserId: input.actorUserId });
    return;
  }

  if (input.action === "remove") {
    await deleteCurriculumNode(subject.id);
    return;
  }

  throw new Error("Invalid subject visibility action.");
}
