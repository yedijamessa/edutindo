import "@/lib/server-only";

import type { AIGuidance } from "@/lib/citacitaku/guidance";
import { localRoadmap } from "@/lib/citacitaku/guidance";
import { isPostgresConfigured, sqlQuery as sql } from "@/lib/postgres-query";

export type RagCareerOption = {
  id: string;
  title: string;
  titleEn: string;
  cluster: string;
  aliases: string[];
  description: string;
};

export type RagCareerMatch = {
  careerId: string;
  title: string;
  titleEn: string;
  cluster: string;
  matchedAlias: string;
  confidence: number;
  requiresConfirmation: boolean;
};

export type EducationRagContext = {
  available: boolean;
  career: null | {
    id: string;
    title: string;
    titleEn: string;
    cluster: string;
    clusterEn: string | null;
    aliases: string[];
    whatTheyDo: string;
    whatTheyDoEn: string | null;
    primaryMajors: string[];
    primaryMajorsEn: string[];
    alternativeMajors: string[];
    alternativeMajorsEn: string[];
    coreSkills: string[];
    coreSkillsEn: string[];
    schoolSubjects: string[];
    schoolSubjectsEn: string[];
    portfolioExample: string | null;
    portfolioExampleEn: string | null;
    regulatedProfession: boolean;
    regulatedKey: string | null;
    regulatedNote: string | null;
    regulatedNoteEn: string | null;
    sourceIds: string[];
    lastChecked: string | null;
  };
  routes: Array<{ name: string; nameEn: string | null; type: string; description: string; descriptionEn: string | null }>;
  gradeAnswer: Record<string, unknown> | null;
  chunks: Array<{
    type: string;
    language: string | null;
    title: string | null;
    text: string;
    sourceIds: string[];
    document: "xlsx" | "pdf";
    page: number | null;
  }>;
  sources: Array<{ id: string; name: string; url: string; lastChecked: string | null }>;
};

type CareerIndexRow = {
  career_id: string;
  title_id: string;
  title_en: string;
  cluster: string;
  aliases_json: unknown;
  what_they_do: string;
};

let careerIndexCache: { expiresAt: number; rows: RagCareerOption[] } | null = null;

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];
}

export function normalizeCareerText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("id-ID")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function levenshtein(left: string, right: string) {
  if (!left) return right.length;
  if (!right) return left.length;
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex];
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      current[rightIndex] = Math.min(
        current[rightIndex - 1] + 1,
        previous[rightIndex] + 1,
        previous[rightIndex - 1] + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1),
      );
    }
    previous.splice(0, previous.length, ...current);
  }
  return previous[right.length];
}

function tokenOverlap(left: string, right: string) {
  const leftTokens = new Set(left.split(" ").filter(Boolean));
  const rightTokens = new Set(right.split(" ").filter(Boolean));
  if (!leftTokens.size || !rightTokens.size) return 0;
  let intersection = 0;
  for (const token of leftTokens) if (rightTokens.has(token)) intersection += 1;
  return intersection / Math.max(leftTokens.size, rightTokens.size);
}

export function careerSimilarity(queryValue: string, candidateValue: string) {
  const query = normalizeCareerText(queryValue);
  const candidate = normalizeCareerText(candidateValue);
  if (!query || !candidate) return 0;
  if (query === candidate) return 1;

  const maxLength = Math.max(query.length, candidate.length);
  const editScore = 1 - levenshtein(query, candidate) / maxLength;
  const overlapScore = tokenOverlap(query, candidate);
  let containmentScore = 0;
  if (query.includes(candidate)) containmentScore = 0.78 + (0.2 * candidate.length) / query.length;
  if (candidate.includes(query)) containmentScore = Math.max(containmentScore, 0.74 + (0.22 * query.length) / candidate.length);
  return Math.min(1, Math.max(editScore, overlapScore * 0.94, containmentScore));
}

async function getCareerIndex() {
  if (careerIndexCache && careerIndexCache.expiresAt > Date.now()) return careerIndexCache.rows;
  if (!isPostgresConfigured()) return [];
  const result = await sql<CareerIndexRow>`
    SELECT career_id, title_id, title_en, cluster, aliases_json, what_they_do
    FROM citacitaku_rag_careers
    ORDER BY title_id
  `;
  const rows = result.rows.map((row) => ({
    id: row.career_id,
    title: row.title_id,
    titleEn: row.title_en,
    cluster: row.cluster,
    aliases: stringArray(row.aliases_json),
    description: row.what_they_do,
  }));
  careerIndexCache = { expiresAt: Date.now() + 60_000, rows };
  return rows;
}

