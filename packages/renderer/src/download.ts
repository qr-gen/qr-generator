import type { CreateQRResult } from './create-qr';

export type DownloadFormat = 'svg' | 'png' | 'bmp';

export interface DownloadOptions {
  filename?: string;
  format?: DownloadFormat;
}

const MIME_TYPES: Record<DownloadFormat, string> = {
  svg: 'image/svg+xml',
  png: 'image/png',
  bmp: 'image/bmp',
};

/**
 * Trigger a browser file download for a QR code result.
 * Browser-only — throws in SSR/Node environments.
 */
export function downloadQR(result: CreateQRResult, options?: DownloadOptions): void {
  if (typeof document === 'undefined') {
    throw new Error('downloadQR() requires a browser environment with document access.');
  }

  const fmt = options?.format ?? inferFormat(result.format);
  const filename = options?.filename ?? `qr-code.${fmt}`;
  const blob = result.toBlob(fmt);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

function inferFormat(outputFormat: string): DownloadFormat {
  if (outputFormat === 'svg') return 'svg';
  if (outputFormat === 'bmp') return 'bmp';
  return 'png'; // default for png, data-uri, etc.
}
