import { NextRequest, NextResponse } from "next/server";
import { getUserFromSessionToken } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/auth-shared";
import { createChapterResource, listChapterResources } from "@/lib/chapter-resources";

export const runtime = "nodejs";

function canManageChapterResources(user: Awaited<ReturnType<typeof getUserFromSessionToken>>) {
  if (!user) return false;
  if (user.isAdmin) return true;
  return user.portals.some((portal) => portal === "teacher" || portal === "principal" || portal === "admin");
}

export async function GET(req: NextRequest) {
  try {
    const chapterSlug = (req.nextUrl.searchParams.get("chapterSlug") || "").trim();
    const subject = (req.nextUrl.searchParams.get("subject") || "science").trim();
    const yearLevel = req.nextUrl.searchParams.get("yearLevel") || "7";

    if (!chapterSlug) {
      return NextResponse.json({ ok: false, error: "chapterSlug is required." }, { status: 400 });
    }

    const resources = await listChapterResources({ chapterSlug, subject, yearLevel });

    return NextResponse.json({
      ok: true,
      resources: resources.map((resource) => ({
        id: resource.id,
        chapterSlug: resource.chapterSlug,
        subject: resource.subject,
        yearLevel: resource.yearLevel,
        title: resource.title,
        resourceType: resource.resourceType,
        url: resource.url,
        description: resource.description,
        createdByUserId: resource.createdByUserId,
        createdByEmail: resource.createdByEmail,
        createdAt: resource.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("chapter resources GET error:", error);
    return NextResponse.json({ ok: false, error: "Failed to load chapter resources." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const user = await getUserFromSessionToken(token);

    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
    }

    if (!canManageChapterResources(user)) {
      return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });
    }

    const body = await req.json();
    const chapterSlug = String(body?.chapterSlug || "");
    const subject = String(body?.subject || "science");
    const yearLevel = String(body?.yearLevel || "7");
    const title = String(body?.title || "");
    const resourceType = String(body?.resourceType || "other");
    const url = String(body?.url || "");
    const description = String(body?.description || "");

    const created = await createChapterResource({
      chapterSlug,
      subject,
      yearLevel,
      title,
      resourceType,
      url,
      description,
      createdByUserId: user.id,
      createdByEmail: user.email,
    });

    return NextResponse.json({
      ok: true,
      resource: {
        id: created.id,
        chapterSlug: created.chapterSlug,
        subject: created.subject,
        yearLevel: created.yearLevel,
        title: created.title,
        resourceType: created.resourceType,
        url: created.url,
        description: created.description,
        createdByUserId: created.createdByUserId,
        createdByEmail: created.createdByEmail,
        createdAt: created.createdAt.toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    console.error("chapter resources POST error:", error);
    return NextResponse.json({ ok: false, error: "Failed to save chapter resource." }, { status: 500 });
  }
}
