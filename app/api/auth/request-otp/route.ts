import { NextRequest, NextResponse } from "next/server";
import { AuthError, requestOtpCode } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body?.email || "");
    const mode = body?.mode === "signup" ? "signup" : "login";

    await requestOtpCode({ email, mode });

    return NextResponse.json({
      ok: true,
      message: "One-time passcode sent. Please check your email.",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ ok: false, code: error.code, error: error.message }, { status: error.status });
    }

    console.error("request-otp error:", error);
    return NextResponse.json(
      { ok: false, code: "INTERNAL_ERROR", error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