export async function searchRagCareers(query: string, limit = 30) {
  const normalized = normalizeCareerText(query);
  const careers = await getCareerIndex();
  if (!normalized) return careers.slice(0, limit);
  return careers
    .map((career) => {
      const candidates = [career.title, career.titleEn, ...career.aliases];
      const score = Math.max(...candidates.map((candidate) => careerSimilarity(normalized, candidate)));
      return { career, score };
    })
    .filter((item) => item.score >= 0.55)
    .sort((left, right) => right.score - left.score || left.career.title.localeCompare(right.career.title, "id-ID"))
    .slice(0, limit)
    .map((item) => item.career);
}

export async function matchRagCareer(query: string): Promise<RagCareerMatch | null> {
  const normalized = normalizeCareerText(query);
  if (normalized.length < 3) return null;
  const careers = await getCareerIndex();
  const matches: Array<{ career: RagCareerOption; alias: string; score: number }> = [];
  for (const career of careers) {
    let careerBest: { career: RagCareerOption; alias: string; score: number } | null = null;
    for (const alias of [career.title, career.titleEn, ...career.aliases]) {
      const score = careerSimilarity(normalized, alias);
      if (!careerBest || score > careerBest.score) careerBest = { career, alias, score };
    }
    if (careerBest) matches.push(careerBest);
  }
  matches.sort((left, right) => right.score - left.score);
  const best = matches[0] || null;
  const second = matches[1] || null;
  const threshold = normalized.length <= 4 ? 0.74 : 0.64;
  if (!best || best.score < threshold) return null;
  if (best.score < 0.85 && second && best.score - second.score < 0.08) return null;
  const exactCanonical = [best.career.title, best.career.titleEn]
    .some((title) => normalizeCareerText(title) === normalized);
  return {
    careerId: best.career.id,
    title: best.career.title,
    titleEn: best.career.titleEn,
    cluster: best.career.cluster,
    matchedAlias: best.alias,
    confidence: Number(best.score.toFixed(3)),
    requiresConfirmation: !exactCanonical,
  };
}

function sourceIdArray(value: string | null | undefined) {
  return (value || "").split(";").map((item) => item.trim()).filter(Boolean);
}

function gradeRoman(grade: "10" | "11" | "12") {
  return grade === "10" ? "X" : grade === "11" ? "XI" : "XII";
}

