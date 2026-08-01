import { NextRequest, NextResponse } from "next/server";
import {
  AuthError,
  getUserFromSessionToken,
  hasAdminPortalAccess,
} from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/auth-shared";
import {
  assignCurriculumModuleToStudent,
  listCurriculumAssignmentPortalData,
  removeCurriculumAssignment,
} from "@/lib/curriculum-assignment-portal";

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

export async function GET(req: NextRequest) {
  try {
    const access = await requireAdminAccess(req);
    if (access.response || !access.user) return access.response;

    const data = await listCurriculumAssignmentPortalData();
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ ok: false, code: error.code, error: error.message }, { status: error.status });
    }

    console.error("curriculum assignment portal load error:", error);
    return NextResponse.json({ ok: false, error: "Failed to load curriculum assignments." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const access = await requireAdminAccess(req);
    if (access.response || !access.user) return access.response;

    const body = await req.json();
    await assignCurriculumModuleToStudent({
      userId: typeof body?.userId === "string" ? body.userId : null,
      email: typeof body?.email === "string" ? body.email : null,
      moduleId: String(body?.moduleId ?? ""),
      lessonId: String(body?.lessonId ?? ""),
      assignedByUserId: access.user.id,
    });

    const data = await listCurriculumAssignmentPortalData();
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ ok: false, code: error.code, error: error.message }, { status: error.status });
    }

    console.error("curriculum assignment portal assign error:", error);
    return NextResponse.json({ ok: false, error: "Failed to assign curriculum module." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const access = await requireAdminAccess(req);
    if (access.response || !access.user) return access.response;

    const body = await req.json();
    await removeCurriculumAssignment(String(body?.assignmentId ?? ""));

    const data = await listCurriculumAssignmentPortalData();
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ ok: false, code: error.code, error: error.message }, { status: error.status });
    }

    console.error("curriculum assignment portal delete error:", error);
    return NextResponse.json({ ok: false, error: "Failed to remove curriculum assignment." }, { status: 500 });
  }
}
