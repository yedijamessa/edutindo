import "@/lib/server-only";

import { randomUUID } from "crypto";
import { canManageAdminAccess } from "@/lib/auth-shared";
import {
  CURRICULUM_YEAR_OPTIONS,
  deleteCurriculumNode,
  listCurriculumTree,
  updateCurriculumNode,
  type CurriculumAssignmentTag,
  type CurriculumNode,
} from "@/lib/curriculum-portal";
import { sqlQuery as sql } from "@/lib/postgres-query";

export type CurriculumSubjectVisibilityAction = "show" | "hide" | "remove";
export type CurriculumSubjectVisibilityRequestStatus = "pending" | "approved" | "rejected";

export interface CurriculumSubjectVisibilityRequest {
  id: string;
  schoolSlug: string;
  subjectId: string;
  subjectTitle: string;
  action: CurriculumSubjectVisibilityAction;
  status: CurriculumSubjectVisibilityRequestStatus;
  requestedByUserId: string;
  requestedByEmail: string;
  approvedByUserId: string | null;
  approvedByEmail: string | null;
  decidedAt: Date | null;
  createdAt: Date;
}

type RequestRow = {
  id: string;
  school_slug: string;
  subject_id: string;
  subject_title: string;
  action: string;
  status: string;
  requested_by_user_id: string;
  requested_by_email: string;
  approved_by_user_id: string | null;
  approved_by_email: string | null;
  decided_at: Date | null;
  created_at: Date;
};

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function mapRequest(row: RequestRow): CurriculumSubjectVisibilityRequest {
  return {
    id: row.id,
    schoolSlug: row.school_slug,
    subjectId: row.subject_id,
    subjectTitle: row.subject_title,
    action: row.action as CurriculumSubjectVisibilityAction,
    status: row.status as CurriculumSubjectVisibilityRequestStatus,
    requestedByUserId: row.requested_by_user_id,
    requestedByEmail: row.requested_by_email,
    approvedByUserId: row.approved_by_user_id,
    approvedByEmail: row.approved_by_email,
    decidedAt: row.decided_at ? new Date(row.decided_at) : null,
    createdAt: new Date(row.created_at),
  };
}

async function ensureSubjectVisibilityRequestSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS curriculum_subject_visibility_requests (
      id TEXT PRIMARY KEY,
      school_slug TEXT NOT NULL,
      subject_id TEXT NOT NULL,
      subject_title TEXT NOT NULL,
      action TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      requested_by_user_id TEXT NOT NULL,
      requested_by_email TEXT NOT NULL,
      approved_by_user_id TEXT,
      approved_by_email TEXT,
      decided_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS curriculum_subject_visibility_requests_pending_idx
    ON curriculum_subject_visibility_requests (school_slug, status, created_at DESC)
  `;
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

async function setSubjectVisibleForSchool(input: {
  subject: CurriculumNode;
  schoolSlug: string;
  actorUserId: string;
}) {
  const { chapters, lessons } = getSubjectContentNodes(input.subject);

  for (const chapter of [...chapters, ...lessons]) {
    const assignmentTags = getAssignmentTags(chapter.metadata);
    const hiddenAssignmentTags = getHiddenAssignmentTags(chapter.metadata);
    const restoredTags = getVisibilityTagsToRestore(chapter, input.schoolSlug);

    await updateCurriculumNode({
      nodeId: chapter.id,
      title: chapter.title,
      metadata: {
        ...chapter.metadata,
        assignmentTags: mergeTags(assignmentTags, restoredTags),
        hiddenAssignmentTags: removeSchoolTags(hiddenAssignmentTags, input.schoolSlug),
      },
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

  for (const node of [...chapters, ...lessons]) {
    const assignmentTags = getAssignmentTags(node.metadata);
    const hiddenAssignmentTags = getHiddenAssignmentTags(node.metadata);
    const schoolTags = getSchoolTags(assignmentTags, input.schoolSlug);

    await updateCurriculumNode({
      nodeId: node.id,
      title: node.title,
      metadata: {
        ...node.metadata,
        assignmentTags: removeSchoolTags(assignmentTags, input.schoolSlug),
        hiddenAssignmentTags: mergeTags(
          removeSchoolTags(hiddenAssignmentTags, input.schoolSlug),
          schoolTags
        ),
      },
      actorUserId: input.actorUserId,
    });
  }
}

export function canApproveCurriculumSubjectVisibility(email: string | null | undefined) {
  return canManageAdminAccess(email);
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

export async function listPendingCurriculumSubjectVisibilityRequests(schoolSlugInput?: string | null) {
  await ensureSubjectVisibilityRequestSchema();

  const schoolSlug = schoolSlugInput ? normalizeSlug(schoolSlugInput) : "";
  const result = schoolSlug
    ? await sql<RequestRow>`
        SELECT
          id,
          school_slug,
          subject_id,
          subject_title,
          action,
          status,
          requested_by_user_id,
          requested_by_email,
          approved_by_user_id,
          approved_by_email,
          decided_at,
          created_at
        FROM curriculum_subject_visibility_requests
        WHERE school_slug = ${schoolSlug}
          AND status = 'pending'
        ORDER BY created_at DESC
      `
    : await sql<RequestRow>`
        SELECT
          id,
          school_slug,
          subject_id,
          subject_title,
          action,
          status,
          requested_by_user_id,
          requested_by_email,
          approved_by_user_id,
          approved_by_email,
          decided_at,
          created_at
        FROM curriculum_subject_visibility_requests
        WHERE status = 'pending'
        ORDER BY created_at DESC
      `;

  return result.rows.map(mapRequest);
}

export async function requestOrApplyCurriculumSubjectVisibilityAction(input: {
  schoolSlug: string;
  subjectId: string;
  action: CurriculumSubjectVisibilityAction;
  actorUserId: string;
  actorEmail: string;
}) {
  await ensureSubjectVisibilityRequestSchema();

  const action = input.action;
  if (!["show", "hide", "remove"].includes(action)) {
    throw new Error("Invalid subject visibility action.");
  }

  const actorEmail = normalizeEmail(input.actorEmail);
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

  if (canApproveCurriculumSubjectVisibility(actorEmail)) {
    await applyCurriculumSubjectVisibilityAction({
      schoolSlug: school.slug,
      subjectId: subject.id,
      action,
      actorUserId: input.actorUserId,
    });

    return { applied: true, request: null };
  }

  const existing = await sql<RequestRow>`
    SELECT
      id,
      school_slug,
      subject_id,
      subject_title,
      action,
      status,
      requested_by_user_id,
      requested_by_email,
      approved_by_user_id,
      approved_by_email,
      decided_at,
      created_at
    FROM curriculum_subject_visibility_requests
    WHERE school_slug = ${school.slug}
      AND subject_id = ${subject.id}
      AND action = ${action}
      AND status = 'pending'
    ORDER BY created_at DESC
    LIMIT 1
  `;

  if (existing.rows[0]) {
    return { applied: false, request: mapRequest(existing.rows[0]) };
  }

  const result = await sql<RequestRow>`
    INSERT INTO curriculum_subject_visibility_requests (
      id,
      school_slug,
      subject_id,
      subject_title,
      action,
      status,
      requested_by_user_id,
      requested_by_email
    )
    VALUES (
      ${randomUUID()},
      ${school.slug},
      ${subject.id},
      ${subject.title},
      ${action},
      ${"pending"},
      ${input.actorUserId},
      ${actorEmail}
    )
    RETURNING
      id,
      school_slug,
      subject_id,
      subject_title,
      action,
      status,
      requested_by_user_id,
      requested_by_email,
      approved_by_user_id,
      approved_by_email,
      decided_at,
      created_at
  `;

  return { applied: false, request: mapRequest(result.rows[0]) };
}

export async function decideCurriculumSubjectVisibilityRequest(input: {
  requestId: string;
  decision: "approved" | "rejected";
  actorUserId: string;
  actorEmail: string;
}) {
  await ensureSubjectVisibilityRequestSchema();

  const actorEmail = normalizeEmail(input.actorEmail);
  if (!canApproveCurriculumSubjectVisibility(actorEmail)) {
    throw new Error("Only admin@edutindo.org, it@edutindo.org, or ymsp@edutindo.org can approve this.");
  }

  const requestResult = await sql<RequestRow>`
    SELECT
      id,
      school_slug,
      subject_id,
      subject_title,
      action,
      status,
      requested_by_user_id,
      requested_by_email,
      approved_by_user_id,
      approved_by_email,
      decided_at,
      created_at
    FROM curriculum_subject_visibility_requests
    WHERE id = ${input.requestId}
    LIMIT 1
  `;

  const request = requestResult.rows[0];
  if (!request) {
    throw new Error("Approval request was not found.");
  }

  if (request.status !== "pending") {
    throw new Error("Approval request has already been decided.");
  }

  if (input.decision === "approved") {
    await applyCurriculumSubjectVisibilityAction({
      schoolSlug: request.school_slug,
      subjectId: request.subject_id,
      action: request.action as CurriculumSubjectVisibilityAction,
      actorUserId: input.actorUserId,
    });
  }

  const result = await sql<RequestRow>`
    UPDATE curriculum_subject_visibility_requests
    SET
      status = ${input.decision},
      approved_by_user_id = ${input.actorUserId},
      approved_by_email = ${actorEmail},
      decided_at = NOW(),
      updated_at = NOW()
    WHERE id = ${input.requestId}
    RETURNING
      id,
      school_slug,
      subject_id,
      subject_title,
      action,
      status,
      requested_by_user_id,
      requested_by_email,
      approved_by_user_id,
      approved_by_email,
      decided_at,
      created_at
  `;

  return mapRequest(result.rows[0]);
}
