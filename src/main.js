import "./styles.css";
import Papa from "papaparse";
import * as XLSX from "xlsx";

document.title = "Poneglyph Convertor";

const PREVIEW_LIMIT = 8;
const CSV_CHUNK_SIZE = 1024 * 1024 * 2;
const EXPORT_BATCH_SIZE = 500;

const app = document.querySelector("#app");

app.innerHTML = `
  <div class="relative min-h-screen overflow-hidden bg-ink-950 text-slate-100">
    <div class="pointer-events-none absolute inset-0 ocean-grid opacity-70"></div>
    <div class="pointer-events-none absolute -left-24 top-12 h-72 w-72 rounded-full bg-coral-500/20 blur-3xl"></div>
    <div class="pointer-events-none absolute right-0 top-0 h-[30rem] w-[30rem] rounded-full bg-gold-400/10 blur-3xl"></div>
    <div class="pointer-events-none absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-sky-400/10 blur-3xl"></div>

    <main class="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      <header class="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p class="mb-3 inline-flex items-center gap-2 rounded-full border border-gold-300/30 bg-white/5 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-gold-200/85 shadow-lg shadow-black/10 backdrop-blur">
            Grand Line Data Forge
          </p>
          <h1 class="font-display text-4xl tracking-tight text-parchment-100 sm:text-5xl lg:text-6xl">
            Poneglyph Convertor
          </h1>
          <p class="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            Decode spreadsheet cargo into clean JSON or portable SQL. Built for heavy CSV voyages,
            fast previews, and exports that feel ready for any crew or database.
          </p>
        </div>

        <div class="island-card flex w-full max-w-md flex-col gap-4 self-start p-5 lg:p-6">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.3em] text-gold-200/70">Route Capabilities</p>
              <p class="mt-2 text-lg font-semibold text-parchment-100">CSV, XLS, XLSX to JSON or SQL</p>
            </div>
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl border border-gold-300/25 bg-gold-300/10 text-lg text-gold-100 shadow-inner shadow-gold-200/10">
              PG
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3 text-sm text-slate-300">
            <div class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p class="text-xs uppercase tracking-[0.25em] text-slate-400">Preview</p>
              <p class="mt-2 font-medium text-parchment-100">First 8 rows</p>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p class="text-xs uppercase tracking-[0.25em] text-slate-400">Large CSV</p>
              <p class="mt-2 font-medium text-parchment-100">Chunk streamed</p>
            </div>
          </div>
        </div>
      </header>

      <section class="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div id="dropzone" class="dropzone-shell island-card group relative overflow-hidden p-6 sm:p-8">
          <input id="fileInput" class="absolute inset-0 z-10 cursor-pointer opacity-0" type="file" accept=".csv,.xls,.xlsx" />
          <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.16),transparent_42%),linear-gradient(140deg,rgba(255,255,255,0.08),rgba(255,255,255,0))]"></div>
          <div class="relative z-0 flex h-full min-h-[20rem] flex-col justify-between gap-8">
            <div class="flex items-start justify-between gap-4">
              <div class="space-y-3">
                <p class="text-xs font-semibold uppercase tracking-[0.35em] text-coral-300/90">Treasure Intake</p>
                <h2 class="max-w-xl font-display text-3xl leading-tight text-parchment-100 sm:text-4xl">
                  Drop your ledger here and let the Poneglyph do the translation.
                </h2>
              </div>
              <div class="hidden h-20 w-20 shrink-0 rounded-[2rem] border border-gold-300/20 bg-slate-900/50 p-3 shadow-2xl shadow-black/20 sm:flex">
                <div class="compass-mark h-full w-full rounded-[1.4rem] border border-dashed border-gold-300/25"></div>
              </div>
            </div>

            <div class="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
              <div class="space-y-3">
                <p class="text-base font-medium text-parchment-100">
                  Select a <span class="text-gold-200">CSV, XLS, or XLSX</span> file.
                </p>
                <p class="max-w-2xl text-sm leading-7 text-slate-300">
                  Drag and drop to upload, or click anywhere in this panel. Large CSV files are processed in chunks to keep the browser responsive while previewing and exporting.
                </p>
                <div class="flex flex-wrap gap-3 text-xs uppercase tracking-[0.25em] text-slate-300/80">
                  <span class="rounded-full border border-white/10 bg-white/5 px-3 py-2">Chunked CSV</span>
                  <span class="rounded-full border border-white/10 bg-white/5 px-3 py-2">Clean Headers</span>
                  <span class="rounded-full border border-white/10 bg-white/5 px-3 py-2">Portable SQL</span>
                </div>
              </div>
              <div class="rounded-3xl border border-gold-300/20 bg-slate-950/60 px-5 py-4 text-right shadow-xl shadow-black/15">
                <p class="text-xs uppercase tracking-[0.28em] text-gold-200/70">Drop Zone</p>
                <p class="mt-2 text-sm font-medium text-parchment-100">Click or drag file</p>
              </div>
            </div>
          </div>
        </div>

        <aside class="island-card flex flex-col gap-5 p-5 sm:p-6">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.35em] text-gold-200/70">Navigation</p>
            <h2 class="mt-3 font-display text-3xl text-parchment-100">Set your conversion route</h2>
            <p class="mt-3 text-sm leading-7 text-slate-300">
              Choose the output, set the SQL table name, and download once the file has been scanned.
            </p>
          </div>

          <label class="space-y-3">
            <span class="text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">Output Format</span>
            <div id="formatDropdown" class="custom-dropdown">
              <button id="formatButton" class="dropdown-trigger" type="button" aria-haspopup="listbox" aria-expanded="false">
                <span id="formatValue">JSON</span>
                <span class="dropdown-trigger__icon" aria-hidden="true">
                  <svg viewBox="0 0 20 20" fill="none" class="h-5 w-5">
                    <path
                      d="M5 7.5L10 12.5L15 7.5"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
              </button>
              <div id="formatMenu" class="dropdown-menu hidden" role="listbox" aria-label="Output format">
                <button type="button" class="dropdown-item" data-format-option="json" role="option" aria-selected="true">JSON</button>
                <button type="button" class="dropdown-item" data-format-option="sql" role="option" aria-selected="false">SQL</button>
              </div>
            </div>
          </label>

          <label class="space-y-3">
            <span class="text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">SQL Table Name</span>
            <input id="tableNameInput" class="control-input" type="text" value="imported_data" placeholder="Enter SQL table name" />
          </label>

          <button id="downloadButton" class="action-button" type="button" disabled>
            Download Converted File
          </button>

          <div class="rounded-3xl border border-coral-300/20 bg-coral-400/10 p-4 text-sm leading-7 text-parchment-100/90">
            The app cleans header spacing, removes Excel-style leading apostrophes from numeric text, and keeps preview rendering lightweight for large voyages.
          </div>
        </aside>
      </section>

      <section class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article class="summary-tile">
          <p class="summary-label">File</p>
          <p id="fileName" class="summary-value truncate">No file loaded</p>
        </article>
        <article class="summary-tile">
          <p class="summary-label">Rows</p>
          <p id="rowCount" class="summary-value">0</p>
        </article>
        <article class="summary-tile">
          <p class="summary-label">Columns</p>
          <p id="columnCount" class="summary-value">0</p>
        </article>
        <article class="summary-tile">
          <p class="summary-label">Sheet</p>
          <p id="sheetName" class="summary-value">-</p>
        </article>
      </section>

      <section class="island-card mt-6 overflow-hidden p-5 sm:p-6">
        <div class="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.35em] text-coral-300/90">Poneglyph Reading</p>
            <h2 class="mt-3 font-display text-3xl text-parchment-100">First rows from your file</h2>
          </div>
          <p id="statusMessage" class="max-w-2xl text-sm leading-7 text-slate-300">
            Load a file to preview the extracted data.
          </p>
        </div>

        <div id="tableWrap" class="mt-5 overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950/35">
          <div class="flex min-h-64 items-center justify-center px-6 py-10 text-center text-sm text-slate-400">
            No preview yet.
          </div>
        </div>
      </section>
    </main>

    <div id="loader" class="fixed inset-0 z-50 hidden items-center justify-center bg-ink-950/70 px-4 backdrop-blur-md">
      <div class="loader-panel w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/85 shadow-2xl shadow-black/40">
        <div class="flex items-start gap-4 p-6 sm:p-7">
          <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl border border-gold-300/20 bg-gold-300/10 text-gold-100 shadow-inner shadow-gold-200/10">
            <div class="loader-spinner h-6 w-6 rounded-full border-2 border-gold-100/20 border-t-gold-200"></div>
          </div>
          <div class="min-w-0 flex-1">
            <p id="loaderTitle" class="text-lg font-semibold text-parchment-100">Processing file</p>
            <p id="loaderDetail" class="mt-2 text-sm leading-7 text-slate-300">Starting...</p>
          </div>
        </div>
        <div class="px-6 pb-6 sm:px-7 sm:pb-7">
          <div class="h-3 overflow-hidden rounded-full bg-white/10">
            <span id="loaderBar" class="block h-full w-0 rounded-full bg-[linear-gradient(90deg,rgba(251,191,36,1),rgba(248,113,113,1),rgba(56,189,248,1))] transition-[width] duration-150 ease-out"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
`;

