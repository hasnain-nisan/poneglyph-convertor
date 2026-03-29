import * as XLSX from "xlsx";
import type { SourceType } from "../types/converter";

export function getFileExtension(fileName: string): string {
  const match = fileName.toLowerCase().match(/\.([^.]+)$/);
  return match ? match[1] : "";
}

export function detectSourceType(file: File): SourceType {
  return getFileExtension(file.name) === "csv" ? "csv" : "workbook";
}

export function readWorkbook(file: File): Promise<XLSX.WorkBook> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        resolve(XLSX.read(event.target?.result, { type: "array", cellDates: true }));
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("The browser could not read the selected file."));
    };

    reader.readAsArrayBuffer(file);
  });
}

export function downloadBlob(fileName: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
