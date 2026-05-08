import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { deleteModuleDocument } from "@/lib/module-editor";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ nodeId: string }> }
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const canAccess =
    user.isAdmin ||
    user.portals.includes("admin") ||
    user.portals.includes("curriculum");

  if (!canAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { nodeId: moduleId } = await params;

  if (!moduleId || typeof moduleId !== "string" || moduleId.trim().length === 0) {
    return NextResponse.json({ error: "Invalid moduleId" }, { status: 400 });
  }

  try {
    await deleteModuleDocument(moduleId.trim());
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/modules/:moduleId]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