const state = {
  file: null,
  sourceType: "",
  fileName: "",
  sheetName: "",
  rowCount: 0,
  columns: [],
  previewRows: [],
  selectedFormat: "json",
  isFormatMenuOpen: false,
  statusMessage: "Load a file to preview the extracted data.",
  isBusy: false,
  busyTitle: "Processing file",
  busyDetail: "Starting...",
  progress: 0,
};

const dom = {
  dropzone: document.querySelector("#dropzone"),
  fileInput: document.querySelector("#fileInput"),
  formatDropdown: document.querySelector("#formatDropdown"),
  formatButton: document.querySelector("#formatButton"),
  formatValue: document.querySelector("#formatValue"),
  formatMenu: document.querySelector("#formatMenu"),
  tableNameInput: document.querySelector("#tableNameInput"),
  downloadButton: document.querySelector("#downloadButton"),
  fileName: document.querySelector("#fileName"),
  rowCount: document.querySelector("#rowCount"),
  columnCount: document.querySelector("#columnCount"),
  sheetName: document.querySelector("#sheetName"),
  statusMessage: document.querySelector("#statusMessage"),
  tableWrap: document.querySelector("#tableWrap"),
  loader: document.querySelector("#loader"),
  loaderTitle: document.querySelector("#loaderTitle"),
  loaderDetail: document.querySelector("#loaderDetail"),
  loaderBar: document.querySelector("#loaderBar"),
};

