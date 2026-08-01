import "@/lib/server-only";

import {
  AuthError,
  ensureAuthSchema,
  isValidEmail,
  listUsersWithPortals,
  normalizeEmail,
  recordStudentLessonAssignment,
  setUserPortals,
  setUserSchoolSlugs,
} from "@/lib/auth";
import { updateCurriculumNode, type CurriculumAssignmentTag } from "@/lib/curriculum-portal";
import { getModuleEditorTarget, listModuleDocuments } from "@/lib/module-editor";
import { sqlQuery as sql } from "@/lib/postgres-query";
import type {
  CurriculumAssignmentOption,
  CurriculumAssignmentPortalData,
  CurriculumAssignmentRecord,
  CurriculumAssignmentStudent,
} from "@/types/curriculum-assignments";
import type { ModuleLessonAssignment } from "@/types/module-editor";

type StudentAssignmentPortalRow = {
  id: number;
  user_id: string | null;
  email: string;
  school_slug: string;
  lesson_id: string;
  module_id: string;
  assigned_at: Date;
  assigned_by_email: string | null;
};

function getBreadcrumbTitle(lesson: ModuleLessonAssignment, nodeType: "school" | "year" | "subject" | "chapter") {
  return lesson.breadcrumbs.find((item) => item.nodeType === nodeType)?.title ?? "";
}

function makeAssignmentHref(lesson: ModuleLessonAssignment, fallbackSchoolSlug: string) {
  if (!lesson.yearSlug || !lesson.subjectSlug || !lesson.chapterSlug || !lesson.lessonSlug) return "";

  return `/student/materials/curriculum/${lesson.schoolSlug || fallbackSchoolSlug}/${lesson.yearSlug}/${lesson.subjectSlug}/${lesson.chapterSlug}/${lesson.lessonSlug}`;
}

