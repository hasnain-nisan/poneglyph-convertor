import type { DataRow, MatrixCell, SchemaColumn } from "../types/converter";

export function normalizeHeader(value: unknown, index: number): string {
  const text = String(value ?? "").trim().replace(/\s+/g, " ");
  return text || `Column ${index + 1}`;
}

export function normalizeCellValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  const text = typeof value === "string" ? value.trim() : String(value);
  return /^'\d/.test(text) ? text.slice(1) : text;
}

export function hasMeaningfulObjectRow(row: DataRow, columns: string[]): boolean {
  return columns.some((column) => String(row[column] ?? "").trim() !== "");
}

export function hasMeaningfulArrayRow(row: string[]): boolean {
  return row.some((value) => String(value ?? "").trim() !== "");
}

export function buildCsvSchema(fields: string[]): SchemaColumn[] {
  const used = new Map<string, number>();

  return fields.map((field, index) => {
    const baseKey = normalizeHeader(field, index);
    const nextIndex = used.get(baseKey) ?? 0;
    used.set(baseKey, nextIndex + 1);

    return {
      sourceKey: field,
      key: nextIndex === 0 ? baseKey : `${baseKey}_${nextIndex + 1}`,
    };
  });
}

export function projectObjectRow(
  row: Record<string, unknown> | undefined,
  schema: SchemaColumn[],
): DataRow {
  const normalized: DataRow = {};

  schema.forEach(({ sourceKey, key }) => {
    normalized[key] = normalizeCellValue(row?.[sourceKey]);
  });

  return normalized;
}

export function normalizeParsedRows(
  rows: Array<Record<string, unknown>>,
  schema: SchemaColumn[],
): DataRow[] {
  const keys = schema.map(({ key }) => key);

  return rows
    .map((row) => projectObjectRow(row, schema))
    .filter((row) => hasMeaningfulObjectRow(row, keys));
}

export function rowArrayToObject(columns: string[], row: string[]): DataRow {
  const normalized: DataRow = {};

  columns.forEach((column, index) => {
    normalized[column] = normalizeCellValue(row[index]);
  });

  return normalized;
}

export function extractTabularData(matrix: MatrixCell[][]): {
  columns: string[];
  rowArrays: string[][];
} {
  const [headerRow = [], ...bodyRows] = matrix;
  const columns = headerRow.map((header, index) => normalizeHeader(header, index));
  const rowArrays = bodyRows
    .map((row) => columns.map((_, index) => normalizeCellValue(row[index])))
    .filter((row) => hasMeaningfulArrayRow(row));

  return { columns, rowArrays };
}