dom.fileInput.addEventListener("change", (event) => {
  const [file] = event.target.files;
  if (file) {
    loadFile(file);
  }
});

dom.formatButton.addEventListener("click", () => {
  if (state.isBusy) {
    return;
  }

  setFormatMenuOpen(!state.isFormatMenuOpen);
});

dom.formatMenu.addEventListener("click", (event) => {
  const option = event.target.closest("[data-format-option]");
  if (!option) {
    return;
  }

  state.selectedFormat = option.dataset.formatOption;
  setFormatMenuOpen(false);
  renderState();
});

document.addEventListener("click", (event) => {
  if (!dom.formatDropdown.contains(event.target)) {
    setFormatMenuOpen(false);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setFormatMenuOpen(false);
  }
});

dom.downloadButton.addEventListener("click", async () => {
  if (!state.file || !state.rowCount || state.isBusy) {
    return;
  }

  const format = state.selectedFormat;
  const tableName = sanitizeIdentifier(dom.tableNameInput.value || "imported_data", "table");
  const baseName = stripExtension(state.fileName) || tableName;

  try {
    updateBusy({
      isBusy: true,
      title: `Generating ${format.toUpperCase()} output`,
      detail: "Charting your export route...",
      progress: 0,
    });

    const blob = state.sourceType === "csv"
      ? await exportCsvFile(state.file, format, tableName)
      : await exportWorkbookFile(state.file, format, tableName);

    downloadBlob(`${baseName}.${format}`, blob);
    state.statusMessage = `${format.toUpperCase()} download is ready for ${state.fileName}.`;
    renderState();
  } catch (error) {
    console.error(error);
    setError(error.message || "Could not create the converted file.");
  } finally {
    updateBusy({ isBusy: false, progress: 0 });
  }
});

