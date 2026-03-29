import Papa, { ParseResult } from "papaparse";
import * as XLSX from "xlsx";
import { CSV_CHUNK_SIZE, EXPORT_BATCH_SIZE } from "../constants/app";
import { readWorkbook } from "./files";
import { extractTabularData, normalizeParsedRows, rowArrayToObject } from "./normalizers";
import { getSchemaFromParsedChunk } from "./schema";
import { formatNumber, getChunkProgress, sanitizeIdentifier } from "./utils";
import type { DataRow, ProgressUpdate, OutputFormat } from "../types/converter";

export async function exportFile(
  file: File,
  sourceType: "csv" | "workbook",
  format: OutputFormat,
  tableName: string,
  onProgress: (update: ProgressUpdate) => void,
): Promise<Blob> {
  return sourceType === "csv"
    ? exportCsvFile(file, format, tableName, onProgress)
    : exportWorkbookFile(file, format, tableName, onProgress);
}

export function exportCsvFile(
  file: File,
  format: OutputFormat,
  tableName: string,
  onProgress: (update: ProgressUpdate) => void,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const parts: string[] = [];
    let rowCount = 0;
    let schema = [] as ReturnType<typeof getSchemaFromParsedChunk>;
    let sqlColumnMap: Array<{ original: string; safe: string }> = [];
    let hasJsonRows = false;
    let lastProgress = -1;

    if (format === "json") {
      parts.push("[\n");
    }

    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      skipEmptyLines: true,
      worker: true,
      chunkSize: CSV_CHUNK_SIZE,
      chunk(results: ParseResult<Record<string, unknown>>) {
        if (!schema.length) {
          schema = getSchemaFromParsedChunk(results);
          if (!schema.length) {
            return;
          }

          if (format === "sql") {
            sqlColumnMap = buildSqlColumnMap(schema.map(({ key }) => key));
            parts.push(buildCreateTableStatement(tableName, sqlColumnMap), "\n\n");
          }
        }

        const normalizedRows = normalizeParsedRows(results.data, schema);
        if (!normalizedRows.length) {
          return;
        }

        rowCount += normalizedRows.length;

        if (format === "json") {
          const chunkText = normalizedRows.map((row) => JSON.stringify(row)).join(",\n");
          if (chunkText) {
            parts.push(hasJsonRows ? ",\n" : "", chunkText);
            hasJsonRows = true;
          }
        } else {
          for (let index = 0; index < normalizedRows.length; index += EXPORT_BATCH_SIZE) {
            const batch = normalizedRows.slice(index, index + EXPORT_BATCH_SIZE);
            parts.push(buildInsertStatements(tableName, sqlColumnMap, batch), "\n");
          }
        }

        const progress = getChunkProgress(results.meta.cursor, file.size);
        if (progress !== lastProgress) {
          lastProgress = progress;
          onProgress({
            title: `Generating ${format.toUpperCase()} output`,
            detail: `${progress}% complete • ${formatNumber(rowCount)} row(s) exported`,
            progress,
          });
        }
      },
      complete() {
        if (!rowCount) {
          reject(new Error("There are no rows available to export."));
          return;
        }

        if (format === "json") {
          parts.push(hasJsonRows ? "\n]\n" : "]\n");
          resolve(new Blob(parts, { type: "application/json;charset=utf-8" }));
          return;
        }

        resolve(new Blob(parts, { type: "text/sql;charset=utf-8" }));
      },
      error(error) {
        reject(new Error(error.message || `Could not export ${format.toUpperCase()} from the CSV file.`));
      },
    });
  });
}

export async function exportWorkbookFile(
  file: File,
  format: OutputFormat,
  tableName: string,
  onProgress: (update: ProgressUpdate) => void,
): Promise<Blob> {
  onProgress({
    title: `Generating ${format.toUpperCase()} output`,
    detail: "Loading workbook into memory...",
    progress: 15,
  });

  const workbook = await readWorkbook(file);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const matrix = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: "",
    raw: false,
    blankrows: false,
  }) as Array<Array<string | number | boolean | Date | null | undefined>>;
  const { columns, rowArrays } = extractTabularData(matrix);

  if (!columns.length || !rowArrays.length) {
    throw new Error("There are no rows available to export.");
  }

  return format === "json"
    ? buildJsonBlobFromRowArrays(columns, rowArrays, onProgress)
    : buildSqlBlobFromRowArrays(columns, rowArrays, tableName, onProgress);
}

