import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { getUserFromSessionToken, hasAdminPortalAccess } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/auth-shared";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const user = await getUserFromSessionToken(token);

    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
    }

    if (!hasAdminPortalAccess(user)) {
      return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });
    }

    const formData = await req.formData();
    const image = formData.get("image");

    if (!(image instanceof File)) {
      return NextResponse.json({ ok: false, error: "Upload one image file." }, { status: 400 });
    }

    const extension = ALLOWED_TYPES.get(image.type);
    if (!extension) {
      return NextResponse.json({ ok: false, error: "Use JPG, PNG, WEBP, or GIF images." }, { status: 400 });
    }

    if (image.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ ok: false, error: "Image must be 5MB or smaller." }, { status: 400 });
    }

    const bytes = Buffer.from(await image.arrayBuffer());
    const uploadDirectory = path.join(process.cwd(), "public", "uploads", "curriculum-covers");
    await mkdir(uploadDirectory, { recursive: true });

    const fileName = `${Date.now()}-${randomUUID()}.${extension}`;
    const filePath = path.join(uploadDirectory, fileName);
    await writeFile(filePath, bytes);

    return NextResponse.json({
      ok: true,
      url: `/uploads/curriculum-covers/${fileName}`,
    });
  } catch (error) {
    console.error("curriculum cover upload error:", error);
    return NextResponse.json({ ok: false, error: "Failed to upload cover image." }, { status: 500 });
  }
}