["dragenter", "dragover"].forEach((eventName) => {
  dom.dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    if (!state.isBusy) {
      dom.dropzone.classList.add("is-active");
    }
  });
});

["dragleave", "dragend", "drop"].forEach((eventName) => {
  dom.dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dom.dropzone.classList.remove("is-active");
  });
});

dom.dropzone.addEventListener("drop", (event) => {
  if (state.isBusy) {
    return;
  }

  const [file] = event.dataTransfer.files;
  if (file) {
    dom.fileInput.files = event.dataTransfer.files;
    loadFile(file);
  }
});

async function loadFile(file) {
  const sourceType = detectSourceType(file);

  state.file = file;
  state.sourceType = sourceType;
  state.fileName = file.name;
  state.sheetName = sourceType === "csv" ? "CSV" : "Loading...";
  state.rowCount = 0;
  state.columns = [];
  state.previewRows = [];
  state.statusMessage = `Reading ${file.name}...`;
  renderState();

  updateBusy({
    isBusy: true,
    title: `Reading ${sourceType.toUpperCase()} file`,
    detail: "Preparing the Poneglyph scan...",
    progress: 0,
  });

  try {
    const summary = sourceType === "csv"
      ? await parseCsvPreview(file)
      : await parseWorkbookPreview(file);

    state.file = file;
    state.sourceType = sourceType;
    state.fileName = file.name;
    state.sheetName = summary.sheetName;
    state.rowCount = summary.rowCount;
    state.columns = summary.columns;
    state.previewRows = summary.previewRows;
    state.statusMessage = `Loaded ${formatNumber(summary.rowCount)} row(s) and ${formatNumber(summary.columns.length)} column(s) from ${file.name}. Preview shows the first ${Math.min(summary.rowCount, PREVIEW_LIMIT)} row(s).`;

    if (!dom.tableNameInput.value || dom.tableNameInput.value === "imported_data") {
      dom.tableNameInput.value = sanitizeIdentifier(stripExtension(file.name), "table");
    }

    renderState();
  } catch (error) {
    console.error(error);
    setError(error.message || "Could not read that file. Please upload a valid CSV or Excel document.");
  } finally {
    updateBusy({ isBusy: false, progress: 0 });
  }
}

