import { NextRequest, NextResponse } from "next/server";
import { getUserFromSessionToken, hasAdminPortalAccess } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/auth-shared";
import { reorderCurriculumSiblings } from "@/lib/curriculum-portal";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const user = await getUserFromSessionToken(token);

    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
    }

    if (!hasAdminPortalAccess(user)) {
      return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });
    }

    const body = await req.json();
    const parentId = body?.parentId == null ? null : String(body.parentId);
    const nodeType = body?.nodeType == null ? null : String(body.nodeType);
    const orderedNodeIds = Array.isArray(body?.orderedNodeIds)
      ? body.orderedNodeIds.map((value: unknown) => String(value))
      : [];

    await reorderCurriculumSiblings({
      parentId,
      nodeType,
      orderedNodeIds,
      actorUserId: user.id,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    console.error("curriculum reorder error:", error);
    return NextResponse.json({ ok: false, error: "Failed to reorder curriculum." }, { status: 500 });
  }
}
