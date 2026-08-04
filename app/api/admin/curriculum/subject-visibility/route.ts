import { NextRequest, NextResponse } from "next/server";
import { getUserFromSessionToken, hasAdminPortalAccess } from "@/lib/auth";
import {
  decideCurriculumSubjectVisibilityRequest,
  requestOrApplyCurriculumSubjectVisibilityAction,
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

    const result = await requestOrApplyCurriculumSubjectVisibilityAction({
      schoolSlug,
      subjectId,
      action,
      actorUserId: user.id,
      actorEmail: user.email,
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    console.error("subject visibility POST error:", error);
    return NextResponse.json({ ok: false, error: "Failed to update subject visibility." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { user, response } = await getAuthorizedUser(req);
    if (!user) return response;

    const body = await req.json();
    const requestId = String(body?.requestId || "");
    const decision = String(body?.decision || "");

    if (decision !== "approved" && decision !== "rejected") {
      return NextResponse.json({ ok: false, error: "Invalid approval decision." }, { status: 400 });
    }

    const request = await decideCurriculumSubjectVisibilityRequest({
      requestId,
      decision,
      actorUserId: user.id,
      actorEmail: user.email,
    });

    return NextResponse.json({ ok: true, request });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    console.error("subject visibility PATCH error:", error);
    return NextResponse.json({ ok: false, error: "Failed to decide approval request." }, { status: 500 });
  }
}