function parseCsvPreview(file) {
  return new Promise((resolve, reject) => {
    let rowCount = 0;
    let schema = [];
    const previewRows = [];
    let lastProgress = -1;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      worker: true,
      chunkSize: CSV_CHUNK_SIZE,
      chunk(results) {
        if (!schema.length) {
          schema = getSchemaFromParsedChunk(results);
        }

        const normalizedRows = normalizeParsedRows(results.data, schema);
        rowCount += normalizedRows.length;

        if (previewRows.length < PREVIEW_LIMIT) {
          previewRows.push(...normalizedRows.slice(0, PREVIEW_LIMIT - previewRows.length));
        }

        const progress = getChunkProgress(results, file.size);
        if (progress !== lastProgress) {
          lastProgress = progress;
          updateBusy({
            isBusy: true,
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

async function parseWorkbookPreview(file) {
  updateBusy({
    isBusy: true,
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
  });

  updateBusy({
    isBusy: true,
    title: "Reading Excel file",
    detail: "Preparing preview rows...",
    progress: 75,
  });

  const { columns, rowArrays } = extractTabularData(matrix);

  if (!columns.length || !rowArrays.length) {
    throw new Error("The selected Excel file does not contain any data rows.");
  }

  const previewRows = rowArrays.slice(0, PREVIEW_LIMIT).map((row) => rowArrayToObject(columns, row));

  updateBusy({
    isBusy: true,
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

function exportCsvFile(file, format, tableName) {
  return new Promise((resolve, reject) => {
    const parts = [];
    let rowCount = 0;
    let schema = [];
    let sqlColumnMap = [];
    let hasJsonRows = false;
    let lastProgress = -1;

    if (format === "json") {
      parts.push("[\n");
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      worker: true,
      chunkSize: CSV_CHUNK_SIZE,
      chunk(results) {
        if (!schema.length) {
          schema = getSchemaFromParsedChunk(results);
          if (!schema.length) {
            return;
          }

          if (format === "sql") {
            const columns = schema.map(({ key }) => key);
            sqlColumnMap = buildSqlColumnMap(columns);
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

        const progress = getChunkProgress(results, file.size);
        if (progress !== lastProgress) {
          lastProgress = progress;
          updateBusy({
            isBusy: true,
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

async function exportWorkbookFile(file, format, tableName) {
  updateBusy({
    isBusy: true,
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
  });
  const { columns, rowArrays } = extractTabularData(matrix);

  if (!columns.length || !rowArrays.length) {
    throw new Error("There are no rows available to export.");
  }

  if (format === "json") {
    return buildJsonBlobFromRowArrays(columns, rowArrays);
  }

  return buildSqlBlobFromRowArrays(columns, rowArrays, tableName);
}

function buildJsonBlobFromRowArrays(columns, rowArrays) {
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
    updateBusy({
      isBusy: true,
      title: "Generating JSON output",
      detail: `${Math.min(progress, 100)}% complete • ${formatNumber(index + batch.length)} row(s) exported`,
      progress: Math.min(progress, 100),
    });
  }

  parts.push(hasRows ? "\n]\n" : "]\n");
  return new Blob(parts, { type: "application/json;charset=utf-8" });
}

function buildSqlBlobFromRowArrays(columns, rowArrays, tableName) {
  const sqlColumnMap = buildSqlColumnMap(columns);
  const parts = [buildCreateTableStatement(tableName, sqlColumnMap), "\n\n"];

  for (let index = 0; index < rowArrays.length; index += EXPORT_BATCH_SIZE) {
    const batch = rowArrays.slice(index, index + EXPORT_BATCH_SIZE)
      .map((row) => rowArrayToObject(columns, row));

    parts.push(buildInsertStatements(tableName, sqlColumnMap, batch), "\n");

    const progress = 20 + Math.round(((index + batch.length) / rowArrays.length) * 80);
    updateBusy({
      isBusy: true,
      title: "Generating SQL output",
      detail: `${Math.min(progress, 100)}% complete • ${formatNumber(index + batch.length)} row(s) exported`,
      progress: Math.min(progress, 100),
    });
  }

  return new Blob(parts, { type: "text/sql;charset=utf-8" });
}

function readWorkbook(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        resolve(XLSX.read(event.target.result, { type: "array", cellDates: true }));
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

function extractTabularData(matrix) {
  const [headerRow = [], ...bodyRows] = matrix;
  const columns = headerRow.map((header, index) => normalizeHeader(header, index));
  const rowArrays = bodyRows
    .map((row) => columns.map((_, index) => normalizeCellValue(row[index])))
    .filter((row) => hasMeaningfulArrayRow(row));

  return { columns, rowArrays };
}

function normalizeParsedRows(rows, schema) {
  return rows
    .map((row) => projectObjectRow(row, schema))
    .filter((row) => hasMeaningfulObjectRow(row, schema.map(({ key }) => key)));
}

function getSchemaFromParsedChunk(results) {
  const fields = results.meta.fields ?? [];
  if (fields.length) {
    return buildCsvSchema(fields);
  }

  const firstRow = results.data.find((row) => row && typeof row === "object");
  return firstRow ? buildCsvSchema(Object.keys(firstRow)) : [];
}

function buildCsvSchema(fields) {
  const used = new Map();

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

function projectObjectRow(row, schema) {
  const normalized = {};

  schema.forEach(({ sourceKey, key }) => {
    normalized[key] = normalizeCellValue(row?.[sourceKey]);
  });

  return normalized;
}

function rowArrayToObject(columns, row) {
  const normalized = {};

  columns.forEach((column, index) => {
    normalized[column] = normalizeCellValue(row[index]);
  });

  return normalized;
}

function buildSqlColumnMap(columns) {
  const safeColumns = makeUniqueIdentifiers(columns);
  return columns.map((original, index) => ({
    original,
    safe: safeColumns[index],
  }));
}

function buildCreateTableStatement(tableName, columnMap) {
  return [
    `CREATE TABLE ${tableName} (`,
    columnMap.map(({ safe }) => `  ${safe} TEXT`).join(",\n"),
    `);`,
  ].join("\n");
}

function buildInsertStatements(tableName, columnMap, rows) {
  return rows.map((row) => {
    const columnList = columnMap.map(({ safe }) => safe).join(", ");
    const values = columnMap
      .map(({ original }) => toSqlValue(row[original]))
      .join(", ");
    return `INSERT INTO ${tableName} (${columnList}) VALUES (${values});`;
  }).join("\n");
}

function updateBusy({
  isBusy = state.isBusy,
  title = state.busyTitle,
  detail = state.busyDetail,
  progress = state.progress,
}) {
  state.isBusy = isBusy;
  state.busyTitle = title;
  state.busyDetail = detail;
  state.progress = Math.max(0, Math.min(progress, 100));
  renderBusy();
  renderState();
}

function renderState() {
  dom.fileName.textContent = state.fileName || "No file loaded";
  dom.rowCount.textContent = formatNumber(state.rowCount);
  dom.columnCount.textContent = formatNumber(state.columns.length);
  dom.sheetName.textContent = state.sheetName || "-";
  dom.statusMessage.textContent = state.statusMessage;
  dom.downloadButton.disabled = !state.file || !state.rowCount || state.isBusy;
  dom.fileInput.disabled = state.isBusy;
  dom.formatButton.disabled = state.isBusy;
  dom.tableNameInput.disabled = state.isBusy;
  dom.dropzone.classList.toggle("is-active", false);

  if (state.isBusy) {
    state.isFormatMenuOpen = false;
  }

  dom.dropzone.classList.toggle("is-disabled", state.isBusy);
  renderFormatDropdown();

  if (!state.previewRows.length) {
    dom.tableWrap.innerHTML = `
      <div class="flex min-h-64 items-center justify-center px-6 py-10 text-center text-sm text-slate-400">
        No preview yet.
      </div>
    `;
    return;
  }

  const head = state.columns
    .map(
      (column) =>
        `<th class="px-5 py-4 text-left text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-gold-200/80">${escapeHtml(column)}</th>`,
    )
    .join("");

  const body = state.previewRows
    .map((row) => {
      const cells = state.columns
        .map(
          (column) =>
            `<td class="border-t border-white/5 px-5 py-4 text-sm text-slate-200">${escapeHtml(String(row[column] ?? ""))}</td>`,
        )
        .join("");
      return `<tr class="hover:bg-white/[0.03]">${cells}</tr>`;
    })
    .join("");

  dom.tableWrap.innerHTML = `
    <div class="max-h-[32rem] overflow-auto">
      <table class="preview-table min-w-full border-separate border-spacing-0">
        <thead class="sticky top-0 z-10 bg-slate-950/95 backdrop-blur">
          <tr>${head}</tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </div>
  `;
}
function renderFormatDropdown() {
  const currentLabel = state.selectedFormat.toUpperCase();
  dom.formatValue.textContent = currentLabel;
  dom.formatButton.setAttribute("aria-expanded", String(state.isFormatMenuOpen));
  dom.formatDropdown.classList.toggle("is-open", state.isFormatMenuOpen);
  dom.formatMenu.classList.toggle("hidden", !state.isFormatMenuOpen);

  dom.formatMenu.querySelectorAll("[data-format-option]").forEach((option) => {
    const isActive = option.dataset.formatOption === state.selectedFormat;
    option.classList.toggle("is-active", isActive);
    option.setAttribute("aria-selected", String(isActive));
  });
}

function setFormatMenuOpen(isOpen) {
  if (state.isBusy) {
    state.isFormatMenuOpen = false;
  } else {
    state.isFormatMenuOpen = isOpen;
  }

  renderFormatDropdown();
}

function renderBusy() {
  dom.loader.classList.toggle("hidden", !state.isBusy);
  dom.loader.classList.toggle("flex", state.isBusy);
  dom.loaderTitle.textContent = state.busyTitle;
  dom.loaderDetail.textContent = state.busyDetail;
  dom.loaderBar.style.width = `${state.progress}%`;
}

function setError(message) {
  state.file = null;
  state.sourceType = "";
  state.fileName = "";
  state.sheetName = "";
  state.rowCount = 0;
  state.columns = [];
  state.previewRows = [];
  state.statusMessage = message;
  renderState();
}

function detectSourceType(file) {
  return getFileExtension(file.name) === "csv" ? "csv" : "workbook";
}

function getFileExtension(fileName) {
  const match = String(fileName || "").toLowerCase().match(/\.([^.]+)$/);
  return match ? match[1] : "";
}

function getChunkProgress(results, size) {
  const cursor = results.meta.cursor ?? 0;
  if (!size) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round((cursor / size) * 100)));
}

function normalizeHeader(value, index) {
  const text = String(value ?? "").trim().replace(/\s+/g, " ");
  return text || `Column ${index + 1}`;
}

function normalizeCellValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  const text = typeof value === "string" ? value.trim() : String(value);
  return /^'\d/.test(text) ? text.slice(1) : text;
}

function hasMeaningfulObjectRow(row, columns) {
  return columns.some((column) => String(row[column] ?? "").trim() !== "");
}

function hasMeaningfulArrayRow(row) {
  return row.some((value) => String(value ?? "").trim() !== "");
}

function sanitizeIdentifier(value, fallbackPrefix = "field") {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  if (!normalized) {
    return fallbackPrefix;
  }

  if (/^[0-9]/.test(normalized)) {
    return `${fallbackPrefix}_${normalized}`;
  }

  return normalized;
}

function makeUniqueIdentifiers(columns) {
  const used = new Map();

  return columns.map((column, index) => {
    const fallback = `column_${index + 1}`;
    const base = sanitizeIdentifier(column, fallback);
    const nextIndex = used.get(base) ?? 0;
    used.set(base, nextIndex + 1);
    return nextIndex === 0 ? base : `${base}_${nextIndex + 1}`;
  });
}

function toSqlValue(value) {
  if (value === null || value === undefined || value === "") {
    return "NULL";
  }

  const stringValue = String(value).replace(/'/g, "''");
  return `'${stringValue}'`;
}

function stripExtension(fileName) {
  return String(fileName || "").replace(/\.[^.]+$/, "");
}

function formatNumber(value) {
  return new Intl.NumberFormat().format(value || 0);
}

function downloadBlob(fileName, blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

renderBusy();
renderState();








