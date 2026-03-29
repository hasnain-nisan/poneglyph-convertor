import Papa, { ParseResult } from "papaparse";
import * as XLSX from "xlsx";
import { CSV_CHUNK_SIZE, PREVIEW_LIMIT } from "../constants/app";
import { readWorkbook } from "./files";
import { extractTabularData, normalizeParsedRows, rowArrayToObject } from "./normalizers";
import { getSchemaFromParsedChunk } from "./schema";
import { formatNumber, getChunkProgress } from "./utils";
import type { FileSummary, ProgressUpdate } from "../types/converter";

export async function parseFilePreview(
  file: File,
  sourceType: "csv" | "workbook",
  onProgress: (update: ProgressUpdate) => void,
): Promise<FileSummary> {
  return sourceType === "csv"
    ? parseCsvPreview(file, onProgress)
    : parseWorkbookPreview(file, onProgress);
}

export function parseCsvPreview(
  file: File,
  onProgress: (update: ProgressUpdate) => void,
): Promise<FileSummary> {
  return new Promise((resolve, reject) => {
    let rowCount = 0;
    let schema = [] as ReturnType<typeof getSchemaFromParsedChunk>;
    const previewRows: FileSummary["previewRows"] = [];
    let lastProgress = -1;

    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      skipEmptyLines: true,
      worker: true,
      chunkSize: CSV_CHUNK_SIZE,
      chunk(results: ParseResult<Record<string, unknown>>) {
        if (!schema.length) {
          schema = getSchemaFromParsedChunk(results);
        }

        const normalizedRows = normalizeParsedRows(results.data, schema);
        rowCount += normalizedRows.length;

        if (previewRows.length < PREVIEW_LIMIT) {
          previewRows.push(...normalizedRows.slice(0, PREVIEW_LIMIT - previewRows.length));
        }

        const progress = getChunkProgress(results.meta.cursor, file.size);
        if (progress !== lastProgress) {
          lastProgress = progress;
          onProgress({
            title: "Reading CSV file",
            detail: `${progress}% complete • ${formatNumber(rowCount)} row(s) scanned`,
            progress,
          });
        }
      },
      complete() {
        if (!schema.length || !rowCount) {
          reject(new Error("The selected CSV file does not contain any data rows."));
          return;
        }

        resolve({
          sheetName: "CSV",
          rowCount,
          columns: schema.map(({ key }) => key),
          previewRows,
        });
      },
      error(error) {
        reject(new Error(error.message || "Could not parse the CSV file."));
      },
    });
  });
}

export async function parseWorkbookPreview(
  file: File,
  onProgress: (update: ProgressUpdate) => void,
): Promise<FileSummary> {
  onProgress({
    title: "Reading Excel file",
    detail: "Loading workbook into memory...",
    progress: 20,
  });

  const workbook = await readWorkbook(file);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const matrix = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: "",
    raw: false,
    blankrows: false,
  }) as Array<Array<string | number | boolean | Date | null | undefined>>;

  onProgress({
    title: "Reading Excel file",
    detail: "Preparing preview rows...",
    progress: 75,
  });

  const { columns, rowArrays } = extractTabularData(matrix);

  if (!columns.length || !rowArrays.length) {
    throw new Error("The selected Excel file does not contain any data rows.");
  }

  const previewRows = rowArrays.slice(0, PREVIEW_LIMIT).map((row) => rowArrayToObject(columns, row));

  onProgress({
    title: "Reading Excel file",
    detail: `100% complete • ${formatNumber(rowArrays.length)} row(s) scanned`,
    progress: 100,
  });

  return {
    sheetName,
    rowCount: rowArrays.length,
    columns,
    previewRows,
  };
}
