import { NextRequest, NextResponse } from "next/server";
import { getUserFromSessionToken } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/auth-shared";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const user = await getUserFromSessionToken(token);

    if (!user) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
        portals: user.portals,
      },
    });
  } catch (error) {
    console.error("me error:", error);
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}
