import { NextRequest, NextResponse } from "next/server";
import { AuthError, signupWithPassword } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const email = String(body?.email || "");
    const firstName = String(body?.firstName || "");
    const lastName = String(body?.lastName || "");
    const password = String(body?.password || "");

    const result = await signupWithPassword({ email, firstName, lastName, password });

    return NextResponse.json({
      ok: true,
      status: result.status,
      message: result.message,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ ok: false, code: error.code, error: error.message }, { status: error.status });
    }

    console.error("signup error:", error);
    return NextResponse.json(
      { ok: false, code: "INTERNAL_ERROR", error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
