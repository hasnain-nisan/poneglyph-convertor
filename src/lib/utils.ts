export function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value || 0);
}

export function stripExtension(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, "");
}

export function sanitizeIdentifier(value: string, fallbackPrefix = "field"): string {
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

export function getChunkProgress(cursor: number | undefined, size: number): number {
  if (!size) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(((cursor ?? 0) / size) * 100)));
}
