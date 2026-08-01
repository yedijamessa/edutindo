import { NextRequest, NextResponse } from "next/server";
import { getUserFromSessionToken, hasAdminPortalAccess } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/auth-shared";
import {
  buildModuleDocx,
  buildModuleOdt,
  buildModulePdf,
  getModuleExportFileBaseName,
  type ModuleExportFormat,
} from "@/lib/module-export";
import { getModuleEditorDocument } from "@/lib/module-editor";

export const runtime = "nodejs";

type Context = {
  params: Promise<{
    moduleId: string;
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
  if (value === "pdf" || value === "docx" || value === "odt") return value;
  return null;
}

function getExportPayload(format: ModuleExportFormat, document: NonNullable<Awaited<ReturnType<typeof getModuleEditorDocument>>>) {
  if (format === "pdf") {
    return {
      body: buildModulePdf(document),
      extension: "pdf",
      contentType: "application/pdf",
    };
  }

  if (format === "docx") {
    return {
      body: buildModuleDocx(document),
      extension: "docx",
      contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    };
  }

  return {
    body: buildModuleOdt(document),
    extension: "odt",
    contentType: "application/vnd.oasis.opendocument.text",
  };
}

export async function GET(req: NextRequest, context: Context) {
  try {
    const access = await requireAdminAccess(req);
    if (access.response) return access.response;

    const { moduleId } = await context.params;
    const format = resolveFormat(req.nextUrl.searchParams.get("format"));

    if (!format) {
      return NextResponse.json({ ok: false, error: "Format must be pdf, docx, or odt." }, { status: 400 });
    }

    const document = await getModuleEditorDocument(moduleId);
    if (!document) {
      return NextResponse.json({ ok: false, error: "Module not found." }, { status: 404 });
    }

    const payload = getExportPayload(format, document);
    const fileBaseName = getModuleExportFileBaseName(document);

    return new NextResponse(payload.body, {
      headers: {
        "Content-Type": payload.contentType,
        "Content-Disposition": `attachment; filename="${fileBaseName}.${payload.extension}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("module export GET error:", error);
    return NextResponse.json({ ok: false, error: "Failed to export module." }, { status: 500 });
  }
}