function makeStudentName(firstName: string, lastName: string, email: string) {
  const name = `${firstName} ${lastName}`.trim();
  return name || email;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeAssignmentTags(value: unknown): CurriculumAssignmentTag[] {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();
  const tags: CurriculumAssignmentTag[] = [];

  for (const item of value) {
    if (!isRecord(item)) continue;

    const schoolSlug = String(item.schoolSlug ?? "").trim().toLowerCase();
    const yearSlug = String(item.yearSlug ?? "").trim().toLowerCase();
    if (!schoolSlug || !yearSlug) continue;

    const key = `${schoolSlug}:${yearSlug}`;
    if (seen.has(key)) continue;

    seen.add(key);
    tags.push({ schoolSlug, yearSlug });
  }

  return tags;
}

function createModuleOptions(modules: Awaited<ReturnType<typeof listModuleDocuments>>): CurriculumAssignmentOption[] {
  return modules
    .flatMap((module) =>
      module.assignments.map((lesson) => {
        const schoolTitle = getBreadcrumbTitle(lesson, "school") || "Curriculum";
        const yearTitle = getBreadcrumbTitle(lesson, "year") || lesson.yearSlug;
        const subjectTitle = lesson.subjectTitle || getBreadcrumbTitle(lesson, "subject") || module.subjectTitle;
        const chapterTitle = lesson.chapterTitle || getBreadcrumbTitle(lesson, "chapter") || module.chapterTitle;

        return {
          id: `${module.moduleId}:${lesson.lessonId}`,
          moduleId: module.moduleId,
          moduleTitle: module.moduleTitle,
          lessonId: lesson.lessonId,
          lessonTitle: lesson.lessonTitle,
          schoolSlug: lesson.schoolSlug,
          schoolTitle,
          yearSlug: lesson.yearSlug,
          yearTitle,
          subjectSlug: lesson.subjectSlug,
          subjectTitle,
          chapterSlug: lesson.chapterSlug,
          chapterTitle,
          label: `${module.moduleTitle} - ${schoolTitle} / ${yearTitle} / ${subjectTitle} / ${chapterTitle}`,
        };
      })
    )
    .sort((left, right) => left.label.localeCompare(right.label));
}

export async function listCurriculumAssignmentPortalData(): Promise<CurriculumAssignmentPortalData> {
  await ensureAuthSchema();

  const [users, modules, assignmentResult] = await Promise.all([
    listUsersWithPortals(),
    listModuleDocuments(),
    sql<StudentAssignmentPortalRow>`
      SELECT
        assignment.id,
        assignment.user_id,
        assignment.email,
        assignment.school_slug,
        assignment.lesson_id,
        assignment.module_id,
        assignment.assigned_at,
        actor.email AS assigned_by_email
      FROM auth_student_lesson_assignments AS assignment
      LEFT JOIN auth_users AS actor
        ON actor.id = assignment.assigned_by_user_id
      ORDER BY assignment.assigned_at DESC
    `,
  ]);

  const studentsByKey = new Map<string, CurriculumAssignmentStudent>();
  const studentsByUserId = new Map<string, CurriculumAssignmentStudent>();
  const studentsByEmail = new Map<string, CurriculumAssignmentStudent>();
  const modulesById = new Map(modules.map((module) => [module.moduleId, module]));

  for (const user of users) {
    const email = normalizeEmail(user.email);
    const student: CurriculumAssignmentStudent = {
      key: `user:${user.id}`,
      userId: user.id,
      email,
      name: makeStudentName(user.firstName, user.lastName, email),
      portals: user.portals,
      schoolSlugs: user.schoolSlugs,
      status: user.emailVerified ? "active" : "unverified",
      assignments: [],
    };

    studentsByKey.set(student.key, student);
    studentsByUserId.set(user.id, student);
    studentsByEmail.set(email, student);
  }

  for (const row of assignmentResult.rows) {
    const email = normalizeEmail(row.email);
    const student =
      (row.user_id ? studentsByUserId.get(row.user_id) : null) ??
      studentsByEmail.get(email) ??
      (() => {
        const pendingStudent: CurriculumAssignmentStudent = {
          key: `email:${email}`,
          userId: null,
          email,
          name: email,
          portals: ["student"],
          schoolSlugs: row.school_slug ? [row.school_slug] : [],
          status: "pending",
          assignments: [],
        };

        studentsByKey.set(pendingStudent.key, pendingStudent);
        studentsByEmail.set(email, pendingStudent);
        return pendingStudent;
      })();

    const module = modulesById.get(row.module_id);
    const lesson = module?.assignments.find((item) => item.lessonId === row.lesson_id) ?? null;
    const schoolSlug = lesson?.schoolSlug || row.school_slug;
    const yearSlug = lesson?.yearSlug || "";
    const subjectSlug = lesson?.subjectSlug || "";
    const chapterSlug = lesson?.chapterSlug || "";
    const lessonSlug = lesson?.lessonSlug || "";

    const assignment: CurriculumAssignmentRecord = {
      id: String(row.id),
      email,
      schoolSlug,
      schoolTitle: lesson ? getBreadcrumbTitle(lesson, "school") || schoolSlug : schoolSlug,
      yearSlug,
      yearTitle: lesson ? getBreadcrumbTitle(lesson, "year") || yearSlug : yearSlug,
      subjectSlug,
      subjectTitle: lesson?.subjectTitle || module?.subjectTitle || "",
      chapterSlug,
      chapterTitle: lesson?.chapterTitle || module?.chapterTitle || "",
      lessonId: row.lesson_id,
      lessonTitle: lesson?.lessonTitle || "Unlinked lesson",
      lessonSlug,
      moduleId: row.module_id,
      moduleTitle: module?.moduleTitle || "Unlinked module",
      assignedAt: row.assigned_at.toISOString(),
      assignedByEmail: row.assigned_by_email ?? "",
      href: lesson ? makeAssignmentHref(lesson, schoolSlug) : "",
    };

    student.assignments.push(assignment);
  }

  const sortedUsers = Array.from(studentsByKey.values()).sort((left, right) => {
    if (right.assignments.length !== left.assignments.length) {
      return right.assignments.length - left.assignments.length;
    }

    return left.name.localeCompare(right.name);
  });

  return {
    users: sortedUsers,
    moduleOptions: createModuleOptions(modules),
  };
}

export async function assignCurriculumModuleToStudent(params: {
  userId?: string | null;
  email?: string | null;
  moduleId: string;
  lessonId: string;
  assignedByUserId: string;
}) {
  const moduleId = params.moduleId.trim();
  const lessonId = params.lessonId.trim();
  if (!moduleId || !lessonId) {
    throw new AuthError(400, "INVALID_ASSIGNMENT", "Choose a module placement.");
  }

  const modules = await listModuleDocuments();
  const module = modules.find((item) => item.moduleId === moduleId);
  const lesson = module?.assignments.find((item) => item.lessonId === lessonId) ?? null;
  if (!module || !lesson) {
    throw new AuthError(404, "ASSIGNMENT_TARGET_NOT_FOUND", "Module placement was not found.");
  }

  const users = await listUsersWithPortals();
  const user = params.userId ? users.find((item) => item.id === params.userId) ?? null : null;
  const email = normalizeEmail(user?.email ?? params.email ?? "");
  if (!isValidEmail(email)) {
    throw new AuthError(400, "INVALID_EMAIL", "Choose a user or enter a valid email.");
  }

  if (user) {
    await setUserPortals(user.id, Array.from(new Set([...user.portals, "student"])));
    await setUserSchoolSlugs(user.id, Array.from(new Set([...user.schoolSlugs, lesson.schoolSlug])));
  }

  const target = await getModuleEditorTarget(lessonId);
  if (target) {
    const currentTags = normalizeAssignmentTags(target.metadata.assignmentTags);
    const tagKey = `${lesson.schoolSlug}:${lesson.yearSlug}`;
    const nextTags = currentTags.some((tag) => `${tag.schoolSlug}:${tag.yearSlug}` === tagKey)
      ? currentTags
      : [...currentTags, { schoolSlug: lesson.schoolSlug, yearSlug: lesson.yearSlug }];

    if (nextTags.length !== currentTags.length) {
      await updateCurriculumNode({
        nodeId: lessonId,
        title: target.title,
        metadata: {
          ...target.metadata,
          assignmentTags: nextTags,
        },
        actorUserId: params.assignedByUserId,
      });
    }
  }

  await recordStudentLessonAssignment({
    email,
    userId: user?.id ?? null,
    schoolSlug: lesson.schoolSlug,
    lessonId,
    moduleId,
    assignedByUserId: params.assignedByUserId,
  });
}

export async function removeCurriculumAssignment(assignmentId: string) {
  await ensureAuthSchema();

  const id = Number.parseInt(assignmentId, 10);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AuthError(400, "INVALID_ASSIGNMENT", "Assignment was not found.");
  }

  const result = await sql<{ id: number }>`
    DELETE FROM auth_student_lesson_assignments
    WHERE id = ${id}
    RETURNING id
  `;

  if (result.rows.length === 0) {
    throw new AuthError(404, "ASSIGNMENT_NOT_FOUND", "Assignment was not found.");
  }
}
