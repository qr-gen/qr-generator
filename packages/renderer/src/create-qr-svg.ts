import { generateQR } from '@qr-kit/core';
import type { ErrorCorrectionLevel } from '@qr-kit/core';
import type { RenderOptions, ValidationResult } from './types';
import { renderSVG } from './svg/renderer';
import { validateRenderOptions } from './validation/validate';
import { applyHalftone } from './halftone/index';
import { computeLogoBounds } from './svg/logo';

export interface CreateQROptions {
  errorCorrection?: ErrorCorrectionLevel;
  version?: number;
}

export interface CreateQRSVGResult {
  svg: string;
  version: number;
  errorCorrection: ErrorCorrectionLevel;
  size: number;
  validation: ValidationResult;
}

/**
 * Convenience function that orchestrates QR generation + SVG rendering.
 * Automatically upgrades EC to 'H' when a logo is present.
 */
export function createQRSVG(
  data: string,
  renderOptions: RenderOptions,
  qrOptions?: CreateQROptions,
): CreateQRSVGResult {
  const hasLogo = !!renderOptions.logo;
  const hasHalftone = !!renderOptions.halftone;
  const ecLevel: ErrorCorrectionLevel = (hasLogo || hasHalftone)
    ? 'H'
    : qrOptions?.errorCorrection ?? 'M';

  // Validate render options
  const validation = validateRenderOptions(renderOptions, ecLevel);

  if (!renderOptions.skipValidation) {
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
  if (hasHalftone && renderOptions.halftone) {
    let logoRegion: { x: number; y: number; width: number; height: number } | undefined;
    if (hasLogo && renderOptions.logo) {
      const moduleSize = renderOptions.size / (qr.size + (renderOptions.margin ?? 4) * 2);
      const marginPx = (renderOptions.margin ?? 4) * moduleSize;
      const bounds = computeLogoBounds(renderOptions.logo, renderOptions.size, moduleSize);
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
      renderOptions.halftone,
      logoRegion,
    );
    matrix = halftoneResult.matrix;
  }

  // Render SVG (skip validation since we already ran it)
  const svg = renderSVG(matrix, { ...renderOptions, skipValidation: true, moduleTypes: qr.moduleTypes });

  return {
    svg,
    version: qr.version,
    errorCorrection: qr.errorCorrection,
    size: qr.size,
    validation,
  };
}
