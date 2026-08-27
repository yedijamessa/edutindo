import { NextRequest, NextResponse } from "next/server";
import { careers } from "@/lib/citacitaku/careers";
import {
  careerSimilarity,
  matchRagCareer,
  normalizeCareerText,
  searchRagCareers,
  type RagCareerMatch,
  type RagCareerOption,
} from "@/lib/citacitaku/rag";

export const runtime = "nodejs";

function localOptions(): RagCareerOption[] {
  return careers.map((career) => ({
    id: career.id,
    title: career.title,
    titleEn: career.title,
    cluster: "Pilihan awal",
    aliases: career.keywords,
    description: career.description,
  }));
}

function localSearch(query: string) {
  const normalized = normalizeCareerText(query);
  const options = localOptions();
  if (!normalized) return options;
  return options
    .map((career) => ({ career, score: Math.max(...[career.title, career.titleEn, ...career.aliases].map((value) => careerSimilarity(normalized, value))) }))
    .filter((item) => item.score >= 0.55)
    .sort((left, right) => right.score - left.score)
    .map((item) => item.career);
}

function localMatch(query: string): RagCareerMatch | null {
  const normalized = normalizeCareerText(query);
  if (normalized.length < 3) return null;
  let best: { career: RagCareerOption; alias: string; score: number } | null = null;
  for (const career of localOptions()) {
    for (const alias of [career.title, career.titleEn, ...career.aliases]) {
      const score = careerSimilarity(normalized, alias);
      if (!best || score > best.score) best = { career, alias, score };
    }
  }
  const threshold = normalized.length <= 4 ? 0.74 : 0.64;
  if (!best || best.score < threshold) return null;
  return {
    careerId: best.career.id,
    title: best.career.title,
    titleEn: best.career.titleEn,
    cluster: best.career.cluster,
    matchedAlias: best.alias,
    confidence: Number(best.score.toFixed(3)),
    requiresConfirmation: ![best.career.title, best.career.titleEn]
      .some((title) => normalizeCareerText(title) === normalized),
  };
}

export async function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get("q") || "").trim().slice(0, 100);
  const mode = request.nextUrl.searchParams.get("mode") === "match" ? "match" : "search";
  try {
    if (mode === "match") {
      const match = await matchRagCareer(query);
      return NextResponse.json({ match: match || localMatch(query), source: match ? "rag" : "local" });
    }
    const databaseCareers = await searchRagCareers(query, query ? 40 : 150);
    return NextResponse.json({ careers: databaseCareers.length ? databaseCareers : localSearch(query).slice(0, 40), source: databaseCareers.length ? "rag" : "local" });
  } catch (error) {
    console.error("[citacitaku:careers]", error instanceof Error ? error.message : error);
    if (mode === "match") return NextResponse.json({ match: localMatch(query), source: "local" });
    return NextResponse.json({ careers: localSearch(query).slice(0, 40), source: "local" });
  }
}

export async function POST(request: NextRequest) {
  let body: { query?: unknown };
  try {
    body = await request.json() as { query?: unknown };
  } catch {
    return NextResponse.json({ error: "Format permintaan tidak valid." }, { status: 400 });
  }
  const query = typeof body.query === "string" ? body.query.trim().slice(0, 100) : "";
  if (!query) return NextResponse.json({ match: null, source: "none" });
  try {
    const match = await matchRagCareer(query);
    return NextResponse.json({ match: match || localMatch(query), source: match ? "rag" : "local" });
  } catch (error) {
    console.error("[citacitaku:careers:match]", error instanceof Error ? error.message : error);
    return NextResponse.json({ match: localMatch(query), source: "local" });
  }
}