function buildJsonBlobFromRowArrays(
  columns: string[],
  rowArrays: string[][],
  onProgress: (update: ProgressUpdate) => void,
): Blob {
  const parts = ["[\n"];
  let hasRows = false;

  for (let index = 0; index < rowArrays.length; index += EXPORT_BATCH_SIZE) {
    const batch = rowArrays.slice(index, index + EXPORT_BATCH_SIZE);
    const chunkText = batch
      .map((row) => JSON.stringify(rowArrayToObject(columns, row)))
      .join(",\n");

    if (!chunkText) {
      continue;
    }

    parts.push(hasRows ? ",\n" : "", chunkText);
    hasRows = true;

    const progress = 20 + Math.round(((index + batch.length) / rowArrays.length) * 80);
    onProgress({
      title: "Generating JSON output",
      detail: `${Math.min(progress, 100)}% complete • ${formatNumber(index + batch.length)} row(s) exported`,
      progress: Math.min(progress, 100),
    });
  }

  parts.push(hasRows ? "\n]\n" : "]\n");
  return new Blob(parts, { type: "application/json;charset=utf-8" });
}

function buildSqlBlobFromRowArrays(
  columns: string[],
  rowArrays: string[][],
  tableName: string,
  onProgress: (update: ProgressUpdate) => void,
): Blob {
  const sqlColumnMap = buildSqlColumnMap(columns);
  const parts = [buildCreateTableStatement(tableName, sqlColumnMap), "\n\n"];

  for (let index = 0; index < rowArrays.length; index += EXPORT_BATCH_SIZE) {
    const batch = rowArrays.slice(index, index + EXPORT_BATCH_SIZE).map((row) => rowArrayToObject(columns, row));
    parts.push(buildInsertStatements(tableName, sqlColumnMap, batch), "\n");

    const progress = 20 + Math.round(((index + batch.length) / rowArrays.length) * 80);
    onProgress({
      title: "Generating SQL output",
      detail: `${Math.min(progress, 100)}% complete • ${formatNumber(index + batch.length)} row(s) exported`,
      progress: Math.min(progress, 100),
    });
  }

  return new Blob(parts, { type: "text/sql;charset=utf-8" });
}

function buildSqlColumnMap(columns: string[]): Array<{ original: string; safe: string }> {
  const safeColumns = makeUniqueIdentifiers(columns);
  return columns.map((original, index) => ({
    original,
    safe: safeColumns[index],
  }));
}

function buildCreateTableStatement(
  tableName: string,
  columnMap: Array<{ original: string; safe: string }>,
): string {
  return [
    `CREATE TABLE ${tableName} (`,
    columnMap.map(({ safe }) => `  ${safe} TEXT`).join(",\n"),
    `);`,
  ].join("\n");
}

function buildInsertStatements(
  tableName: string,
  columnMap: Array<{ original: string; safe: string }>,
  rows: DataRow[],
): string {
  return rows
    .map((row) => {
      const columnList = columnMap.map(({ safe }) => safe).join(", ");
      const values = columnMap.map(({ original }) => toSqlValue(row[original])).join(", ");
      return `INSERT INTO ${tableName} (${columnList}) VALUES (${values});`;
    })
    .join("\n");
}

function makeUniqueIdentifiers(columns: string[]): string[] {
  const used = new Map<string, number>();

  return columns.map((column, index) => {
    const fallback = `column_${index + 1}`;
    const base = sanitizeIdentifier(column, fallback);
    const nextIndex = used.get(base) ?? 0;
    used.set(base, nextIndex + 1);
    return nextIndex === 0 ? base : `${base}_${nextIndex + 1}`;
  });
}

function toSqlValue(value: string): string {
  if (value === "") {
    return "NULL";
  }

  return `'${String(value).replace(/'/g, "''")}'`;
}
