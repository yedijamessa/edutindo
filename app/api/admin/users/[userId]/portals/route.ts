import { NextRequest, NextResponse } from "next/server";
import {
  AuthError,
  getUserFromSessionToken,
  hasAdminAccessControlAccess,
  hasAdminPortalAccess,
  setUserPortals,
  setUserSchoolSlugs,
} from "@/lib/auth";
import { listCurriculumSchools } from "@/lib/curriculum-portal";
import { PORTAL_OPTIONS, SESSION_COOKIE_NAME } from "@/lib/auth-shared";

export const runtime = "nodejs";

type Context = {
  params: Promise<{ userId: string }>;
};

export async function POST(req: NextRequest, context: Context) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const requester = await getUserFromSessionToken(token);

    if (!requester) {
      return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
    }

    if (!hasAdminPortalAccess(requester)) {
      return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });
    }

    if (!hasAdminAccessControlAccess(requester)) {
      return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });
    }

    const { userId } = await context.params;
    const body = await req.json();
    const rawPortals = Array.isArray(body?.portals) ? body.portals.map((item: unknown) => String(item)) : [];
    const validPortals = rawPortals.filter((portal: string): portal is (typeof PORTAL_OPTIONS)[number] =>
      PORTAL_OPTIONS.includes(portal as (typeof PORTAL_OPTIONS)[number])
    );
    const requestedSchoolSlugs: string[] = Array.isArray(body?.schoolSlugs)
      ? body.schoolSlugs
          .map((item: unknown) => String(item).trim().toLowerCase())
          .filter((schoolSlug: string) => schoolSlug.length > 0)
      : typeof body?.schoolSlug === "string" && body.schoolSlug.trim()
        ? [body.schoolSlug.trim().toLowerCase()]
        : [];
    const nextSchoolSlugs = Array.from(new Set(requestedSchoolSlugs));

    if (nextSchoolSlugs.length > 0) {
      const schools = await listCurriculumSchools();
      const validSchoolSlugs = new Set(schools.map((school) => school.slug));
      const hasInvalidSchool = nextSchoolSlugs.some((schoolSlug) => !validSchoolSlugs.has(schoolSlug));

      if (hasInvalidSchool) {
        return NextResponse.json({ ok: false, error: "Invalid school selection." }, { status: 400 });
      }
    }

    await setUserPortals(userId, validPortals);
    await setUserSchoolSlugs(userId, nextSchoolSlugs);

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    }

    console.error("update user portals error:", error);
    return NextResponse.json({ ok: false, error: "Failed to update portals." }, { status: 500 });
  }
}
