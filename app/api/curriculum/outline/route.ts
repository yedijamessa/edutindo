import { NextResponse } from "next/server";
import { listCurriculumOutline } from "@/lib/curriculum-portal";

export const runtime = "nodejs";

export async function GET() {
  try {
    const years = await listCurriculumOutline();

    return NextResponse.json({
      ok: true,
      years,
    });
  } catch (error) {
    console.error("curriculum outline GET error:", error);
    return NextResponse.json({ ok: false, error: "Failed to load curriculum outline." }, { status: 500 });
  }
}
