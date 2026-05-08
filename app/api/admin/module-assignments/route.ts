import { NextRequest, NextResponse } from "next/server";
import { getUserFromSessionToken, hasAdminPortalAccess } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/auth-shared";
import { assignModuleToLesson, unassignModuleFromLesson } from "@/lib/module-editor";

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
    await assignModuleToLesson({
      moduleId: body?.moduleId,
      lessonId: body?.lessonId,
      actorUserId: access.user.id,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    console.error("module assignment POST error:", error);
    return NextResponse.json({ ok: false, error: "Failed to assign module." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const access = await requireAdminAccess(req);
    if (access.response) return access.response;

    const lessonId = req.nextUrl.searchParams.get("lessonId") ?? "";
    await unassignModuleFromLesson(lessonId);

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    console.error("module assignment DELETE error:", error);
    return NextResponse.json({ ok: false, error: "Failed to unassign module." }, { status: 500 });
  }
}
