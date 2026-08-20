import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const ALLOWED_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
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
      return NextResponse.json({ ok: false, error: "Image must be 3MB or smaller." }, { status: 400 });
    }

    const uploadDirectory = path.join(process.cwd(), "public", "uploads", "profile-photos");
    await mkdir(uploadDirectory, { recursive: true });

    const fileName = `${Date.now()}-${randomUUID()}.${extension}`;
    await writeFile(path.join(uploadDirectory, fileName), Buffer.from(await image.arrayBuffer()));

    return NextResponse.json({
      ok: true,
      url: `/uploads/profile-photos/${fileName}`,
    });
  } catch (error) {
    console.error("profile photo upload error:", error);
    return NextResponse.json({ ok: false, error: "Failed to upload profile photo." }, { status: 500 });
  }
}
