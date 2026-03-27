import { generateQR } from '@qr-gen/core';
import type { ErrorCorrectionLevel } from '@qr-gen/core';
import type { RenderOptions, ValidationResult } from './types';
import { renderSVG } from './svg/renderer';
import { renderPNG } from './png/renderer';
import { renderBMP } from './bmp/renderer';
import { renderDataURI } from './data-uri/renderer';
import { validateRenderOptions } from './validation/validate';

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
  const ecLevel: ErrorCorrectionLevel = hasLogo
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

  // Build render options with skipValidation since we already ran it
  const opts: RenderOptions = { ...restRenderOptions, skipValidation: true, moduleTypes: qr.moduleTypes };

  // Render in the requested format
  let output: string | Uint8Array;
  switch (format) {
    case 'svg':
      output = renderSVG(qr.matrix, opts);
      break;
    case 'png':
      output = renderPNG(qr.matrix, opts);
      break;
    case 'bmp':
      output = renderBMP(qr.matrix, opts);
      break;
    case 'data-uri':
      output = renderDataURI(qr.matrix, opts);
      break;
  }

  return {
    data: output,
    format,
    version: qr.version,
    errorCorrection: qr.errorCorrection,
    size: qr.size,
    validation,
  };
}
