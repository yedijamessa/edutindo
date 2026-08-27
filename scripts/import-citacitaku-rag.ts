import { sql } from "@vercel/postgres";
import crypto from "crypto";
import dotenv from "dotenv";
import { readFile } from "node:fs/promises";
import path from "path";
import { PDFParse } from "pdf-parse";
import readExcelFile from "read-excel-file/node";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

type CellValue = string | number | boolean | Date | null;
type SheetData = { sheet: string; data: CellValue[][] };
type RowRecord = Record<string, CellValue | undefined>;

const DEFAULT_WORKBOOK = "/Users/yedijamessa/Downloads/RAG_Konselor_Pendidikan_SMA_Indonesia_2026_v2_Bilingual.xlsx";
const DEFAULT_PDF = "/Users/yedijamessa/Downloads/RAG_Knowledge_Base_Konselor_SMA_Indonesia_2026_v2_Bilingual.pdf";
const XLSX_DOCUMENT_ID = "citacitaku-rag-konselor-2026-xlsx";
const PDF_DOCUMENT_ID = "citacitaku-rag-konselor-2026-pdf";
const ENGLISH_ALIAS_OVERRIDES: Record<string, string[]> = {
  C031: ["doctor", "medical doctor"],
};

function cleanText(value: CellValue | undefined, maxLength = 100_000) {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const result = String(value).trim().replace(/\s+/g, " ");
  return result ? result.slice(0, maxLength) : null;
}

function splitList(value: CellValue | undefined) {
  return (cleanText(value) || "").split(";").map((item) => item.trim()).filter(Boolean);
}

