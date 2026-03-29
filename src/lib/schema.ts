import { ParseResult } from "papaparse";
import { buildCsvSchema } from "./normalizers";
import type { SchemaColumn } from "../types/converter";

export function getSchemaFromParsedChunk(
  results: ParseResult<Record<string, unknown>>,
): SchemaColumn[] {
  const fields = results.meta.fields ?? [];
  if (fields.length) {
    return buildCsvSchema(fields);
  }

  const firstRow = results.data.find((row) => row && typeof row === "object");
  return firstRow ? buildCsvSchema(Object.keys(firstRow)) : [];
}
