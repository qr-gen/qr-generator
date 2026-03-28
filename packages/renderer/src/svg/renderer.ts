import type { RenderOptions, GradientConfig } from '../types';
import { svgRect, svgRoundedRect, svgCircle, svgDocument } from './helpers';
import { renderModule } from './shapes';
import { renderGradientDef, getGradientId } from './gradients';
import { computeLogoBounds, isModuleInLogoBounds, renderLogoImage, renderLogoClearZone } from './logo';
import { validateRenderOptions } from '../validation/validate';
import { computeFrameLayout, renderFrameSVG } from './frame';

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
    overlayImage,
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
  const frame = options.frame;
  const fgColorStr = typeof fgColor === 'string' ? fgColor : '#000000';

  // Compute frame layout: determines effective QR area within the total canvas
  const frameLayout = frame ? computeFrameLayout(size, frame, fgColorStr) : null;
  const effectiveQRSize = frameLayout ? frameLayout.qrSize : size;
  const qrOffsetX = frameLayout ? frameLayout.qrX : 0;
  const qrOffsetY = frameLayout ? frameLayout.qrY : 0;

  const totalModules = matrixSize + margin * 2;
  const moduleSize = effectiveQRSize / totalModules;

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

  // Resolve finder outer/inner colors with fallback chain:
  // finderOuterColor ?? finderColor ?? fgColor (similarly for inner)
  const resolvedFinderOuterColor = options.finderOuterColor ?? finderColor;
  const resolvedFinderInnerColor = options.finderInnerColor ?? finderColor;

  let finderOuterFill: string | null = null;
  if (resolvedFinderOuterColor && moduleTypes) {
    if (typeof resolvedFinderOuterColor === 'string') {
      finderOuterFill = resolvedFinderOuterColor;
    } else {
      defs.push(renderGradientDef(resolvedFinderOuterColor as GradientConfig, 'finder-outer'));
      finderOuterFill = getGradientId('finder-outer');
    }
  }

  let finderInnerFill: string | null = null;
  if (resolvedFinderInnerColor && moduleTypes) {
    if (typeof resolvedFinderInnerColor === 'string') {
      finderInnerFill = resolvedFinderInnerColor;
    } else {
      defs.push(renderGradientDef(resolvedFinderInnerColor as GradientConfig, 'finder-inner'));
      finderInnerFill = getGradientId('finder-inner');
    }
  }

  // Resolve finder outer/inner shapes
  const finderOuterShapeResolved = options.finderOuterShape ?? finderShape;
  const finderInnerShapeResolved = options.finderInnerShape ?? finderShape;

  const isTransparentBg = bgColor === 'transparent';
  const bgOpacity = options.bgOpacity;
  const borderRadius = options.borderRadius ?? 0;

  // ClipPath for rounded border (applies to QR area, not frame)
  if (borderRadius > 0 && !frame) {
    defs.push(`<clipPath id="qr-clip"><rect x="0" y="0" width="${effectiveQRSize}" height="${effectiveQRSize}" rx="${borderRadius}" ry="${borderRadius}"/></clipPath>`);
  }

  // Background (skip for transparent)
  // When frame is present, background fills only the QR area (within the translate group)
  const bgWidth = effectiveQRSize;
  const bgHeight = effectiveQRSize;
  if (!isTransparentBg) {
    const opacityAttr = (bgOpacity !== undefined && bgOpacity < 1) ? ` opacity="${bgOpacity}"` : '';
    if (borderRadius > 0 && !frame) {
      parts.push(`<rect x="0" y="0" width="${bgWidth}" height="${bgHeight}" rx="${borderRadius}" ry="${borderRadius}" fill="${bgColor}"${opacityAttr}/>`);
    } else if (opacityAttr) {
      parts.push(`<rect x="0" y="0" width="${bgWidth}" height="${bgHeight}" fill="${bgColor}"${opacityAttr}/>`);
    } else {
      parts.push(svgRect(0, 0, bgWidth, bgHeight, bgColor));
    }
  }

  // Overlay image (rendered after bg, before modules)
  if (overlayImage && overlayImage.src) {
    const opacity = overlayImage.opacity ?? 0.3;
    parts.push(
      `<image href="${overlayImage.src}" x="0" y="0" width="${effectiveQRSize}" height="${effectiveQRSize}" preserveAspectRatio="xMidYMid slice" opacity="${opacity}"/>`,
    );

    // Render finder background areas for scannability protection
    const finderBgColor = overlayImage.finderBackgroundColor ?? (isTransparentBg ? '#ffffff' : bgColor);
    if (moduleTypes) {
      const finderCenters = [
        { row: 3, col: 3 },
        { row: 3, col: matrixSize - 4 },
        { row: matrixSize - 4, col: 3 },
      ];
      for (const { row, col } of finderCenters) {
        if (finderShape === 'circle') {
          // Circular background for circle finders
          const cx = (col + margin) * moduleSize + moduleSize / 2;
          const cy = (row + margin) * moduleSize + moduleSize / 2;
          parts.push(svgCircle(cx, cy, 4.5 * moduleSize, finderBgColor));
        } else {
          // Rectangular background for square/rounded finders
          const fx = (col - 3 + margin) * moduleSize - moduleSize;
          const fy = (row - 3 + margin) * moduleSize - moduleSize;
          const fSize = 9 * moduleSize;
          parts.push(svgRect(fx, fy, fSize, fSize, finderBgColor));
        }
      }
    }
  }

  // Compute logo bounds if logo is present
  const logoBounds = logo
    ? computeLogoBounds(logo, effectiveQRSize, logo.padding ?? moduleSize * 2)
    : null;

  // Circle finder patterns: render as concentric circles, skip per-module finder rendering
  const useCircleFinders = finderShape === 'circle' && moduleTypes;
  if (useCircleFinders) {
    const finderCenters = [
      { row: 3, col: 3 },                            // top-left
      { row: 3, col: matrixSize - 4 },                // top-right
      { row: matrixSize - 4, col: 3 },                // bottom-left
    ];
    const outerFill = finderOuterFill ?? fgFill;
    const innerFill = finderInnerFill ?? fgFill;
    for (const { row, col } of finderCenters) {
      const cx = (col + margin) * moduleSize + moduleSize / 2;
      const cy = (row + margin) * moduleSize + moduleSize / 2;
      const gapColor = isTransparentBg ? '#ffffff' : bgColor;
      parts.push(svgCircle(cx, cy, 3.5 * moduleSize, outerFill));  // outer
      parts.push(svgCircle(cx, cy, 2.5 * moduleSize, gapColor));    // gap
      parts.push(svgCircle(cx, cy, 1.5 * moduleSize, innerFill));  // inner
    }
  }

  // Module scale: shrink modules within their grid cell (finders exempt)
  const scale = options.moduleScale ?? 1;

  // Render each dark module (skip modules behind logo)
  for (let row = 0; row < matrixSize; row++) {
    for (let col = 0; col < matrixSize; col++) {
      if (matrix[row][col] === 1) {
        const x = (col + margin) * moduleSize;
        const y = (row + margin) * moduleSize;

        if (logoBounds && isModuleInLogoBounds(x, y, moduleSize, logoBounds)) {
          continue;
        }

        // Determine if this is a finder module (FINDER=1, SEPARATOR=7, FINDER_INNER=8)
        const isFinder = moduleTypes && (
          moduleTypes[row][col] === 1 || moduleTypes[row][col] === 7 || moduleTypes[row][col] === 8
        );

        // Skip individual finder modules when using circle finders
        if (useCircleFinders && isFinder) {
          continue;
        }

        // Apply scale (finders are NOT scaled for scanning reliability)
        const adjustedSize = isFinder ? moduleSize : moduleSize * scale;
        const offsetX = isFinder ? x : x + (moduleSize - adjustedSize) / 2;
        const offsetY = isFinder ? y : y + (moduleSize - adjustedSize) / 2;

        // Custom module renderer callback
        if (options.customModule) {
          const result = options.customModule({
            x: offsetX, y: offsetY, size: adjustedSize,
            row, col,
            moduleType: moduleTypes ? moduleTypes[row][col] : 0,
          });
          if (result != null) {
            parts.push(result);
            continue;
          }
          // null = fall through to default rendering
        }

        // Determine shape and color based on module type
        const isFinderInner = moduleTypes && moduleTypes[row][col] === 8;
        let moduleShape = shape;
        let moduleFill = fgFill;

        if (isFinder) {
          if (isFinderInner) {
            const innerShape = finderInnerShapeResolved;
            moduleShape = (innerShape && innerShape !== 'circle') ? innerShape : shape;
            moduleFill = finderInnerFill ?? fgFill;
          } else {
            const outerShape = finderOuterShapeResolved;
            moduleShape = (outerShape && outerShape !== 'circle') ? outerShape : shape;
            moduleFill = finderOuterFill ?? fgFill;
          }
        }

        parts.push(renderModule(offsetX, offsetY, adjustedSize, moduleShape, moduleFill));
      }
    }
  }

  // Render logo clear zone and image
  if (logoBounds && logo) {
    if (!isTransparentBg) {
      parts.push(renderLogoClearZone(
        logoBounds.clearX, logoBounds.clearY,
        logoBounds.clearWidth, logoBounds.clearHeight,
        bgColor,
      ));
    }
    parts.push(renderLogoImage(
      logoBounds.x, logoBounds.y,
      logoBounds.width, logoBounds.height,
      logo.src,
    ));
  }

  const defsStr = defs.length > 0 ? `<defs>${defs.join('')}</defs>` : '';

  // Assemble QR content
  let qrContent = parts.join('');

  // Apply border radius clipping
  if (borderRadius > 0) {
    qrContent = `<g clip-path="url(#qr-clip)">${qrContent}</g>`;
  }

  // Apply frame offset: translate QR content into frame area
  if (frameLayout) {
    qrContent = `<g transform="translate(${qrOffsetX},${qrOffsetY})">${qrContent}</g>`;
  }

  // Add frame border and label (at canvas level, outside QR translate)
  let frameContent = '';
  if (frame) {
    frameContent = renderFrameSVG(size, frame, fgColorStr);
  }

  const title = options.title !== undefined ? options.title : 'QR Code';
  return svgDocument(size, size, defsStr + frameContent + qrContent, title || undefined);
}
