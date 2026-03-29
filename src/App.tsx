import { useEffect, useState } from "react";
import { APP_NAME, DEFAULT_STATUS_MESSAGE, DEFAULT_TABLE_NAME, EMPTY_SUMMARY, IDLE_BUSY_STATE } from "./constants/app";
import { BrandingFooter } from "./components/BrandingFooter";
import { ControlPanel } from "./components/ControlPanel";
import { HeroSection } from "./components/HeroSection";
import { LoaderOverlay } from "./components/LoaderOverlay";
import { PreviewPanel } from "./components/PreviewPanel";
import { SummaryGrid } from "./components/SummaryGrid";
import { UploadDropzone } from "./components/UploadDropzone";
import { exportFile } from "./lib/exporters";
import { detectSourceType, downloadBlob } from "./lib/files";
import { parseFilePreview } from "./lib/parsers";
import { sanitizeIdentifier, stripExtension } from "./lib/utils";
import type { BusyState, FileSummary, OutputFormat, ProgressUpdate, SourceType } from "./types/converter";

interface FileContext {
  file: File | null;
  fileName: string;
  sourceType: SourceType | null;
  summary: FileSummary;
}

const INITIAL_FILE_CONTEXT: FileContext = {
  file: null,
  fileName: "",
  sourceType: null,
  summary: EMPTY_SUMMARY,
};

export default function App() {
  const [fileContext, setFileContext] = useState<FileContext>(INITIAL_FILE_CONTEXT);
  const [selectedFormat, setSelectedFormat] = useState<OutputFormat>("json");
  const [tableName, setTableName] = useState(DEFAULT_TABLE_NAME);
  const [statusMessage, setStatusMessage] = useState(DEFAULT_STATUS_MESSAGE);
  const [busyState, setBusyState] = useState<BusyState>(IDLE_BUSY_STATE);

  useEffect(() => {
    document.title = APP_NAME;
  }, []);

  function showBusy(update: ProgressUpdate): void {
    setBusyState({ isBusy: true, ...update });
  }

  function hideBusy(): void {
    setBusyState(IDLE_BUSY_STATE);
  }

  async function handleFileSelected(file: File): Promise<void> {
    const sourceType = detectSourceType(file);

    setFileContext({
      file,
      fileName: file.name,
      sourceType,
      summary: {
        ...EMPTY_SUMMARY,
        sheetName: sourceType === "csv" ? "CSV" : "Loading...",
      },
    });
    setStatusMessage(`Reading ${file.name}...`);
    showBusy({
      title: `Reading ${sourceType.toUpperCase()} file`,
      detail: "Preparing the Poneglyph scan...",
      progress: 0,
    });

    try {
      const summary = await parseFilePreview(file, sourceType, showBusy);

      setFileContext({
        file,
        fileName: file.name,
        sourceType,
        summary,
      });
      setStatusMessage(
        `Loaded ${summary.rowCount.toLocaleString()} row(s) and ${summary.columns.length.toLocaleString()} column(s) from ${file.name}. Preview shows the first ${Math.min(summary.rowCount, 8)} row(s).`,
      );
      setTableName((current) =>
        !current || current === DEFAULT_TABLE_NAME ? sanitizeIdentifier(stripExtension(file.name), "table") : current,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not read that file.";
      setFileContext(INITIAL_FILE_CONTEXT);
      setStatusMessage(message);
    } finally {
      hideBusy();
    }
  }

  async function handleDownload(): Promise<void> {
    if (!fileContext.file || !fileContext.sourceType || !fileContext.summary.rowCount || busyState.isBusy) {
      return;
    }

    const safeTableName = sanitizeIdentifier(tableName || DEFAULT_TABLE_NAME, "table");
    const baseName = stripExtension(fileContext.fileName) || safeTableName;

    showBusy({
      title: `Generating ${selectedFormat.toUpperCase()} output`,
      detail: "Charting your export route...",
      progress: 0,
    });

    try {
      const blob = await exportFile(fileContext.file, fileContext.sourceType, selectedFormat, safeTableName, showBusy);
      downloadBlob(`${baseName}.${selectedFormat}`, blob);
      setStatusMessage(`${selectedFormat.toUpperCase()} download is ready for ${fileContext.fileName}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not create the converted file.";
      setStatusMessage(message);
    } finally {
      hideBusy();
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 map-grid opacity-70" />
      <div className="pointer-events-none absolute -left-24 top-12 h-72 w-72 rounded-full bg-coral-500/20 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-0 h-[30rem] w-[30rem] rounded-full bg-gold-400/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-sky-400/10 blur-3xl" />

      <main className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <HeroSection />

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <UploadDropzone fileName={fileContext.fileName} disabled={busyState.isBusy} onFileSelected={handleFileSelected} />
          <ControlPanel
            selectedFormat={selectedFormat}
            tableName={tableName}
            disabled={busyState.isBusy}
            onFormatChange={setSelectedFormat}
            onTableNameChange={setTableName}
            onDownload={handleDownload}
          />
        </section>

        <SummaryGrid fileName={fileContext.fileName} summary={fileContext.summary} />
        <PreviewPanel summary={fileContext.summary} statusMessage={statusMessage} />
        <BrandingFooter />
      </main>

      <LoaderOverlay busyState={busyState} />
    </div>
  );
}

