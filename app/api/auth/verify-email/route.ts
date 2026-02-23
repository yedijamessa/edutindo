import { NextRequest, NextResponse } from "next/server";
import { AuthError, verifyEmailAddress } from "@/lib/auth";

export const runtime = "nodejs";

function buildLoginRedirect(req: NextRequest, params: Record<string, string>) {
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  return url;
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") || "";

  try {
    await verifyEmailAddress(token);
    return NextResponse.redirect(buildLoginRedirect(req, { verified: "1" }));
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.redirect(
        buildLoginRedirect(req, {
          verified: "0",
          reason: error.code,
        })
      );
    }

    console.error("verify-email GET error:", error);
    return NextResponse.redirect(
      buildLoginRedirect(req, {
        verified: "0",
        reason: "INTERNAL_ERROR",
      })
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = String(body?.token || "");

    await verifyEmailAddress(token);

    return NextResponse.json({ ok: true, message: "Email verified successfully." });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ ok: false, code: error.code, error: error.message }, { status: error.status });
    }

    console.error("verify-email POST error:", error);
    return NextResponse.json(
      { ok: false, code: "INTERNAL_ERROR", error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
