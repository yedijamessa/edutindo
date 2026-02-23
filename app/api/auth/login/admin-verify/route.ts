import { NextRequest, NextResponse } from "next/server";
import { AuthError, applySessionCookie, sanitizeNextPath, verifyAdminLoginOtp } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body?.email || "");
    const code = String(body?.code || "");
    const requestedNextPath = body?.nextPath ? String(body.nextPath) : undefined;

    const { user, sessionToken } = await verifyAdminLoginOtp({ email, code });

    const fallback = "/admin";
    const redirectTo = sanitizeNextPath(requestedNextPath, fallback);

    const response = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        emailVerified: user.emailVerified,
        isAdmin: user.isAdmin,
        portals: user.portals,
      },
      redirectTo,
    });

    applySessionCookie(response, sessionToken);
    return response;
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ ok: false, code: error.code, error: error.message }, { status: error.status });
    }

    console.error("admin verify otp error:", error);
    return NextResponse.json(
      { ok: false, code: "INTERNAL_ERROR", error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
