import type { RenderOptions, GradientConfig } from '../types';
import { svgRect, svgDocument } from './helpers';
import { renderModule } from './shapes';
import { renderGradientDef, getGradientId } from './gradients';
import { computeLogoBounds, isModuleInLogoBounds, renderLogoImage, renderLogoClearZone } from './logo';
import { validateRenderOptions } from '../validation/validate';

/**
 * Render a QR matrix as an SVG string.
 */
export function renderSVG(matrix: number[][], options: RenderOptions): string {
  const {
    size,
    fgColor = '#000000',
    bgColor = '#ffffff',
    shape = 'square',
    margin = 4,
    logo,
    skipValidation = false,
    finderShape,
    finderColor,
    moduleTypes,
  } = options;

  // Run validation unless explicitly skipped
  if (!skipValidation) {
    const result = validateRenderOptions(options);
    const errors = result.issues.filter(i => i.severity === 'error');
    if (errors.length > 0) {
      throw new Error(`QR validation failed: ${errors.map(e => e.message).join('; ')}`);
    }
  }

  const matrixSize = matrix.length;
  const totalModules = matrixSize + margin * 2;
  const moduleSize = size / totalModules;

  const parts: string[] = [];
  const defs: string[] = [];

  // Resolve foreground color (string or gradient)
  let fgFill: string;
  if (typeof fgColor === 'string') {
    fgFill = fgColor;
  } else {
    defs.push(renderGradientDef(fgColor as GradientConfig, 'fg'));
    fgFill = getGradientId('fg');
  }

  // Resolve finder color (string or gradient) — only when moduleTypes is available
  let finderFill: string | null = null;
  if (finderColor && moduleTypes) {
    if (typeof finderColor === 'string') {
      finderFill = finderColor;
    } else {
      defs.push(renderGradientDef(finderColor as GradientConfig, 'finder'));
      finderFill = getGradientId('finder');
    }
  }

  // Background
  parts.push(svgRect(0, 0, size, size, bgColor));

  // Compute logo bounds if logo is present
  const logoBounds = logo
    ? computeLogoBounds(logo, size, logo.padding ?? moduleSize * 2)
    : null;

  // Render each dark module (skip modules behind logo)
  for (let row = 0; row < matrixSize; row++) {
    for (let col = 0; col < matrixSize; col++) {
      if (matrix[row][col] === 1) {
        const x = (col + margin) * moduleSize;
        const y = (row + margin) * moduleSize;

        if (logoBounds && isModuleInLogoBounds(x, y, moduleSize, logoBounds)) {
          continue;
        }

        // Determine if this is a finder module
        const isFinder = moduleTypes && (
          moduleTypes[row][col] === 1 || moduleTypes[row][col] === 7
        );
        const moduleShape = (isFinder && finderShape) ? finderShape : shape;
        const moduleFill = (isFinder && finderFill) ? finderFill : fgFill;

        parts.push(renderModule(x, y, moduleSize, moduleShape, moduleFill));
      }
    }
  }

  // Render logo clear zone and image
  if (logoBounds && logo) {
    parts.push(renderLogoClearZone(
      logoBounds.clearX, logoBounds.clearY,
      logoBounds.clearWidth, logoBounds.clearHeight,
      bgColor,
    ));
    parts.push(renderLogoImage(
      logoBounds.x, logoBounds.y,
      logoBounds.width, logoBounds.height,
      logo.src,
    ));
  }

  const defsStr = defs.length > 0 ? `<defs>${defs.join('')}</defs>` : '';
  return svgDocument(size, size, defsStr + parts.join(''));
}