function uniqueStrings(values: Array<string | null>) {
  const seen = new Set<string>();
  return values.filter((value): value is string => {
    if (!value) return false;
    const key = value.toLocaleLowerCase("id-ID");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function dateText(value: CellValue | undefined) {
  const result = cleanText(value, 40);
  if (!result) return null;
  const iso = result.match(/\d{4}-\d{2}-\d{2}/)?.[0];
  if (iso) return iso;
  const parsed = new Date(result);
  return Number.isNaN(parsed.valueOf()) ? null : parsed.toISOString().slice(0, 10);
}

function parseJson(value: CellValue | undefined, fallback: unknown = {}) {
  const source = cleanText(value);
  if (!source) return fallback;
  try {
    return JSON.parse(source);
  } catch {
    return fallback;
  }
}

function toInteger(value: CellValue | undefined) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : 0;
}

function rowObject(headers: CellValue[], row: CellValue[]) {
  const result: RowRecord = {};
  headers.forEach((header, index) => {
    const key = cleanText(header, 120);
    if (key) result[key] = row[index];
  });
  return result;
}

function sheetRecords(sheets: SheetData[], sheetName: string) {
  const sheet = sheets.find((candidate) => candidate.sheet === sheetName);
  if (!sheet) throw new Error(`Sheet ${sheetName} tidak ditemukan.`);
  const headerIndex = sheet.data.findIndex((row) => row.some((cell) => cleanText(cell) === expectedFirstHeader(sheetName)));
  if (headerIndex < 0) throw new Error(`Header sheet ${sheetName} tidak ditemukan.`);
  const headers = sheet.data[headerIndex];
  return sheet.data.slice(headerIndex + 1).map((row) => rowObject(headers, row));
}

function expectedFirstHeader(sheetName: string) {
  const headers: Record<string, string> = {
    Career_Profiles: "career_id",
    Aliases: "alias_normalized",
    Career_Routes: "career_id",
    Full_Answers_JSON: "career_id",
    RAG_Chunks: "chunk_id",
    Coverage_Added: "career_id",
    Regulated_Professions: "career_id",
    Policy_Rules: "policy_id",
    Education_Pathways: "education_id",
    Scholarship_Guardrails: "rule_id",
    Sources: "source_id",
  };
  return headers[sheetName] || "";
}

function optionalSheetRecords(sheets: SheetData[], sheetName: string) {
  return sheets.some((sheet) => sheet.sheet === sheetName) ? sheetRecords(sheets, sheetName) : [];
}

function hash(buffer: Uint8Array) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

async function ensureSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS citacitaku_rag_documents (
      id TEXT PRIMARY KEY, file_name TEXT NOT NULL, source_type TEXT NOT NULL,
      content_hash TEXT NOT NULL, page_count INTEGER, metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS citacitaku_rag_careers (
      career_id TEXT PRIMARY KEY, title_id TEXT NOT NULL, title_en TEXT NOT NULL, cluster TEXT NOT NULL,
      cluster_en TEXT, coverage_status TEXT, aliases_json JSONB NOT NULL DEFAULT '[]'::jsonb,
      what_they_do TEXT NOT NULL, what_they_do_en TEXT,
      primary_majors_json JSONB NOT NULL DEFAULT '[]'::jsonb, primary_majors_en_json JSONB NOT NULL DEFAULT '[]'::jsonb,
      alternative_majors_json JSONB NOT NULL DEFAULT '[]'::jsonb, alternative_majors_en_json JSONB NOT NULL DEFAULT '[]'::jsonb,
      core_skills_json JSONB NOT NULL DEFAULT '[]'::jsonb, core_skills_en_json JSONB NOT NULL DEFAULT '[]'::jsonb,
      school_subjects_json JSONB NOT NULL DEFAULT '[]'::jsonb, school_subjects_en_json JSONB NOT NULL DEFAULT '[]'::jsonb,
      portfolio_example TEXT, portfolio_example_en TEXT, entry_route_type TEXT,
      regulated_profession BOOLEAN NOT NULL DEFAULT FALSE, regulated_key TEXT, regulated_note TEXT, regulated_note_en TEXT,
      source_ids TEXT, last_checked DATE, searchable_text TEXT NOT NULL DEFAULT '',
      imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    ALTER TABLE citacitaku_rag_careers
      ADD COLUMN IF NOT EXISTS cluster_en TEXT,
      ADD COLUMN IF NOT EXISTS coverage_status TEXT,
      ADD COLUMN IF NOT EXISTS what_they_do_en TEXT,
      ADD COLUMN IF NOT EXISTS primary_majors_en_json JSONB NOT NULL DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS alternative_majors_en_json JSONB NOT NULL DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS core_skills_en_json JSONB NOT NULL DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS school_subjects_en_json JSONB NOT NULL DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS portfolio_example_en TEXT,
      ADD COLUMN IF NOT EXISTS entry_route_type TEXT,
      ADD COLUMN IF NOT EXISTS regulated_key TEXT,
      ADD COLUMN IF NOT EXISTS regulated_note_en TEXT
  `;
  await sql`UPDATE citacitaku_rag_careers SET title_en = title_id WHERE title_en IS NULL OR BTRIM(title_en) = ''`;
  await sql`ALTER TABLE citacitaku_rag_careers ALTER COLUMN title_en SET NOT NULL`;
  await sql`CREATE INDEX IF NOT EXISTS citacitaku_rag_careers_title_idx ON citacitaku_rag_careers (title_id)`;
  await sql`CREATE INDEX IF NOT EXISTS citacitaku_rag_careers_cluster_idx ON citacitaku_rag_careers (cluster)`;
  await sql`
    CREATE TABLE IF NOT EXISTS citacitaku_rag_career_aliases (
      alias_normalized TEXT PRIMARY KEY, career_id TEXT NOT NULL REFERENCES citacitaku_rag_careers(career_id) ON DELETE CASCADE,
      canonical_title TEXT NOT NULL, canonical_title_en TEXT, cluster TEXT NOT NULL, cluster_en TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    ALTER TABLE citacitaku_rag_career_aliases
      ADD COLUMN IF NOT EXISTS canonical_title_en TEXT,
      ADD COLUMN IF NOT EXISTS cluster_en TEXT
  `;
  await sql`CREATE INDEX IF NOT EXISTS citacitaku_rag_career_aliases_career_idx ON citacitaku_rag_career_aliases (career_id)`;
  await sql`
    CREATE TABLE IF NOT EXISTS citacitaku_rag_career_routes (
      career_id TEXT NOT NULL REFERENCES citacitaku_rag_careers(career_id) ON DELETE CASCADE,
      route_no INTEGER NOT NULL, route_name TEXT NOT NULL, route_name_en TEXT, route_type TEXT NOT NULL,
      route_description TEXT NOT NULL, route_description_en TEXT, career_title TEXT NOT NULL, career_title_en TEXT,
      cluster TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), PRIMARY KEY (career_id, route_no)
    )
  `;
  await sql`
    ALTER TABLE citacitaku_rag_career_routes
      ADD COLUMN IF NOT EXISTS route_name_en TEXT,
      ADD COLUMN IF NOT EXISTS route_description_en TEXT,
      ADD COLUMN IF NOT EXISTS career_title_en TEXT
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS citacitaku_rag_career_answers (
      career_id TEXT NOT NULL REFERENCES citacitaku_rag_careers(career_id) ON DELETE CASCADE,
      grade TEXT NOT NULL, career_title TEXT NOT NULL, career_title_en TEXT, answer_json JSONB NOT NULL,
      route_count INTEGER NOT NULL, weekly_action_count INTEGER NOT NULL, source_ids TEXT,
      last_checked DATE, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), PRIMARY KEY (career_id, grade)
    )
  `;
  await sql`ALTER TABLE citacitaku_rag_career_answers ADD COLUMN IF NOT EXISTS career_title_en TEXT`;
  await sql`
    CREATE TABLE IF NOT EXISTS citacitaku_rag_chunks (
      chunk_id TEXT PRIMARY KEY, document_id TEXT NOT NULL REFERENCES citacitaku_rag_documents(id) ON DELETE CASCADE,
      chunk_type TEXT NOT NULL, language TEXT, career_id TEXT, grade TEXT, cluster TEXT, title TEXT,
      chunk_text TEXT NOT NULL, metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb, source_ids TEXT,
      page_number INTEGER, last_checked DATE, imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE citacitaku_rag_chunks ADD COLUMN IF NOT EXISTS language TEXT`;
  await sql`CREATE INDEX IF NOT EXISTS citacitaku_rag_chunks_career_grade_idx ON citacitaku_rag_chunks (career_id, grade, chunk_type)`;
  await sql`CREATE INDEX IF NOT EXISTS citacitaku_rag_chunks_document_idx ON citacitaku_rag_chunks (document_id, page_number)`;
  await sql`CREATE INDEX IF NOT EXISTS citacitaku_rag_chunks_search_idx ON citacitaku_rag_chunks USING GIN (to_tsvector('simple', COALESCE(title, '') || ' ' || chunk_text))`;
  await sql`
    CREATE TABLE IF NOT EXISTS citacitaku_rag_sources (
      source_id TEXT PRIMARY KEY, source_name TEXT NOT NULL, official_url TEXT NOT NULL,
      how_used TEXT, freshness_class TEXT, last_checked DATE, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE citacitaku_rag_sources ADD COLUMN IF NOT EXISTS freshness_class TEXT`;
  await sql`
    CREATE TABLE IF NOT EXISTS citacitaku_rag_coverage_added (
      career_id TEXT PRIMARY KEY, title_id TEXT NOT NULL, title_en TEXT NOT NULL,
      cluster_id TEXT NOT NULL, cluster_en TEXT NOT NULL, source_ids TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS citacitaku_rag_regulated_professions (
      career_id TEXT PRIMARY KEY, title_id TEXT NOT NULL, title_en TEXT NOT NULL,
      regulated_key TEXT NOT NULL, regulated_note_id TEXT NOT NULL, regulated_note_en TEXT NOT NULL,
      source_ids TEXT, last_checked DATE, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

async function upsertDocument(document: Record<string, unknown>) {
  await sql`
    INSERT INTO citacitaku_rag_documents (id, file_name, source_type, content_hash, page_count, metadata_json, updated_at)
    VALUES (${String(document.id)}, ${String(document.fileName)}, ${String(document.sourceType)}, ${String(document.contentHash)},
      ${typeof document.pageCount === "number" ? document.pageCount : null}, ${JSON.stringify(document.metadata || {})}::jsonb, NOW())
    ON CONFLICT (id) DO UPDATE SET file_name = EXCLUDED.file_name, source_type = EXCLUDED.source_type,
      content_hash = EXCLUDED.content_hash, page_count = EXCLUDED.page_count, metadata_json = EXCLUDED.metadata_json, updated_at = NOW()
  `;
}

async function inBatches<T>(rows: T[], action: (rows: T[]) => Promise<unknown>, size = 100) {
  for (let index = 0; index < rows.length; index += size) await action(rows.slice(index, index + size));
}

async function importWorkbook(sheets: SheetData[], workbookHash: string, workbookPath: string) {
  await upsertDocument({
    id: XLSX_DOCUMENT_ID,
    fileName: path.basename(workbookPath),
    sourceType: "xlsx",
    contentHash: workbookHash,
    metadata: { sheets: sheets.map((sheet) => ({ name: sheet.sheet, rows: sheet.data.length })) },
  });

  const careers = sheetRecords(sheets, "Career_Profiles").map((row) => {
    const careerId = cleanText(row.career_id, 40);
    const titleId = cleanText(row.title_id, 200);
    const titleEn = cleanText(row.title_en, 200) || titleId;
    const aliases = uniqueStrings([
      ...splitList(row.aliases),
      ...(careerId ? ENGLISH_ALIAS_OVERRIDES[careerId] || [] : []),
    ]);
    return {
      career_id: careerId,
      title_id: titleId,
      title_en: titleEn,
      cluster: cleanText(row.cluster_id || row.cluster, 160),
      cluster_en: cleanText(row.cluster_en, 160) || cleanText(row.cluster_id || row.cluster, 160),
      coverage_status: cleanText(row.coverage_status, 80),
      aliases_json: aliases,
      what_they_do: cleanText(row.what_they_do_id || row.what_they_do),
      what_they_do_en: cleanText(row.what_they_do_en) || cleanText(row.what_they_do_id || row.what_they_do),
      primary_majors_json: splitList(row.primary_majors_id || row.primary_majors),
      primary_majors_en_json: splitList(row.primary_majors_en || row.primary_majors_id || row.primary_majors),
      alternative_majors_json: splitList(row.alternative_majors_id || row.alternative_majors),
      alternative_majors_en_json: splitList(row.alternative_majors_en || row.alternative_majors_id || row.alternative_majors),
      core_skills_json: splitList(row.core_skills_id || row.core_skills),
      core_skills_en_json: splitList(row.core_skills_en || row.core_skills_id || row.core_skills),
      school_subjects_json: splitList(row.school_subjects_id || row.relevant_school_subjects),
      school_subjects_en_json: splitList(row.school_subjects_en || row.school_subjects_id || row.relevant_school_subjects),
      portfolio_example: cleanText(row.portfolio_example_id || row.portfolio_example),
      portfolio_example_en: cleanText(row.portfolio_example_en) || cleanText(row.portfolio_example_id || row.portfolio_example),
      entry_route_type: cleanText(row.entry_route_type, 120),
      regulated_profession: cleanText(row.regulated_profession)?.toUpperCase().startsWith("YA") || false,
      regulated_key: cleanText(row.regulated_key, 100),
      regulated_note: cleanText(row.regulated_note_id || row.regulated_note),
      regulated_note_en: cleanText(row.regulated_note_en) || cleanText(row.regulated_note_id || row.regulated_note),
      source_ids: cleanText(row.source_ids),
      last_checked: dateText(row.last_checked),
      searchable_text: [
        titleId, titleEn, row.cluster_id || row.cluster, row.cluster_en, aliases.join(" "),
        row.what_they_do_id || row.what_they_do, row.what_they_do_en,
        row.primary_majors_id || row.primary_majors, row.primary_majors_en,
        row.alternative_majors_id || row.alternative_majors, row.alternative_majors_en,
      ]
        .map((item) => cleanText(item)).filter(Boolean).join(" "),
    };
  }).filter((row) => row.career_id && row.title_id && row.title_en && row.cluster && row.what_they_do);

  await inBatches(careers, async (batch) => sql`
    INSERT INTO citacitaku_rag_careers (
      career_id, title_id, title_en, cluster, cluster_en, coverage_status, aliases_json,
      what_they_do, what_they_do_en, primary_majors_json, primary_majors_en_json,
      alternative_majors_json, alternative_majors_en_json, core_skills_json, core_skills_en_json,
      school_subjects_json, school_subjects_en_json, portfolio_example, portfolio_example_en,
      entry_route_type, regulated_profession, regulated_key, regulated_note, regulated_note_en,
      source_ids, last_checked, searchable_text, updated_at
    ) SELECT x.career_id, x.title_id, x.title_en, x.cluster, x.cluster_en, x.coverage_status,
      x.aliases_json, x.what_they_do, x.what_they_do_en, x.primary_majors_json, x.primary_majors_en_json,
      x.alternative_majors_json, x.alternative_majors_en_json, x.core_skills_json, x.core_skills_en_json,
      x.school_subjects_json, x.school_subjects_en_json, x.portfolio_example, x.portfolio_example_en,
      x.entry_route_type, x.regulated_profession, x.regulated_key, x.regulated_note, x.regulated_note_en,
      x.source_ids, x.last_checked, x.searchable_text, NOW()
    FROM jsonb_to_recordset(${JSON.stringify(batch)}::jsonb) AS x(
      career_id TEXT, title_id TEXT, title_en TEXT, cluster TEXT, cluster_en TEXT, coverage_status TEXT,
      aliases_json JSONB, what_they_do TEXT, what_they_do_en TEXT,
      primary_majors_json JSONB, primary_majors_en_json JSONB,
      alternative_majors_json JSONB, alternative_majors_en_json JSONB,
      core_skills_json JSONB, core_skills_en_json JSONB,
      school_subjects_json JSONB, school_subjects_en_json JSONB,
      portfolio_example TEXT, portfolio_example_en TEXT, entry_route_type TEXT,
      regulated_profession BOOLEAN, regulated_key TEXT, regulated_note TEXT, regulated_note_en TEXT,
      source_ids TEXT, last_checked DATE, searchable_text TEXT
    ) ON CONFLICT (career_id) DO UPDATE SET title_id = EXCLUDED.title_id, title_en = EXCLUDED.title_en,
      cluster = EXCLUDED.cluster, cluster_en = EXCLUDED.cluster_en, coverage_status = EXCLUDED.coverage_status,
      aliases_json = EXCLUDED.aliases_json, what_they_do = EXCLUDED.what_they_do, what_they_do_en = EXCLUDED.what_they_do_en,
      primary_majors_json = EXCLUDED.primary_majors_json, primary_majors_en_json = EXCLUDED.primary_majors_en_json,
      alternative_majors_json = EXCLUDED.alternative_majors_json, alternative_majors_en_json = EXCLUDED.alternative_majors_en_json,
      core_skills_json = EXCLUDED.core_skills_json, core_skills_en_json = EXCLUDED.core_skills_en_json,
      school_subjects_json = EXCLUDED.school_subjects_json, school_subjects_en_json = EXCLUDED.school_subjects_en_json,
      portfolio_example = EXCLUDED.portfolio_example, portfolio_example_en = EXCLUDED.portfolio_example_en,
      entry_route_type = EXCLUDED.entry_route_type, regulated_profession = EXCLUDED.regulated_profession,
      regulated_key = EXCLUDED.regulated_key, regulated_note = EXCLUDED.regulated_note,
      regulated_note_en = EXCLUDED.regulated_note_en, source_ids = EXCLUDED.source_ids, last_checked = EXCLUDED.last_checked,
      searchable_text = EXCLUDED.searchable_text, updated_at = NOW()
  `);

  const aliasMap = new Map<string, {
    alias_normalized: string;
    career_id: string | null;
    canonical_title: string | null;
    canonical_title_en: string | null;
    cluster: string | null;
    cluster_en: string | null;
  }>();
  for (const row of sheetRecords(sheets, "Aliases")) {
    const alias = cleanText(row.alias_normalized, 200)?.toLocaleLowerCase("id-ID");
    if (!alias) continue;
    aliasMap.set(alias, {
      alias_normalized: alias,
      career_id: cleanText(row.career_id, 40),
      canonical_title: cleanText(row.canonical_title_id || row.canonical_title, 200),
      canonical_title_en: cleanText(row.canonical_title_en, 200) || cleanText(row.canonical_title_id || row.canonical_title, 200),
      cluster: cleanText(row.cluster_id || row.cluster, 160),
      cluster_en: cleanText(row.cluster_en, 160) || cleanText(row.cluster_id || row.cluster, 160),
    });
  }
  for (const career of careers) {
    for (const value of [career.title_id, career.title_en, ...career.aliases_json]) {
      const alias = value?.toLocaleLowerCase("id-ID");
      if (!alias || aliasMap.has(alias)) continue;
      aliasMap.set(alias, {
        alias_normalized: alias,
        career_id: career.career_id,
        canonical_title: career.title_id,
        canonical_title_en: career.title_en,
        cluster: career.cluster,
        cluster_en: career.cluster_en,
      });
    }
  }
  const aliases = [...aliasMap.values()].filter((row) => row.career_id && row.canonical_title && row.cluster);
  await inBatches(aliases, async (batch) => sql`
    INSERT INTO citacitaku_rag_career_aliases (
      alias_normalized, career_id, canonical_title, canonical_title_en, cluster, cluster_en, updated_at
    ) SELECT x.alias_normalized, x.career_id, x.canonical_title, x.canonical_title_en, x.cluster, x.cluster_en, NOW()
    FROM jsonb_to_recordset(${JSON.stringify(batch)}::jsonb) AS x(
      alias_normalized TEXT, career_id TEXT, canonical_title TEXT, canonical_title_en TEXT, cluster TEXT, cluster_en TEXT
    )
    ON CONFLICT (alias_normalized) DO UPDATE SET career_id = EXCLUDED.career_id,
      canonical_title = EXCLUDED.canonical_title, canonical_title_en = EXCLUDED.canonical_title_en,
      cluster = EXCLUDED.cluster, cluster_en = EXCLUDED.cluster_en, updated_at = NOW()
  `);

  const careerById = new Map(careers.map((career) => [career.career_id, career]));
  const routes = sheetRecords(sheets, "Career_Routes").map((row) => {
    const careerId = cleanText(row.career_id, 40);
    const career = careerById.get(careerId);
    return {
      career_id: careerId,
      route_no: toInteger(row.route_no),
      route_name: cleanText(row.route_name_id || row.route_name, 200),
      route_name_en: cleanText(row.route_name_en, 200) || cleanText(row.route_name_id || row.route_name, 200),
      route_type: cleanText(row.route_type, 80),
      route_description: cleanText(row.route_description_id || row.route_description),
      route_description_en: cleanText(row.route_description_en) || cleanText(row.route_description_id || row.route_description),
      career_title: cleanText(row.title_id || row.career_title, 200) || career?.title_id || null,
      career_title_en: cleanText(row.title_en, 200) || career?.title_en || null,
      cluster: cleanText(row.cluster, 160) || career?.cluster || null,
    };
  }).filter((row) => row.career_id && row.route_no && row.route_name && row.route_type && row.route_description && row.career_title && row.cluster);
  await inBatches(routes, async (batch) => sql`
    INSERT INTO citacitaku_rag_career_routes (
      career_id, route_no, route_name, route_name_en, route_type, route_description,
      route_description_en, career_title, career_title_en, cluster, updated_at
    ) SELECT x.career_id, x.route_no, x.route_name, x.route_name_en, x.route_type, x.route_description,
      x.route_description_en, x.career_title, x.career_title_en, x.cluster, NOW()
    FROM jsonb_to_recordset(${JSON.stringify(batch)}::jsonb) AS x(
      career_id TEXT, route_no INTEGER, route_name TEXT, route_name_en TEXT, route_type TEXT,
      route_description TEXT, route_description_en TEXT, career_title TEXT, career_title_en TEXT, cluster TEXT
    ) ON CONFLICT (career_id, route_no) DO UPDATE SET route_name = EXCLUDED.route_name,
      route_name_en = EXCLUDED.route_name_en, route_type = EXCLUDED.route_type,
      route_description = EXCLUDED.route_description, route_description_en = EXCLUDED.route_description_en,
      career_title = EXCLUDED.career_title, career_title_en = EXCLUDED.career_title_en,
      cluster = EXCLUDED.cluster, updated_at = NOW()
  `);

  const answers = sheetRecords(sheets, "Full_Answers_JSON").map((row) => ({
    career_id: cleanText(row.career_id, 40),
    career_title: cleanText(row.title_id || row.career_title, 200),
    career_title_en: cleanText(row.title_en, 200) || cleanText(row.title_id || row.career_title, 200),
    grade: cleanText(row.grade, 8),
    answer_json: parseJson(row.full_answer_json_bilingual || row.full_answer_json),
    route_count: toInteger(row.route_count), weekly_action_count: toInteger(row.weekly_action_count),
    source_ids: cleanText(row.source_ids), last_checked: dateText(row.last_checked),
  })).filter((row) => row.career_id && row.career_title && row.grade);
  await inBatches(answers, async (batch) => sql`
    INSERT INTO citacitaku_rag_career_answers (
      career_id, career_title, career_title_en, grade, answer_json, route_count,
      weekly_action_count, source_ids, last_checked, updated_at
    ) SELECT x.career_id, x.career_title, x.career_title_en, x.grade, x.answer_json,
      x.route_count, x.weekly_action_count, x.source_ids, x.last_checked, NOW()
    FROM jsonb_to_recordset(${JSON.stringify(batch)}::jsonb) AS x(
      career_id TEXT, career_title TEXT, career_title_en TEXT, grade TEXT, answer_json JSONB,
      route_count INTEGER, weekly_action_count INTEGER, source_ids TEXT, last_checked DATE
    ) ON CONFLICT (career_id, grade) DO UPDATE SET career_title = EXCLUDED.career_title,
      career_title_en = EXCLUDED.career_title_en, answer_json = EXCLUDED.answer_json,
      route_count = EXCLUDED.route_count, weekly_action_count = EXCLUDED.weekly_action_count,
      source_ids = EXCLUDED.source_ids, last_checked = EXCLUDED.last_checked, updated_at = NOW()
  `);

  const ragChunks = sheetRecords(sheets, "RAG_Chunks").map((row) => ({
    chunk_id: cleanText(row.chunk_id, 200), document_id: XLSX_DOCUMENT_ID, chunk_type: cleanText(row.chunk_type, 80),
    language: cleanText(row.language, 12) || "id",
    career_id: cleanText(row.career_id, 40), grade: cleanText(row.grade, 8), cluster: cleanText(row.cluster, 160),
    title: cleanText(row.title, 300), chunk_text: cleanText(row.chunk_text), metadata_json: parseJson(row.metadata_json),
    source_ids: cleanText(row.source_ids), page_number: null, last_checked: dateText(row.last_checked),
  })).filter((row) => row.chunk_id && row.chunk_type && row.chunk_text);
  const policyChunks = optionalSheetRecords(sheets, "Policy_Rules").flatMap((row) => [
    {
      chunk_id: `v2-${cleanText(row.policy_id, 80)}-id`, document_id: XLSX_DOCUMENT_ID, chunk_type: "policy", language: "id",
      career_id: null, grade: null, cluster: cleanText(row.category, 160), title: cleanText(row.policy_id, 80),
      chunk_text: cleanText(row.rule_id || row.rule_text), metadata_json: { scope: cleanText(row.scope) },
      source_ids: null, page_number: null, last_checked: "2026-08-27",
    },
    {
      chunk_id: `v2-${cleanText(row.policy_id, 80)}-en`, document_id: XLSX_DOCUMENT_ID, chunk_type: "policy", language: "en",
      career_id: null, grade: null, cluster: cleanText(row.category, 160), title: cleanText(row.policy_id, 80),
      chunk_text: cleanText(row.rule_en) || cleanText(row.rule_id || row.rule_text), metadata_json: { scope: cleanText(row.scope) },
      source_ids: null, page_number: null, last_checked: "2026-08-27",
    },
  ]).filter((row) => row.chunk_id && row.chunk_text);
  const educationChunks = optionalSheetRecords(sheets, "Education_Pathways").flatMap((row) => [
    {
      chunk_id: `v2-${cleanText(row.education_id, 80)}-id`, document_id: XLSX_DOCUMENT_ID, chunk_type: "education_pathway", language: "id",
      career_id: null, grade: null, cluster: "Jalur pendidikan", title: cleanText(row.pathway, 300),
      chunk_text: cleanText(row.description_id || row.description), metadata_json: { officialUrl: cleanText(row.official_url) },
      source_ids: cleanText(row.source_ids), page_number: null, last_checked: "2026-08-27",
    },
    {
      chunk_id: `v2-${cleanText(row.education_id, 80)}-en`, document_id: XLSX_DOCUMENT_ID, chunk_type: "education_pathway", language: "en",
      career_id: null, grade: null, cluster: "Education pathway", title: cleanText(row.pathway, 300),
      chunk_text: cleanText(row.description_en) || cleanText(row.description_id || row.description), metadata_json: { officialUrl: cleanText(row.official_url) },
      source_ids: cleanText(row.source_ids), page_number: null, last_checked: "2026-08-27",
    },
  ]).filter((row) => row.chunk_id && row.chunk_text);
  const scholarshipChunks = optionalSheetRecords(sheets, "Scholarship_Guardrails").flatMap((row) => [
    {
      chunk_id: `v2-${cleanText(row.rule_id, 80)}-id`, document_id: XLSX_DOCUMENT_ID, chunk_type: "scholarship_guardrail", language: "id",
      career_id: null, grade: null, cluster: "Beasiswa", title: cleanText(row.title, 300),
      chunk_text: cleanText(row.rule_id_text || row.rule), metadata_json: {}, source_ids: null,
      page_number: null, last_checked: "2026-08-27",
    },
    {
      chunk_id: `v2-${cleanText(row.rule_id, 80)}-en`, document_id: XLSX_DOCUMENT_ID, chunk_type: "scholarship_guardrail", language: "en",
      career_id: null, grade: null, cluster: "Scholarship", title: cleanText(row.title, 300),
      chunk_text: cleanText(row.rule_en_text) || cleanText(row.rule_id_text || row.rule), metadata_json: {}, source_ids: null,
      page_number: null, last_checked: "2026-08-27",
    },
  ]).filter((row) => row.chunk_id && row.chunk_text);
  const chunks = [...ragChunks, ...policyChunks, ...educationChunks, ...scholarshipChunks];
  await sql`DELETE FROM citacitaku_rag_chunks WHERE document_id = ${XLSX_DOCUMENT_ID}`;
  await upsertChunks(chunks);

  const sources = sheetRecords(sheets, "Sources").map((row) => ({
    source_id: cleanText(row.source_id, 100), source_name: cleanText(row.source_name, 300),
    official_url: cleanText(row.official_url, 2000), how_used: cleanText(row.how_used),
    freshness_class: cleanText(row.freshness_class, 300), last_checked: dateText(row.last_checked),
  })).filter((row) => row.source_id && row.source_name && row.official_url);
  await inBatches(sources, async (batch) => sql`
    INSERT INTO citacitaku_rag_sources (source_id, source_name, official_url, how_used, freshness_class, last_checked, updated_at)
    SELECT x.source_id, x.source_name, x.official_url, x.how_used, x.freshness_class, x.last_checked, NOW()
    FROM jsonb_to_recordset(${JSON.stringify(batch)}::jsonb) AS x(
      source_id TEXT, source_name TEXT, official_url TEXT, how_used TEXT, freshness_class TEXT, last_checked DATE
    )
    ON CONFLICT (source_id) DO UPDATE SET source_name = EXCLUDED.source_name, official_url = EXCLUDED.official_url,
      how_used = EXCLUDED.how_used, freshness_class = EXCLUDED.freshness_class,
      last_checked = EXCLUDED.last_checked, updated_at = NOW()
  `);

  const coverageAdded = optionalSheetRecords(sheets, "Coverage_Added").map((row) => ({
    career_id: cleanText(row.career_id, 40), title_id: cleanText(row.title_id, 200), title_en: cleanText(row.title_en, 200),
    cluster_id: cleanText(row.cluster_id, 160), cluster_en: cleanText(row.cluster_en, 160), source_ids: cleanText(row.source_ids),
  })).filter((row) => row.career_id && row.title_id && row.title_en && row.cluster_id && row.cluster_en);
  await sql`DELETE FROM citacitaku_rag_coverage_added`;
  await inBatches(coverageAdded, async (batch) => sql`
    INSERT INTO citacitaku_rag_coverage_added (career_id, title_id, title_en, cluster_id, cluster_en, source_ids, updated_at)
    SELECT x.career_id, x.title_id, x.title_en, x.cluster_id, x.cluster_en, x.source_ids, NOW()
    FROM jsonb_to_recordset(${JSON.stringify(batch)}::jsonb) AS x(
      career_id TEXT, title_id TEXT, title_en TEXT, cluster_id TEXT, cluster_en TEXT, source_ids TEXT
    ) ON CONFLICT (career_id) DO UPDATE SET title_id = EXCLUDED.title_id, title_en = EXCLUDED.title_en,
      cluster_id = EXCLUDED.cluster_id, cluster_en = EXCLUDED.cluster_en, source_ids = EXCLUDED.source_ids, updated_at = NOW()
  `);

  const regulatedProfessions = optionalSheetRecords(sheets, "Regulated_Professions").map((row) => ({
    career_id: cleanText(row.career_id, 40), title_id: cleanText(row.title_id, 200), title_en: cleanText(row.title_en, 200),
    regulated_key: cleanText(row.regulated_key, 100), regulated_note_id: cleanText(row.regulated_note_id),
    regulated_note_en: cleanText(row.regulated_note_en), source_ids: cleanText(row.source_ids), last_checked: dateText(row.last_checked),
  })).filter((row) => row.career_id && row.title_id && row.title_en && row.regulated_key && row.regulated_note_id && row.regulated_note_en);
  await sql`DELETE FROM citacitaku_rag_regulated_professions`;
  await inBatches(regulatedProfessions, async (batch) => sql`
    INSERT INTO citacitaku_rag_regulated_professions (
      career_id, title_id, title_en, regulated_key, regulated_note_id, regulated_note_en, source_ids, last_checked, updated_at
    ) SELECT x.career_id, x.title_id, x.title_en, x.regulated_key, x.regulated_note_id,
      x.regulated_note_en, x.source_ids, x.last_checked, NOW()
    FROM jsonb_to_recordset(${JSON.stringify(batch)}::jsonb) AS x(
      career_id TEXT, title_id TEXT, title_en TEXT, regulated_key TEXT, regulated_note_id TEXT,
      regulated_note_en TEXT, source_ids TEXT, last_checked DATE
    ) ON CONFLICT (career_id) DO UPDATE SET title_id = EXCLUDED.title_id, title_en = EXCLUDED.title_en,
      regulated_key = EXCLUDED.regulated_key, regulated_note_id = EXCLUDED.regulated_note_id,
      regulated_note_en = EXCLUDED.regulated_note_en, source_ids = EXCLUDED.source_ids,
      last_checked = EXCLUDED.last_checked, updated_at = NOW()
  `);

  return {
    careers: careers.length, aliases: aliases.length, routes: routes.length, answers: answers.length,
    chunks: chunks.length, sources: sources.length, coverageAdded: coverageAdded.length,
    regulatedProfessions: regulatedProfessions.length,
  };
}

type ChunkRow = {
  chunk_id: string | null; document_id: string; chunk_type: string | null; career_id: string | null;
  language: string | null;
  grade: string | null; cluster: string | null; title: string | null; chunk_text: string | null;
  metadata_json: unknown; source_ids: string | null; page_number: number | null; last_checked: string | null;
};

async function upsertChunks(chunks: ChunkRow[]) {
  await inBatches(chunks, async (batch) => sql`
    INSERT INTO citacitaku_rag_chunks (
      chunk_id, document_id, chunk_type, language, career_id, grade, cluster, title, chunk_text,
      metadata_json, source_ids, page_number, last_checked, updated_at
    ) SELECT x.chunk_id, x.document_id, x.chunk_type, x.language, x.career_id, x.grade, x.cluster, x.title,
      x.chunk_text, x.metadata_json, x.source_ids, x.page_number, x.last_checked, NOW()
    FROM jsonb_to_recordset(${JSON.stringify(batch)}::jsonb) AS x(
      chunk_id TEXT, document_id TEXT, chunk_type TEXT, language TEXT, career_id TEXT, grade TEXT, cluster TEXT,
      title TEXT, chunk_text TEXT, metadata_json JSONB, source_ids TEXT, page_number INTEGER, last_checked DATE
    ) ON CONFLICT (chunk_id) DO UPDATE SET document_id = EXCLUDED.document_id, chunk_type = EXCLUDED.chunk_type,
      language = EXCLUDED.language, career_id = EXCLUDED.career_id, grade = EXCLUDED.grade,
      cluster = EXCLUDED.cluster, title = EXCLUDED.title,
      chunk_text = EXCLUDED.chunk_text, metadata_json = EXCLUDED.metadata_json, source_ids = EXCLUDED.source_ids,
      page_number = EXCLUDED.page_number, last_checked = EXCLUDED.last_checked, updated_at = NOW()
  `);
}

async function importPdf(pdfBuffer: Uint8Array, pdfPath: string) {
  const parser = new PDFParse({ data: pdfBuffer });
  try {
    const info = await parser.getInfo();
    const result = await parser.getText();
    await upsertDocument({
      id: PDF_DOCUMENT_ID,
      fileName: path.basename(pdfPath),
      sourceType: "pdf",
      contentHash: hash(pdfBuffer),
      pageCount: info.total,
      metadata: { title: info.info?.Title || null, author: info.info?.Author || null, producer: info.info?.Producer || null },
    });
    const chunks: ChunkRow[] = (result.pages || []).map((page) => ({
      chunk_id: `${PDF_DOCUMENT_ID}-page-${String(page.num).padStart(3, "0")}`,
      document_id: PDF_DOCUMENT_ID,
      chunk_type: "pdf_page",
      language: "bilingual",
      career_id: null,
      grade: null,
      cluster: null,
      title: `RAG Knowledge Base PDF · Halaman ${page.num}`,
      chunk_text: page.text.trim(),
      metadata_json: { page: page.num, totalPages: info.total },
      source_ids: null,
      page_number: page.num,
      last_checked: "2026-08-27",
    })).filter((chunk) => Boolean(chunk.chunk_text));
    await sql`DELETE FROM citacitaku_rag_chunks WHERE document_id = ${PDF_DOCUMENT_ID}`;
    await upsertChunks(chunks);
    return { pages: chunks.length };
  } finally {
    await parser.destroy();
  }
}

async function main() {
  const workbookPath = process.argv[2] || DEFAULT_WORKBOOK;
  const pdfPath = process.argv[3] || DEFAULT_PDF;
  const [workbookBuffer, pdfBuffer] = await Promise.all([readFile(workbookPath), readFile(pdfPath)]);
  const sheets = await readExcelFile(workbookPath) as SheetData[];
  await ensureSchema();
  const workbook = await importWorkbook(sheets, hash(workbookBuffer), workbookPath);
  const pdf = await importPdf(pdfBuffer, pdfPath);
  console.log(JSON.stringify({ workbook, pdf, workbookPath, pdfPath }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
