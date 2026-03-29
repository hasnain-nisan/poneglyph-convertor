export type OutputFormat = "json" | "sql";
export type SourceType = "csv" | "workbook";
export type DataRow = Record<string, string>;
export type MatrixCell = string | number | boolean | Date | null | undefined;

export interface FileSummary {
  sheetName: string;
  rowCount: number;
  columns: string[];
  previewRows: DataRow[];
}

export interface ProgressUpdate {
  title: string;
  detail: string;
  progress: number;
}

export interface BusyState extends ProgressUpdate {
  isBusy: boolean;
}

export interface SchemaColumn {
  sourceKey: string;
  key: string;
}

export interface FormatOption {
  value: OutputFormat;
  label: string;
  caption: string;
}

export interface SummaryMetric {
  label: string;
  value: string;
}
