import { NextRequest, NextResponse } from "next/server";
import { AuthError, changeUserPassword, getCurrentUser, updateUserProfile } from "@/lib/auth";

export const runtime = "nodejs";

function authErrorResponse(error: unknown, fallback: string) {
  if (error instanceof AuthError) {
    return NextResponse.json({ ok: false, error: error.message, code: error.code }, { status: error.status });
  }

  console.error(fallback, error);
  return NextResponse.json({ ok: false, error: fallback }, { status: 500 });
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json();
    const updatedUser = await updateUserProfile({
      userId: user.id,
      fullName: String(body?.fullName ?? ""),
      email: String(body?.email ?? ""),
      mobilePhone: body?.mobilePhone,
      profilePhotoUrl: body?.profilePhotoUrl,
    });

    return NextResponse.json({ ok: true, user: updatedUser });
  } catch (error) {
    return authErrorResponse(error, "Failed to update profile.");
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json();
    await changeUserPassword({
      userId: user.id,
      currentPassword: String(body?.currentPassword ?? ""),
      newPassword: String(body?.newPassword ?? ""),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return authErrorResponse(error, "Failed to change password.");
  }
}
