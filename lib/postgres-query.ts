import "server-only";

import { type QueryResult, type QueryResultRow, sql as pooledSql } from "@vercel/postgres";

type SqlValue = string | number | boolean | Date | Buffer | Uint8Array | null | undefined;

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
