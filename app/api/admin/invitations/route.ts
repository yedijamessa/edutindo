import { NextRequest, NextResponse } from "next/server";
import {
  AuthError,
  createAccountInvite,
  getUserFromSessionToken,
  hasAdminAccessControlAccess,
  hasAdminPortalAccess,
} from "@/lib/auth";
import { listCurriculumSchools } from "@/lib/curriculum-portal";
import { PORTAL_OPTIONS, SESSION_COOKIE_NAME } from "@/lib/auth-shared";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const email = String(body?.email || "");
    const firstName = String(body?.firstName || "");
    const lastName = String(body?.lastName || "");
    const rawPortals = Array.isArray(body?.portals) ? body.portals.map((item: unknown) => String(item)) : [];
    const validPortals = rawPortals.filter((portal: string): portal is (typeof PORTAL_OPTIONS)[number] =>
      PORTAL_OPTIONS.includes(portal as (typeof PORTAL_OPTIONS)[number])
    );
    const requestedSchoolSlug = typeof body?.schoolSlug === "string" ? body.schoolSlug.trim().toLowerCase() : "";
    const nextSchoolSlug = requestedSchoolSlug || null;

    if (nextSchoolSlug) {
      const schools = await listCurriculumSchools();
      const isValidSchool = schools.some((school) => school.slug === nextSchoolSlug);

      if (!isValidSchool) {
        return NextResponse.json({ ok: false, error: "Invalid school selection." }, { status: 400 });
      }
    }

    await createAccountInvite({
      email,
      firstName,
      lastName,
      portals: validPortals,
      schoolSlug: nextSchoolSlug,
      invitedByUserId: requester.id,
      invitedByName: requester.firstName || requester.email,
    });

    return NextResponse.json({ ok: true, message: `Invitation sent to ${email.trim().toLowerCase()}.` });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ ok: false, code: error.code, error: error.message }, { status: error.status });
    }

    console.error("admin invitation error:", error);
    return NextResponse.json({ ok: false, error: "Failed to send invitation." }, { status: 500 });
  }
}
