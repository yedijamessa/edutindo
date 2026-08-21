import { NextRequest, NextResponse } from "next/server";
import { getUserFromSessionToken, hasAdminPortalAccess } from "@/lib/auth";
import {
  applyCurriculumSubjectVisibilityAction,
  type CurriculumSubjectVisibilityAction,
} from "@/lib/curriculum-subject-visibility";
import { SESSION_COOKIE_NAME } from "@/lib/auth-shared";

export const runtime = "nodejs";

async function getAuthorizedUser(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const user = await getUserFromSessionToken(token);

  if (!user) {
    return { user: null, response: NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 }) };
  }

  if (!hasAdminPortalAccess(user)) {
    return { user: null, response: NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 }) };
  }

  return { user, response: null };
}

export async function POST(req: NextRequest) {
  try {
    const { user, response } = await getAuthorizedUser(req);
    if (!user) return response;

    const body = await req.json();
    const action = String(body?.action || "") as CurriculumSubjectVisibilityAction;
    const schoolSlug = String(body?.schoolSlug || "");
    const subjectId = String(body?.subjectId || "");

    await applyCurriculumSubjectVisibilityAction({
      schoolSlug,
      subjectId,
      action,
      actorUserId: user.id,
    });

    return NextResponse.json({ ok: true, applied: true });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    console.error("subject visibility POST error:", error);
    return NextResponse.json({ ok: false, error: "Failed to update subject visibility." }, { status: 500 });
  }
}
