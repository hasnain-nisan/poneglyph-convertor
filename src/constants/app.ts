import type { BusyState, FileSummary, FormatOption } from "../types/converter";

export const APP_NAME = "Poneglyph Convertor";
export const AUTHOR_NAME = "Hasnain Nisan";
export const LINKEDIN_URL = "https://www.linkedin.com/in/hasnain-nisan1/";
export const GITHUB_URL = "https://github.com/hasnain-nisan";

export const DEFAULT_TABLE_NAME = "imported_data";
export const DEFAULT_STATUS_MESSAGE = "Load a file to preview the extracted data.";

export const PREVIEW_LIMIT = 8;
export const CSV_CHUNK_SIZE = 1024 * 1024 * 2;
export const EXPORT_BATCH_SIZE = 500;
export const ACCEPTED_FILE_TYPES = ".csv,.xls,.xlsx";

export const EMPTY_SUMMARY: FileSummary = {
  sheetName: "-",
  rowCount: 0,
  columns: [],
  previewRows: [],
};

export const IDLE_BUSY_STATE: BusyState = {
  isBusy: false,
  title: "Processing file",
  detail: "Starting...",
  progress: 0,
};

export const FORMAT_OPTIONS: FormatOption[] = [
  {
    value: "json",
    label: "JSON",
    caption: "Structured payload for APIs, apps, and frontend workflows.",
  },
  {
    value: "sql",
    label: "SQL",
    caption: "Portable CREATE TABLE plus INSERT statements for database imports.",
  },
];

export const FEATURE_CALLOUTS = [
  "Chunked CSV scanning",
  "Poneglyph-clean headers",
  "Portable SQL output",
] as const;

export const HERO_FACTS = [
  {
    label: "Formats",
    value: "CSV, XLS, XLSX",
  },
  {
    label: "Outputs",
    value: "JSON and SQL",
  },
] as const;