export async function getEducationRagContext(
  careerId: string | null,
  grade: "10" | "11" | "12",
): Promise<EducationRagContext> {
  const empty: EducationRagContext = { available: false, career: null, routes: [], gradeAnswer: null, chunks: [], sources: [] };
  if (!careerId || !/^C\d{3}$/i.test(careerId) || !isPostgresConfigured()) return empty;

  try {
    const [profileResult, routesResult, answerResult, chunksResult] = await Promise.all([
      sql<{
        career_id: string; title_id: string; title_en: string; cluster: string; cluster_en: string | null; aliases_json: unknown;
        what_they_do: string; what_they_do_en: string | null;
        primary_majors_json: unknown; primary_majors_en_json: unknown;
        alternative_majors_json: unknown; alternative_majors_en_json: unknown;
        core_skills_json: unknown; core_skills_en_json: unknown;
        school_subjects_json: unknown; school_subjects_en_json: unknown;
        portfolio_example: string | null; portfolio_example_en: string | null;
        regulated_profession: boolean; regulated_key: string | null; regulated_note: string | null;
        regulated_note_en: string | null; source_ids: string | null; last_checked: string | null;
      }>`
        SELECT career_id, title_id, title_en, cluster, cluster_en, aliases_json, what_they_do, what_they_do_en,
          primary_majors_json, primary_majors_en_json, alternative_majors_json, alternative_majors_en_json,
          core_skills_json, core_skills_en_json, school_subjects_json, school_subjects_en_json,
          portfolio_example, portfolio_example_en, regulated_profession, regulated_key,
          regulated_note, regulated_note_en, source_ids, last_checked::text
        FROM citacitaku_rag_careers WHERE career_id = ${careerId.toUpperCase()} LIMIT 1
      `,
      sql<{ route_name: string; route_name_en: string | null; route_type: string; route_description: string; route_description_en: string | null }>`
        SELECT route_name, route_name_en, route_type, route_description, route_description_en
        FROM citacitaku_rag_career_routes
        WHERE career_id = ${careerId.toUpperCase()} ORDER BY route_no
      `,
      sql<{ answer_json: Record<string, unknown> }>`
        SELECT answer_json FROM citacitaku_rag_career_answers
        WHERE career_id = ${careerId.toUpperCase()} AND grade = ${gradeRoman(grade)} LIMIT 1
      `,
      sql<{
        chunk_type: string; language: string | null; title: string | null; chunk_text: string; source_ids: string | null;
        document_id: string; page_number: number | null;
      }>`
        SELECT chunk_type, language, title, chunk_text, source_ids, document_id, page_number
        FROM citacitaku_rag_chunks
        WHERE (career_id = ${careerId.toUpperCase()} AND chunk_type IN ('career_overview', 'career_routes'))
          OR chunk_type IN ('policy', 'education_pathway', 'scholarship_guardrail')
        ORDER BY CASE chunk_type
          WHEN 'career_overview' THEN 1 WHEN 'career_routes' THEN 2 WHEN 'policy' THEN 3
          WHEN 'education_pathway' THEN 4 ELSE 5 END, chunk_id
        LIMIT 36
      `,
    ]);
    const row = profileResult.rows[0];
    if (!row) return empty;

    const pdfResult = await sql<{
      chunk_type: string; language: string | null; title: string | null; chunk_text: string; source_ids: string | null;
      document_id: string; page_number: number | null;
    }>`
      SELECT chunk_type, language, title, chunk_text, source_ids, document_id, page_number
      FROM citacitaku_rag_chunks
      WHERE document_id = 'citacitaku-rag-konselor-2026-pdf'
        AND to_tsvector('simple', COALESCE(title, '') || ' ' || chunk_text) @@ plainto_tsquery('simple', ${row.title_id})
      ORDER BY ts_rank(to_tsvector('simple', COALESCE(title, '') || ' ' || chunk_text), plainto_tsquery('simple', ${row.title_id})) DESC
      LIMIT 2
    `;

    const allChunks = [...chunksResult.rows, ...pdfResult.rows];
    const wantedSourceIds = new Set([
      ...sourceIdArray(row.source_ids),
      ...allChunks.flatMap((chunk) => sourceIdArray(chunk.source_ids)),
    ]);
    const allSources = await sql<{ source_id: string; source_name: string; official_url: string; last_checked: string | null }>`
      SELECT source_id, source_name, official_url, last_checked::text FROM citacitaku_rag_sources ORDER BY source_id
    `;

    return {
      available: true,
      career: {
        id: row.career_id,
        title: row.title_id,
        titleEn: row.title_en,
        cluster: row.cluster,
        clusterEn: row.cluster_en,
        aliases: stringArray(row.aliases_json),
        whatTheyDo: row.what_they_do,
        whatTheyDoEn: row.what_they_do_en,
        primaryMajors: stringArray(row.primary_majors_json),
        primaryMajorsEn: stringArray(row.primary_majors_en_json),
        alternativeMajors: stringArray(row.alternative_majors_json),
        alternativeMajorsEn: stringArray(row.alternative_majors_en_json),
        coreSkills: stringArray(row.core_skills_json),
        coreSkillsEn: stringArray(row.core_skills_en_json),
        schoolSubjects: stringArray(row.school_subjects_json),
        schoolSubjectsEn: stringArray(row.school_subjects_en_json),
        portfolioExample: row.portfolio_example,
        portfolioExampleEn: row.portfolio_example_en,
        regulatedProfession: row.regulated_profession,
        regulatedKey: row.regulated_key,
        regulatedNote: row.regulated_note,
        regulatedNoteEn: row.regulated_note_en,
        sourceIds: sourceIdArray(row.source_ids),
        lastChecked: row.last_checked,
      },
      routes: routesResult.rows.map((route) => ({
        name: route.route_name,
        nameEn: route.route_name_en,
        type: route.route_type,
        description: route.route_description,
        descriptionEn: route.route_description_en,
      })),
      gradeAnswer: answerResult.rows[0]?.answer_json || null,
      chunks: allChunks.map((chunk) => ({
        type: chunk.chunk_type,
        language: chunk.language,
        title: chunk.title,
        text: chunk.chunk_text,
        sourceIds: sourceIdArray(chunk.source_ids),
        document: chunk.document_id === "citacitaku-rag-konselor-2026-pdf" ? "pdf" : "xlsx",
        page: chunk.page_number,
      })),
      sources: allSources.rows.filter((source) => wantedSourceIds.has(source.source_id)).map((source) => ({
        id: source.source_id,
        name: source.source_name,
        url: source.official_url,
        lastChecked: source.last_checked,
      })),
    };
  } catch (error) {
    console.error("[citacitaku:rag]", error instanceof Error ? error.message : error);
    return empty;
  }
}

