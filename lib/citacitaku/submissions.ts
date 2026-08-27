import "@/lib/server-only";

import { getPostgresSetupMessage, isPostgresConfigured, sqlQuery as sql } from "@/lib/postgres-query";

type CitacitakuEventType = "guidance" | "detail" | "feedback";
type CitacitakuEventStatus = "completed" | "fallback" | "error";

type JsonObject = Record<string, unknown>;

type SaveCitacitakuEventInput = {
  eventType: CitacitakuEventType;
  input: JsonObject;
  output: JsonObject;
  metadata?: JsonObject;
  consentAccepted?: boolean | null;
  consentVersion?: string | null;
  consentText?: string | null;
  provider?: string | null;
  model?: string | null;
  status?: CitacitakuEventStatus;
};

let citacitakuSchemaReady: Promise<void> | null = null;

function stringifyJson(value: JsonObject | undefined) {
  return JSON.stringify(value ?? {});
}

async function ensureCitacitakuSchema() {
  if (citacitakuSchemaReady) return citacitakuSchemaReady;

  citacitakuSchemaReady = (async () => {
    if (!isPostgresConfigured()) {
      throw new Error(getPostgresSetupMessage());
    }

    await sql`
      CREATE TABLE IF NOT EXISTS citacitaku_events (
        id TEXT PRIMARY KEY,
        event_type TEXT NOT NULL,
        input_json JSONB NOT NULL,
        output_json JSONB NOT NULL,
        metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
        consent_accepted BOOLEAN,
        consent_version TEXT,
        consent_text TEXT,
        provider TEXT,
        model TEXT,
        status TEXT NOT NULL DEFAULT 'completed',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS citacitaku_events_created_at_idx
      ON citacitaku_events (created_at DESC)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS citacitaku_events_type_created_at_idx
      ON citacitaku_events (event_type, created_at DESC)
    `;
  })().catch((error) => {
    citacitakuSchemaReady = null;
    throw error;
  });

  return citacitakuSchemaReady;
}

export async function saveCitacitakuEvent(event: SaveCitacitakuEventInput) {
  await ensureCitacitakuSchema();

  await sql`
    INSERT INTO citacitaku_events (
      id,
      event_type,
      input_json,
      output_json,
      metadata_json,
      consent_accepted,
      consent_version,
      consent_text,
      provider,
      model,
      status
    )
    VALUES (
      ${crypto.randomUUID()},
      ${event.eventType},
      ${stringifyJson(event.input)}::jsonb,
      ${stringifyJson(event.output)}::jsonb,
      ${stringifyJson(event.metadata)}::jsonb,
      ${event.consentAccepted ?? null},
      ${event.consentVersion ?? null},
      ${event.consentText ?? null},
      ${event.provider ?? null},
      ${event.model ?? null},
      ${event.status ?? "completed"}
    )
  `;
}
