import { NextRequest, NextResponse } from "next/server";
import { applyDemoAccessCookie, AuthError, sanitizeNextPath, verifyDemoPortalCode } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const code = String(body?.code || "");
    const requestedNextPath = body?.nextPath ? String(body.nextPath) : undefined;

    verifyDemoPortalCode(code);

    const redirectTo = sanitizeNextPath(requestedNextPath, "/student");
    const response = NextResponse.json({
      ok: true,
      redirectTo,
      message: "Demo access granted.",
    });

    applyDemoAccessCookie(response);
    return response;
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ ok: false, code: error.code, error: error.message }, { status: error.status });
    }

    console.error("demo access error:", error);
    return NextResponse.json(
      { ok: false, code: "INTERNAL_ERROR", error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
