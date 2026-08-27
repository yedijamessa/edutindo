import { sql } from "@vercel/postgres";
import crypto from "crypto";
import dotenv from "dotenv";
import path from "path";
import readExcelFile from "read-excel-file/node";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

type CellValue = string | number | boolean | Date | null;
type SheetData = { sheet: string; data: CellValue[][] };

const DEFAULT_WORKBOOK = "/Users/yedijamessa/Downloads/Database_Beasiswa_S1_S2_Indonesia_2026_2027.xlsx";

function text(value: CellValue | undefined, maxLength = 4000) {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const result = String(value).trim().replace(/\s+/g, " ");
  return result ? result.slice(0, maxLength) : null;
}

function dateText(value: CellValue | undefined) {
  const result = text(value, 40);
  if (!result) return null;
  const match = result.match(/\d{4}-\d{2}-\d{2}/);
  return match?.[0] ?? null;
}

function hashId(parts: Array<string | null>) {
  return crypto.createHash("sha256").update(parts.filter(Boolean).join("|")).digest("hex").slice(0, 20);
}

function rowObject(headers: CellValue[], row: CellValue[]) {
  const record: Record<string, string | null> = {};
  headers.forEach((header, index) => {
    const key = text(header, 120);
    if (key) record[key] = text(row[index]);
  });
  return record;
}

function findHeaderIndex(rows: CellValue[][], required: string[]) {
  return rows.findIndex((row) => required.every((header) => row.some((cell) => text(cell, 120) === header)));
}

