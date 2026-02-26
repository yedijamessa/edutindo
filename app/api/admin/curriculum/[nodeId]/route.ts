import { NextRequest, NextResponse } from "next/server";
import { getUserFromSessionToken, hasAdminPortalAccess } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/auth-shared";
import { deleteCurriculumNode, updateCurriculumNode } from "@/lib/curriculum-portal";

export const runtime = "nodejs";

type Context = {
  params: Promise<{ nodeId: string }>;
};

export async function PATCH(req: NextRequest, context: Context) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const user = await getUserFromSessionToken(token);

    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
    }

    if (!hasAdminPortalAccess(user)) {
      return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });
    }

    const { nodeId } = await context.params;
    const body = await req.json();
    const title = String(body?.title || "");
    const metadata = body?.metadata;

    const updated = await updateCurriculumNode({
      nodeId,
      title,
      metadata,
      actorUserId: user.id,
    });

    return NextResponse.json({
      ok: true,
      node: updated,
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    console.error("curriculum PATCH error:", error);
    return NextResponse.json({ ok: false, error: "Failed to update curriculum node." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: Context) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const user = await getUserFromSessionToken(token);

    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
    }

    if (!hasAdminPortalAccess(user)) {
      return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });
    }

    const { nodeId } = await context.params;
    await deleteCurriculumNode(nodeId);

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    console.error("curriculum DELETE error:", error);
    return NextResponse.json({ ok: false, error: "Failed to delete curriculum node." }, { status: 500 });
  }
}
