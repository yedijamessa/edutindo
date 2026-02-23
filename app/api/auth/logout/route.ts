import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie, revokeSessionByToken } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/auth-shared";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    await revokeSessionByToken(token);

    const response = NextResponse.json({ ok: true });
    clearSessionCookie(response);
    return response;
  } catch (error) {
    console.error("logout error:", error);
    return NextResponse.json(
      { ok: false, error: "Something went wrong while logging out." },
      { status: 500 }
    );
  }
}
