import { NextRequest, NextResponse } from "next/server";
import {
  AuthError,
  createAccountInvite,
  getUserFromSessionToken,
  grantStudentAccessForExistingUser,
  hasAdminPortalAccess,
  recordStudentLessonAssignment,
  sendLessonAssignmentEmail,
} from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/auth-shared";
import {
  CURRICULUM_YEAR_OPTIONS,
  DEFAULT_CURRICULUM_SCHOOL_SLUG,
  type CurriculumAssignmentTag,
  updateCurriculumNode,
} from "@/lib/curriculum-portal";
import { assignModuleToLesson, getModuleEditorDocument, getModuleEditorTarget } from "@/lib/module-editor";
import type { ModuleEditorBreadcrumb } from "@/types/module-editor";

export const runtime = "nodejs";

async function requireAdminAccess(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const user = await getUserFromSessionToken(token);

  if (!user) {
    return { user: null, response: NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 }) };
  }

  if (!hasAdminPortalAccess(user)) {
    return { user, response: NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 }) };
  }

  return { user, response: null };
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

function getBreadcrumbSlug(breadcrumbs: ModuleEditorBreadcrumb[], nodeType: ModuleEditorBreadcrumb["nodeType"]) {
  return breadcrumbs.find((item) => item.nodeType === nodeType)?.slug ?? "";
}

function parseRecipientEmails(value: unknown) {
  const rawItems = Array.isArray(value) ? value : String(value || "").split(/[\s,;]+/);
  const emails = rawItems
    .map((item) => String(item || "").trim().toLowerCase())
    .filter(Boolean);

  return Array.from(new Set(emails));
}

function resolveAssignmentScope(target: NonNullable<Awaited<ReturnType<typeof getModuleEditorTarget>>>) {
  const metadataTags = normalizeAssignmentTags(target.metadata.assignmentTags);
  const firstTag = metadataTags[0] ?? null;
  const breadcrumbSchoolSlug = getBreadcrumbSlug(target.breadcrumbs, "school");
  const breadcrumbYearSlug = getBreadcrumbSlug(target.breadcrumbs, "year");
  const fallbackYearSlug = CURRICULUM_YEAR_OPTIONS[0]?.slug ?? "year-7";

  return {
    schoolSlug: firstTag?.schoolSlug || breadcrumbSchoolSlug || DEFAULT_CURRICULUM_SCHOOL_SLUG,
    yearSlug: firstTag?.yearSlug || breadcrumbYearSlug || fallbackYearSlug,
    existingTags: metadataTags,
  };
}

export async function POST(req: NextRequest) {
  try {
    const access = await requireAdminAccess(req);
    if (access.response || !access.user) return access.response;

    const body = await req.json();
    const emails = parseRecipientEmails(body?.emails ?? body?.email);
    const moduleId = String(body?.moduleId || "").trim();
    const lessonId = String(body?.lessonId || "").trim();

    if (emails.length === 0) {
      return NextResponse.json({ ok: false, error: "Enter at least one student email." }, { status: 400 });
    }

    const [moduleDocument, target] = await Promise.all([
      getModuleEditorDocument(moduleId),
      getModuleEditorTarget(lessonId),
    ]);

    if (!moduleDocument) {
      return NextResponse.json({ ok: false, error: "Module was not found." }, { status: 404 });
    }

    if (!target || target.nodeType !== "lesson") {
      return NextResponse.json({ ok: false, error: "Lesson was not found." }, { status: 404 });
    }

    const subjectSlug = getBreadcrumbSlug(target.breadcrumbs, "subject");
    const chapterSlug = getBreadcrumbSlug(target.breadcrumbs, "chapter");
    if (!subjectSlug || !chapterSlug || !target.slug) {
      return NextResponse.json({ ok: false, error: "Lesson path is incomplete." }, { status: 400 });
    }

    const scope = resolveAssignmentScope(target);
    const recipients = [];

    for (const email of emails) {
      const existingStudent = await grantStudentAccessForExistingUser({
        email,
        schoolSlug: scope.schoolSlug,
      });

      recipients.push(
        existingStudent
          ? { type: "existing" as const, email: existingStudent.email, user: existingStudent }
          : { type: "invite" as const, email, user: null }
      );
    }

    const tagKey = `${scope.schoolSlug}:${scope.yearSlug}`;
    const nextTags = scope.existingTags.some((tag) => `${tag.schoolSlug}:${tag.yearSlug}` === tagKey)
      ? scope.existingTags
      : [...scope.existingTags, { schoolSlug: scope.schoolSlug, yearSlug: scope.yearSlug }];
    const lessonPath = `/student/materials/curriculum/${scope.schoolSlug}/${scope.yearSlug}/${subjectSlug}/${chapterSlug}/${target.slug}`;

    await assignModuleToLesson({
      moduleId,
      lessonId,
      actorUserId: access.user.id,
    });

    await updateCurriculumNode({
      nodeId: lessonId,
      title: target.title,
      metadata: {
        ...(isRecord(target.metadata) ? target.metadata : {}),
        assignmentTags: nextTags,
      },
      actorUserId: access.user.id,
    });

    const assignedByName = access.user.firstName || access.user.email;
    const sent: string[] = [];
    const invited: string[] = [];

    for (const recipient of recipients) {
      if (recipient.type === "existing") {
        await sendLessonAssignmentEmail({
          email: recipient.user.email,
          firstName: recipient.user.firstName,
          moduleTitle: moduleDocument.title,
          lessonTitle: target.title,
          lessonPath,
          assignedByName,
        });

        await recordStudentLessonAssignment({
          email: recipient.user.email,
          userId: recipient.user.id,
          schoolSlug: scope.schoolSlug,
          lessonId,
          moduleId,
          assignedByUserId: access.user.id,
        });

        sent.push(recipient.user.email);
        continue;
      }

      await createAccountInvite({
        email: recipient.email,
        portals: ["student"],
        schoolSlug: scope.schoolSlug,
        invitedByUserId: access.user.id,
        invitedByName: assignedByName,
        nextPath: lessonPath,
        assignment: {
          moduleTitle: moduleDocument.title,
          lessonTitle: target.title,
        },
      });

      await recordStudentLessonAssignment({
        email: recipient.email,
        schoolSlug: scope.schoolSlug,
        lessonId,
        moduleId,
        assignedByUserId: access.user.id,
      });

      invited.push(recipient.email);
    }

    const messageParts = [
      sent.length > 0 ? `sent to ${sent.length} student${sent.length === 1 ? "" : "s"}` : "",
      invited.length > 0 ? `invited ${invited.length} new student${invited.length === 1 ? "" : "s"}` : "",
    ].filter(Boolean);

    return NextResponse.json({
      ok: true,
      message: `Lesson assignment ${messageParts.join(" and ")}.`,
      lessonPath,
      status: invited.length > 0 ? "invited" : "sent",
      sent,
      invited,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ ok: false, code: error.code, error: error.message }, { status: error.status });
    }

    if (error instanceof Error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    console.error("module assignment email error:", error);
    return NextResponse.json({ ok: false, error: "Failed to send lesson assignment." }, { status: 500 });
  }
}