function weeklyActionsFromAnswer(answer: Record<string, unknown> | null) {
  if (!answer || !Array.isArray(answer.aksi_mingguan)) return [];
  return answer.aksi_mingguan.map((item) => {
    if (typeof item === "string") return item;
    if (!item || typeof item !== "object") return "";
    const record = item as Record<string, unknown>;
    return typeof record.aksi_id === "string" ? record.aksi_id : typeof record.action_en === "string" ? record.action_en : "";
  }).filter(Boolean);
}

export function applyEducationRagFallback(
  guidance: AIGuidance,
  context: EducationRagContext,
  grade: "10" | "11" | "12",
): AIGuidance {
  if (!context.available || !context.career) return guidance;
  const career = context.career;
  const answer = context.gradeAnswer;
  const learning = answer && typeof answer.yang_perlu_dipelajari === "object" && answer.yang_perlu_dipelajari
    ? answer.yang_perlu_dipelajari as Record<string, unknown>
    : null;
  const answerMajors = stringArray(learning?.jurusan_utama).length
    ? stringArray(learning?.jurusan_utama)
    : stringArray(learning?.jurusan_id);
  const majors = answerMajors.length ? answerMajors : career.primaryMajors;
  const weekly = weeklyActionsFromAnswer(answer);
  const portfolio = [
    career.portfolioExample,
    "Catatan riset profesi dari sumber resmi",
    "Wawancara singkat dengan mahasiswa atau praktisi",
    "Dokumentasi kegiatan, kursus, atau kompetisi yang relevan",
    "Refleksi perkembangan skill dalam portfolio digital",
  ].filter((item): item is string => Boolean(item));
  const preparation = [...career.primaryMajors.slice(0, 2), ...career.schoolSubjects.slice(0, 2), "Cek persyaratan resmi"].slice(0, 5);
  while (preparation.length < 3) preparation.push("Bangun pengalaman yang relevan");
  const skillNames = career.coreSkills.length >= 4
    ? career.coreSkills.slice(0, 7)
    : [...career.coreSkills, "Komunikasi", "Riset informasi", "Bahasa Inggris"].slice(0, 5);

  return {
    ...guidance,
    ragGrounded: true,
    ragCareerId: career.id,
    targetTitle: career.title,
    careerDescription: career.whatTheyDo,
    intro: `Panduan awal ini memakai knowledge base Edutindo yang dikurasi untuk Kelas ${grade}.`,
    possibleMajors: majors.length ? majors.slice(0, 6) : guidance.possibleMajors,
    pathways: context.routes.length === 4 ? context.routes.map((route, index) => ({
      icon: ["🎓", "🧭", "🛠️", "🌱"][index],
      title: route.name,
      description: route.description,
      preparation,
    })) : guidance.pathways,
    roadmap: localRoadmap(grade, career.title),
    skills: skillNames.map((name, index) => ({
      name,
      kind: index < Math.ceil(skillNames.length / 2) ? "Hard Skill" : "Soft Skill",
      why: `Mendukung persiapan menuju ${career.title}.`,
      activity: `Latih ${name} lewat satu aktivitas kecil minggu ini dan simpan hasilnya.`,
    })),
    portfolioIdeas: portfolio.slice(0, 6),
    weeklyActions: weekly.length === 3
      ? weekly.map((text, index) => ({ title: ["Perkuat dasar", "Buat bukti karya", "Cari perspektif nyata"][index], text }))
      : guidance.weeklyActions,
  };
}
