import { NextRequest, NextResponse } from "next/server";
import { getUserFromSessionToken, hasAdminPortalAccess } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/auth-shared";
import { getCurriculumLessonContent } from "@/lib/curriculum-lesson-content";
import { getCurriculumLessonContext } from "@/lib/curriculum-portal";
import { buildLessonExportHtml, getLessonExportFileBaseName } from "@/lib/lesson-export";
import { getModuleEditorDocument } from "@/lib/module-editor";

export const runtime = "nodejs";

type Context = {
  params: Promise<{
    schoolSlug: string;
    yearSlug: string;
    subjectSlug: string;
    chapterSlug: string;
    lessonSlug: string;
  }>;
};

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

export async function GET(req: NextRequest, context: Context) {
  try {
    const access = await requireAdminAccess(req);
    if (access.response) return access.response;

    const { schoolSlug, yearSlug, subjectSlug, chapterSlug, lessonSlug } = await context.params;
    const formatParam = req.nextUrl.searchParams.get("format");
    const format = formatParam === "word" ? "word" : formatParam === "pdf" ? "pdf" : null;

    if (!format) {
      return NextResponse.json({ ok: false, error: "Format must be pdf or word." }, { status: 400 });
    }

    const lessonContext = await getCurriculumLessonContext({
      schoolSlug,
      yearSlug,
      subjectSlug,
      chapterSlug,
      lessonSlug,
    });

    if (!lessonContext) {
      return NextResponse.json({ ok: false, error: "Lesson not found." }, { status: 404 });
    }

    const lessonContent = getCurriculumLessonContent(lessonContext.subject.slug, lessonContext.lesson.slug);
    const moduleDocument = await getModuleEditorDocument(lessonContext.lesson.id);
    const html = buildLessonExportHtml({
      context: lessonContext,
      lessonContent,
      moduleDocument,
      format,
    });

    if (format === "word") {
      const fileBaseName = getLessonExportFileBaseName(lessonContext);

      return new NextResponse(`\ufeff${html}`, {
        headers: {
          "Content-Type": "application/msword; charset=utf-8",
          "Content-Disposition": `attachment; filename="${fileBaseName}.doc"`,
          "Cache-Control": "no-store",
        },
      });
    }

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("lesson export GET error:", error);
    return NextResponse.json({ ok: false, error: "Failed to export lesson." }, { status: 500 });
  }
}