async function ensureSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS citacitaku_scholarships (
      id TEXT PRIMARY KEY,
      source_sheet TEXT NOT NULL,
      level TEXT NOT NULL,
      scholarship TEXT NOT NULL,
      provider TEXT,
      destination TEXT,
      type TEXT,
      status TEXT,
      application_window TEXT,
      funding_level TEXT,
      coverage TEXT,
      eligible_majors TEXT,
      key_eligibility TEXT,
      language TEXT,
      admission_offer_first TEXT,
      age_limit TEXT,
      bond_return_obligation TEXT,
      recommended_action TEXT,
      official_source_url TEXT,
      source_quality TEXT,
      last_checked DATE,
      historical BOOLEAN NOT NULL DEFAULT FALSE,
      searchable_text TEXT NOT NULL DEFAULT '',
      raw_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS citacitaku_scholarships_level_status_idx ON citacitaku_scholarships (level, status)`;
  await sql`CREATE INDEX IF NOT EXISTS citacitaku_scholarships_historical_idx ON citacitaku_scholarships (historical)`;
  await sql`
    CREATE TABLE IF NOT EXISTS citacitaku_scholarship_field_guides (
      id TEXT PRIMARY KEY,
      scholarship TEXT NOT NULL,
      field_group TEXT,
      majors_subjects TEXT,
      important_notes TEXT,
      official_source_url TEXT,
      searchable_text TEXT NOT NULL DEFAULT '',
      imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS citacitaku_scholarship_field_guides_scholarship_idx ON citacitaku_scholarship_field_guides (scholarship)`;
}

async function upsertScholarship(sheetName: string, headers: CellValue[], row: CellValue[], historical: boolean) {
  const raw = rowObject(headers, row);
  const id = raw.ID || `generated-${hashId([sheetName, raw.Scholarship, raw["Scholarship / Program"], raw.Provider, raw["Official Source URL"]])}`;
  const scholarship = raw.Scholarship || raw["Scholarship / Program"];
  if (!scholarship) return false;

  const level = raw.Level || (sheetName === "S1" ? "S1" : sheetName === "S2" ? "S2" : "Historical");
  const searchableText = [
    scholarship,
    raw.Provider,
    raw.Destination || raw["Country / Scope"],
    raw.Type,
    raw.Status || raw["Current Status"],
    raw.Coverage || raw["Historical Fields / Notes"],
    raw["Eligible Majors / Fields"],
    raw["Key Eligibility"],
    raw["Recommended Action"],
  ].filter(Boolean).join(" ");

  await sql`
    INSERT INTO citacitaku_scholarships (
      id, source_sheet, level, scholarship, provider, destination, type, status,
      application_window, funding_level, coverage, eligible_majors, key_eligibility,
      language, admission_offer_first, age_limit, bond_return_obligation,
      recommended_action, official_source_url, source_quality, last_checked,
      historical, searchable_text, raw_json, updated_at
    ) VALUES (
      ${id}, ${sheetName}, ${level}, ${scholarship}, ${raw.Provider}, ${raw.Destination || raw["Country / Scope"]}, ${raw.Type},
      ${raw["Status 27-Aug-2026"] || raw["Current Status"]}, ${raw["Application Window / Deadline"]}, ${raw["Funding Level"]},
      ${raw.Coverage || raw["Historical Fields / Notes"]}, ${raw["Eligible Majors / Fields"]}, ${raw["Key Eligibility"]},
      ${raw.Language}, ${raw["Admission/Offer First?"]}, ${raw["Age Limit"]}, ${raw["Bond / Return Obligation"]},
      ${raw["Recommended Action"]}, ${raw["Official Source URL"]}, ${raw["Source Quality"]}, ${dateText(row[headers.findIndex((cell) => text(cell) === "Last Checked")])},
      ${historical}, ${searchableText}, ${JSON.stringify(raw)}::jsonb, NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      source_sheet = EXCLUDED.source_sheet,
      level = EXCLUDED.level,
      scholarship = EXCLUDED.scholarship,
      provider = EXCLUDED.provider,
      destination = EXCLUDED.destination,
      type = EXCLUDED.type,
      status = EXCLUDED.status,
      application_window = EXCLUDED.application_window,
      funding_level = EXCLUDED.funding_level,
      coverage = EXCLUDED.coverage,
      eligible_majors = EXCLUDED.eligible_majors,
      key_eligibility = EXCLUDED.key_eligibility,
      language = EXCLUDED.language,
      admission_offer_first = EXCLUDED.admission_offer_first,
      age_limit = EXCLUDED.age_limit,
      bond_return_obligation = EXCLUDED.bond_return_obligation,
      recommended_action = EXCLUDED.recommended_action,
      official_source_url = EXCLUDED.official_source_url,
      source_quality = EXCLUDED.source_quality,
      last_checked = EXCLUDED.last_checked,
      historical = EXCLUDED.historical,
      searchable_text = EXCLUDED.searchable_text,
      raw_json = EXCLUDED.raw_json,
      updated_at = NOW()
  `;
  return true;
}

async function upsertFieldGuide(headers: CellValue[], row: CellValue[]) {
  const raw = rowObject(headers, row);
  if (!raw.Scholarship) return false;
  const id = `fg-${hashId([raw.Scholarship, raw["Field Group"], raw["Majors / Subjects"], raw["Official Source URL"]])}`;
  const searchableText = [raw.Scholarship, raw["Field Group"], raw["Majors / Subjects"], raw["Important Notes"]].filter(Boolean).join(" ");
  await sql`
    INSERT INTO citacitaku_scholarship_field_guides (
      id, scholarship, field_group, majors_subjects, important_notes, official_source_url, searchable_text, updated_at
    ) VALUES (
      ${id}, ${raw.Scholarship}, ${raw["Field Group"]}, ${raw["Majors / Subjects"]}, ${raw["Important Notes"]},
      ${raw["Official Source URL"]}, ${searchableText}, NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      scholarship = EXCLUDED.scholarship,
      field_group = EXCLUDED.field_group,
      majors_subjects = EXCLUDED.majors_subjects,
      important_notes = EXCLUDED.important_notes,
      official_source_url = EXCLUDED.official_source_url,
      searchable_text = EXCLUDED.searchable_text,
      updated_at = NOW()
  `;
  return true;
}

async function main() {
  const workbookPath = process.argv[2] || DEFAULT_WORKBOOK;
  await ensureSchema();
  const sheets = await readExcelFile(workbookPath) as SheetData[];
  let scholarships = 0;
  let fieldGuides = 0;

  for (const sheet of sheets) {
    if (sheet.sheet === "S1" || sheet.sheet === "S2" || sheet.sheet === "Historical_Paused") {
      const headerIndex = findHeaderIndex(sheet.data, sheet.sheet === "Historical_Paused" ? ["ID", "Scholarship / Program"] : ["ID", "Scholarship"]);
      if (headerIndex < 0) continue;
      const headers = sheet.data[headerIndex];
      for (const row of sheet.data.slice(headerIndex + 1)) {
        if (await upsertScholarship(sheet.sheet, headers, row, sheet.sheet === "Historical_Paused")) scholarships += 1;
      }
    }

    if (sheet.sheet === "Field_Guide") {
      const headerIndex = findHeaderIndex(sheet.data, ["Scholarship", "Field Group"]);
      if (headerIndex < 0) continue;
      const headers = sheet.data[headerIndex];
      for (const row of sheet.data.slice(headerIndex + 1)) {
        if (await upsertFieldGuide(headers, row)) fieldGuides += 1;
      }
    }
  }

  console.log(`Imported ${scholarships} scholarships and ${fieldGuides} field-guide rows from ${workbookPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
