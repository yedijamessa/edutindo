import "@/lib/server-only";

import { type QueryResult, type QueryResultRow, sql as pooledSql } from "@vercel/postgres";

type SqlValue = string | number | boolean | Date | Buffer | Uint8Array | null | undefined;

export const POSTGRES_CONNECTION_ENV_VAR = "POSTGRES_URL";

export function isPostgresConfigured() {
  return Boolean(process.env.POSTGRES_URL?.trim());
}

export function getPostgresSetupMessage() {
  return `Postgres is not configured. Set ${POSTGRES_CONNECTION_ENV_VAR} in .env.local and restart the dev server.`;
}

function buildParameterizedQuery(strings: TemplateStringsArray, values: SqlValue[]) {
  let text = strings[0] ?? "";

  for (let index = 1; index < strings.length; index += 1) {
    text += `$${index}${strings[index] ?? ""}`;
  }

  return {
    text,
    values,
  };
}

export async function sqlQuery<Row extends QueryResultRow = QueryResultRow>(
  strings: TemplateStringsArray,
  ...values: SqlValue[]
): Promise<QueryResult<Row>> {
  const query = buildParameterizedQuery(strings, values);
  return pooledSql.query<Row>(query.text, query.values);
}
