import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      code: "INVITE_REQUIRED",
      error: "Signups are invitation-only. Please use the invitation link sent by an admin.",
    },
    { status: 403 }
  );
}
