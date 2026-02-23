import { NextRequest, NextResponse } from "next/server";
import { AuthError, startLoginFlow } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body?.email || "");

    const result = await startLoginFlow(email);

    return NextResponse.json({
      ok: true,
      method: result.method,
      message: "message" in result ? result.message : undefined,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ ok: false, code: error.code, error: error.message }, { status: error.status });
    }

    console.error("login start error:", error);
    return NextResponse.json(
      { ok: false, code: "INTERNAL_ERROR", error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
