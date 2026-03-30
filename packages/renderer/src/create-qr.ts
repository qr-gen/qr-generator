import { generateQR } from '@qr-kit/core';
import type { ErrorCorrectionLevel } from '@qr-kit/core';
import type { RenderOptions, ValidationResult } from './types';
import { renderSVG } from './svg/renderer';
import { renderPNG } from './png/renderer';
import { renderBMP } from './bmp/renderer';
import { renderDataURI } from './data-uri/renderer';
import type { DataURIFormat } from './data-uri/renderer';
import { validateRenderOptions } from './validation/validate';
import { downloadQR } from './download';
import type { DownloadOptions, DownloadFormat } from './download';
import { applyHalftone } from './halftone/index';
import { computeLogoBounds } from './svg/logo';

export type OutputFormat = 'svg' | 'png' | 'bmp' | 'data-uri';

export interface CreateQROptions {
  errorCorrection?: ErrorCorrectionLevel;
  version?: number;
}

export interface CreateQRResult {
  data: string | Uint8Array;
  format: OutputFormat;
  version: number;
  errorCorrection: ErrorCorrectionLevel;
  size: number;
  validation: ValidationResult;
  /** Get the QR code as a data URL string. Works in all environments. */
  toDataURL(format?: DownloadFormat): string;
  /** Get the QR code as a Blob. Browser-only. */
  toBlob(format?: DownloadFormat): Blob;
  /** Trigger a file download in the browser. Browser-only. */
  download(options?: DownloadOptions): void;
}

/**
 * Unified convenience function that orchestrates QR generation + rendering
 * in any supported output format.
 *
 * Automatically upgrades EC to 'H' when a logo is present.
 * Default format is 'svg' for backward compatibility.
 */
export function createQR(
  data: string,
  renderOptions: RenderOptions & { format?: OutputFormat },
  qrOptions?: CreateQROptions,
): CreateQRResult {
  const { format = 'svg', ...restRenderOptions } = renderOptions;

  const hasLogo = !!restRenderOptions.logo;
  const hasOverlay = !!restRenderOptions.overlayImage;
  const hasHalftone = !!restRenderOptions.halftone;
  const ecLevel: ErrorCorrectionLevel = (hasLogo || hasOverlay || hasHalftone)
    ? 'H'
    : qrOptions?.errorCorrection ?? 'M';

  // Validate render options
  const validation = validateRenderOptions(restRenderOptions, ecLevel);

  if (!restRenderOptions.skipValidation) {
    const errors = validation.issues.filter(i => i.severity === 'error');
    if (errors.length > 0) {
      throw new Error(`QR validation failed: ${errors.map(e => e.message).join('; ')}`);
    }
  }

  // Generate QR matrix with the (potentially upgraded) EC level
  const qr = generateQR({
    data,
    errorCorrection: ecLevel,
    version: qrOptions?.version,
  });

  // Apply halftone effect if configured
  let matrix = qr.matrix;
  if (hasHalftone && restRenderOptions.halftone) {
    let logoRegion: { x: number; y: number; width: number; height: number } | undefined;
    if (hasLogo && restRenderOptions.logo) {
      const moduleSize = restRenderOptions.size / (qr.size + (restRenderOptions.margin ?? 4) * 2);
      const marginPx = (restRenderOptions.margin ?? 4) * moduleSize;
      const bounds = computeLogoBounds(restRenderOptions.logo, restRenderOptions.size, moduleSize);
      // Convert pixel bounds to module coordinates
      logoRegion = {
        x: Math.floor((bounds.clearX - marginPx) / moduleSize),
        y: Math.floor((bounds.clearY - marginPx) / moduleSize),
        width: Math.ceil(bounds.clearWidth / moduleSize),
        height: Math.ceil(bounds.clearHeight / moduleSize),
      };
    }
    const halftoneResult = applyHalftone(
      qr.matrix,
      qr.moduleTypes,
      restRenderOptions.halftone,
      logoRegion,
    );
    matrix = halftoneResult.matrix;
  }

  // Build render options with skipValidation since we already ran it
  const opts: RenderOptions = { ...restRenderOptions, skipValidation: true, moduleTypes: qr.moduleTypes };

  // Render in the requested format
  let output: string | Uint8Array;
  switch (format) {
    case 'svg':
      output = renderSVG(matrix, opts);
      break;
    case 'png':
      output = renderPNG(matrix, opts);
      break;
    case 'bmp':
      output = renderBMP(matrix, opts);
      break;
    case 'data-uri':
      output = renderDataURI(matrix, opts);
      break;
  }

  const MIME_TYPES: Record<DownloadFormat, string> = {
    svg: 'image/svg+xml',
    png: 'image/png',
    bmp: 'image/bmp',
  };

  const result: CreateQRResult = {
    data: output,
    format,
    version: qr.version,
    errorCorrection: qr.errorCorrection,
    size: qr.size,
    validation,

    toDataURL(fmt: DataURIFormat = 'png'): string {
      return renderDataURI(matrix, opts, fmt);
    },

    toBlob(fmt: DownloadFormat = 'png'): Blob {
      if (typeof Blob === 'undefined') {
        throw new Error('toBlob() requires a browser environment with Blob support.');
      }
      if (fmt === 'svg') {
        return new Blob([renderSVG(matrix, opts)], { type: MIME_TYPES[fmt] });
      }
      const bytes = fmt === 'bmp' ? renderBMP(matrix, opts) : renderPNG(matrix, opts);
      return new Blob([bytes as BlobPart], { type: MIME_TYPES[fmt] });
    },

    download(downloadOpts?: DownloadOptions): void {
      downloadQR(result, downloadOpts);
    },
  };

  return result;
}
