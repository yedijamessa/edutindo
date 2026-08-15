import { NextRequest, NextResponse } from "next/server";
import { getUserFromSessionToken, hasAdminPortalAccess } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/auth-shared";
import {
  getModuleExportFileBaseName,
  getModuleExportPayload,
  type ModuleExportFormat,
} from "@/lib/module-export";
import { getAssignedModuleDocumentForLesson } from "@/lib/module-editor";

export const runtime = "nodejs";

type Context = {
  params: Promise<{
    lessonId: string;
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

function resolveFormat(value: string | null): ModuleExportFormat | null {
  if (value === "pdf" || value === "docx") return value;
  return null;
}

export async function GET(req: NextRequest, context: Context) {
  try {
    const access = await requireAdminAccess(req);
    if (access.response) return access.response;

    const { lessonId } = await context.params;
    const format = resolveFormat(req.nextUrl.searchParams.get("format"));

    if (!format) {
      return NextResponse.json({ ok: false, error: "Format must be pdf or docx." }, { status: 400 });
    }

    const document = await getAssignedModuleDocumentForLesson(lessonId);
    if (!document) {
      return NextResponse.json(
        { ok: false, error: "Module content has not been created or assigned for this lesson yet." },
        { status: 404 }
      );
    }

    const payload = getModuleExportPayload(format, document);
    const fileBaseName = getModuleExportFileBaseName(document);

    return new NextResponse(payload.body, {
      headers: {
        "Content-Type": payload.contentType,
        "Content-Disposition": `attachment; filename="${fileBaseName}.${payload.extension}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("curriculum module export GET error:", error);
    return NextResponse.json({ ok: false, error: "Failed to export module." }, { status: 500 });
  }
}
