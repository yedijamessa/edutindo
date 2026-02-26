import { NextRequest, NextResponse } from "next/server";
import { getUserFromSessionToken, hasAdminPortalAccess } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/auth-shared";
import { createCurriculumNode, listCurriculumTree } from "@/lib/curriculum-portal";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const user = await getUserFromSessionToken(token);

    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
    }

    if (!hasAdminPortalAccess(user)) {
      return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });
    }

    const tree = await listCurriculumTree();

    return NextResponse.json({
      ok: true,
      tree,
    });
  } catch (error) {
    console.error("curriculum GET error:", error);
    return NextResponse.json({ ok: false, error: "Failed to load curriculum tree." }, { status: 500 });
  }
}

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
    const nodeType = String(body?.nodeType || "");
    const parentId = body?.parentId == null ? null : String(body.parentId);
    const title = String(body?.title || "");
    const metadata = body?.metadata;

    const created = await createCurriculumNode({
      nodeType,
      parentId,
      title,
      metadata,
      actorUserId: user.id,
    });

    return NextResponse.json({
      ok: true,
      node: created,
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    console.error("curriculum POST error:", error);
    return NextResponse.json({ ok: false, error: "Failed to create curriculum node." }, { status: 500 });
  }
}
