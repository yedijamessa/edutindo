import { NextRequest, NextResponse } from "next/server";
import { getUserFromSessionToken, hasAdminPortalAccess } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/auth-shared";
import { saveModuleEditorDocument } from "@/lib/module-editor";

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

export async function POST(req: NextRequest) {
  try {
    const access = await requireAdminAccess(req);
    if (access.response || !access.user) return access.response;

    const body = await req.json();
    const document = await saveModuleEditorDocument({
      title: body?.title,
      pages: body?.pages,
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

    console.error("module editor POST error:", error);
    return NextResponse.json({ ok: false, error: "Failed to save module." }, { status: 500 });
  }
}
