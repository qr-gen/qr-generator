import type { RenderOptions, ValidationIssue, ValidationResult } from '../types';
import type { ErrorCorrectionLevel } from '@qr-gen/core';
import { contrastRatio } from './contrast';

const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function isValidHex(color: string): boolean {
  return HEX_RE.test(color);
}

/**
 * Validate render options for QR scannability.
 * Returns a structured result with issues found.
 *
 * @param options - The render options to validate
 * @param ecLevel - The error correction level used to generate the matrix (optional, for EC check)
 */
export function validateRenderOptions(
  options: RenderOptions,
  ecLevel?: ErrorCorrectionLevel,
  matrixSize?: number,
): ValidationResult {
  const issues: ValidationIssue[] = [];
  const fgColor = options.fgColor ?? '#000000';
  const bgColor = options.bgColor ?? '#ffffff';

  // Validate color formats
  if (typeof fgColor === 'string' && !isValidHex(fgColor)) {
    issues.push({
      code: 'INVALID_COLOR',
      severity: 'error',
      message: `Invalid foreground color: "${fgColor}". Use #RGB or #RRGGBB format.`,
    });
  }
  if (!isValidHex(bgColor)) {
    issues.push({
      code: 'INVALID_COLOR',
      severity: 'error',
      message: `Invalid background color: "${bgColor}". Use #RGB or #RRGGBB format.`,
    });
  }

  // Contrast check (only for solid fg colors)
  if (typeof fgColor === 'string' && isValidHex(fgColor) && isValidHex(bgColor)) {
    const ratio = contrastRatio(fgColor, bgColor);
    if (ratio < 4.5) {
      issues.push({
        code: 'CONTRAST_TOO_LOW',
        severity: 'error',
        message: `Contrast ratio ${ratio.toFixed(2)} is below the minimum 4.5. QR may not be scannable.`,
      });
    }
  }

  // Logo validations
  if (options.logo) {
    const qrArea = options.size * options.size;
    const logoArea = options.logo.width * options.logo.height;
    if (logoArea / qrArea > 0.20) {
      issues.push({
        code: 'LOGO_TOO_LARGE',
        severity: 'error',
        message: `Logo area (${logoArea}px²) exceeds 20% of QR area (${qrArea}px²). QR may not be scannable.`,
      });
    }

    if (ecLevel && ecLevel !== 'H') {
      issues.push({
        code: 'EC_NOT_H_WITH_LOGO',
        severity: 'warning',
        message: `Error correction level "${ecLevel}" is not "H". Logo may obscure too many modules for reliable scanning.`,
      });
    }
  }

  // Shape scan risk
  if (options.shape === 'dots' && ecLevel && ecLevel !== 'H') {
    issues.push({
      code: 'SHAPE_SCAN_RISK',
      severity: 'warning',
      message: 'Dots shape may reduce scannability. Consider using error correction level H.',
    });
  }

  // Module too small
  if (matrixSize && options.shape && options.shape !== 'square') {
    const modulePixelSize = options.size / (matrixSize + (options.margin ?? 4) * 2);
    if (modulePixelSize < 3) {
      issues.push({
        code: 'MODULE_TOO_SMALL',
        severity: 'warning',
        message: 'Module pixel size is very small for non-square shapes. Scanning may be unreliable.',
      });
    }
  }

  return {
    valid: issues.every(i => i.severity !== 'error'),
    issues,
  };
}
