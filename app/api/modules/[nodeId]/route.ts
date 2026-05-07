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

  const { nodeId } = await params;

  if (!nodeId || typeof nodeId !== "string" || nodeId.trim().length === 0) {
    return NextResponse.json({ error: "Invalid nodeId" }, { status: 400 });
  }

  try {
    await deleteModuleDocument(nodeId.trim());
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/modules/:nodeId]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
