import { NextResponse } from "next/server";
import {
  DEFAULT_CURRICULUM_SCHOOL_SLUG,
  listCurriculumSchools,
} from "@/lib/curriculum-portal";

export const runtime = "nodejs";

export async function GET() {
  try {
    const schools = await listCurriculumSchools();
    const years =
      schools.find((school) => school.slug === DEFAULT_CURRICULUM_SCHOOL_SLUG)?.years ??
      schools[0]?.years ??
      [];

    return NextResponse.json({
      ok: true,
      schools,
      defaultSchoolSlug: DEFAULT_CURRICULUM_SCHOOL_SLUG,
      years,
    });
  } catch (error) {
    console.error("curriculum outline GET error:", error);
    return NextResponse.json({ ok: false, error: "Failed to load curriculum outline." }, { status: 500 });
  }
}
