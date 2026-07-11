import { NextRequest, NextResponse } from "next/server";
import {
  acceptAccountInvite,
  applySessionCookie,
  AuthError,
  sanitizeNextPath,
} from "@/lib/auth";
import { resolveAuthenticatedHomePath } from "@/lib/auth-shared";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const token = String(body?.token || "");
    const firstName = String(body?.firstName || "");
    const lastName = String(body?.lastName || "");
    const password = String(body?.password || "");
    const session = await acceptAccountInvite({ token, firstName, lastName, password });
    const fallbackPath = resolveAuthenticatedHomePath(session.user);
    const redirectTo =
      typeof body?.nextPath === "string" && body.nextPath.trim()
        ? sanitizeNextPath(body.nextPath, fallbackPath)
        : fallbackPath;

    const response = NextResponse.json({
      ok: true,
      message: "Account created successfully.",
      redirectTo,
    });

    applySessionCookie(response, session.sessionToken);
    return response;
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ ok: false, code: error.code, error: error.message }, { status: error.status });
    }

    console.error("invite accept error:", error);
    return NextResponse.json(
      { ok: false, code: "INTERNAL_ERROR", error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
