import { NextRequest, NextResponse } from "next/server";
import { saveCitacitakuEvent } from "@/lib/citacitaku/submissions";

export const runtime = "nodejs";

type FeedbackCategory = "feature" | "career" | "bug" | "other";

type FeedbackRequest = {
  category?: unknown;
  message?: unknown;
  contact?: unknown;
  context?: unknown;
};

type FeedbackRecord = {
  id: string;
  category: FeedbackCategory;
  message: string;
  contact: string | null;
  context: {
    dream?: string;
    grade?: "10" | "11" | "12";
    page?: string;
  };
  status: "new";
  createdAt: string;
};

const requests = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;
const categories = new Set<FeedbackCategory>(["feature", "career", "bug", "other"]);

function isRateLimited(request: NextRequest): boolean {
  const now = Date.now();
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const key = forwarded || request.headers.get("x-real-ip") || "local";
  const current = requests.get(key);
  if (!current || current.resetAt <= now) {
    requests.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  current.count += 1;
  return current.count > MAX_REQUESTS;
}

function cleanText(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function cleanContext(value: unknown): FeedbackRecord["context"] {
  if (!value || typeof value !== "object") return {};
  const context = value as Record<string, unknown>;
  const grade = context.grade === "10" || context.grade === "11" || context.grade === "12" ? context.grade : undefined;
  return {
    dream: cleanText(context.dream, 100) || undefined,
    grade,
    page: cleanText(context.page, 40) || undefined,
  };
}

async function saveFeedback(record: FeedbackRecord) {
  await saveCitacitakuEvent({
    eventType: "feedback",
    input: {
      category: record.category,
      message: record.message,
      contact: record.contact,
      context: record.context,
    },
    output: { ok: true, id: record.id, status: record.status },
    metadata: { page: record.context.page ?? null },
    status: "completed",
  });
}

export async function POST(request: NextRequest) {
  if (isRateLimited(request)) {
    return NextResponse.json({ error: "Terlalu banyak masukan dalam waktu singkat. Coba lagi sebentar." }, { status: 429 });
  }

  let body: FeedbackRequest;
  try {
    body = await request.json() as FeedbackRequest;
  } catch {
    return NextResponse.json({ error: "Format masukan tidak valid." }, { status: 400 });
  }

  const category = categories.has(body.category as FeedbackCategory) ? body.category as FeedbackCategory : "feature";
  const message = cleanText(body.message, 1000);
  const contact = cleanText(body.contact, 120);

  if (message.length < 5) {
    return NextResponse.json({ error: "Masukan terlalu pendek." }, { status: 400 });
  }

  const record: FeedbackRecord = {
    id: crypto.randomUUID(),
    category,
    message,
    contact: contact || null,
    context: cleanContext(body.context),
    status: "new",
    createdAt: new Date().toISOString(),
  };

  try {
    await saveFeedback(record);
  } catch (error) {
    console.error("[feedback]", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Masukan belum bisa disimpan." }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
