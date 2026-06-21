import { NextRequest, NextResponse } from "next/server";
import { getUserFromSessionToken, hasAdminPortalAccess } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/auth-shared";
import { getModuleEditorDocument, saveModuleEditorDocument } from "@/lib/module-editor";

export const runtime = "nodejs";

type Context = {
  params: Promise<{ nodeId: string }>;
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

    const { nodeId: moduleId } = await context.params;
    const document = await getModuleEditorDocument(moduleId);

    if (!document) {
      return NextResponse.json({ ok: false, error: "Module was not found." }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      document,
    });
  } catch (error) {
    console.error("module editor GET error:", error);
    return NextResponse.json({ ok: false, error: "Failed to load module." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: Context) {
  try {
    const access = await requireAdminAccess(req);
    if (access.response || !access.user) return access.response;

    const { nodeId: moduleId } = await context.params;
    const body = await req.json();

    const document = await saveModuleEditorDocument({
      moduleId,
      title: body?.title,
      pages: body?.pages,
      subjectSlug: body?.subjectSlug,
      subjectTitle: body?.subjectTitle,
      chapterSlug: body?.chapterSlug,
      chapterTitle: body?.chapterTitle,
      actorUserId: access.user.id,
    });

    return NextResponse.json({
      ok: true,
      document,
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    console.error("module editor PUT error:", error);
    return NextResponse.json({ ok: false, error: "Failed to save module." }, { status: 500 });
  }
}
