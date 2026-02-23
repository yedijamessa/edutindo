import { NextRequest, NextResponse } from "next/server";
import {
  AuthError,
  getUserFromSessionToken,
  listUsersWithPortals,
} from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/auth-shared";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const requester = await getUserFromSessionToken(token);

    if (!requester) {
      return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
    }

    if (!requester.isAdmin) {
      return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });
    }

    const users = await listUsersWithPortals();

    return NextResponse.json({
      ok: true,
      users: users.map((user) => ({
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
        portals: user.portals,
        createdAt: user.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    }

    console.error("admin users error:", error);
    return NextResponse.json({ ok: false, error: "Failed to load users." }, { status: 500 });
  }
}
