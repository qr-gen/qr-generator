import type { FrameConfig } from '../types';
import { escapeXml } from './helpers';

export interface FrameLayout {
  /** The effective area for the QR code (x, y, size) */
  qrX: number;
  qrY: number;
  qrSize: number;
}

/**
 * Compute the frame layout: how much space the frame + label consume,
 * and where the QR code should be placed within the total canvas.
 */
export function computeFrameLayout(
  totalSize: number,
  frame: FrameConfig,
  fgColor: string,
): FrameLayout {
  const thickness = frame.thickness ?? Math.round(totalSize / 30);
  const padding = frame.padding ?? Math.round(totalSize / 25);
  const labelFontSize = frame.labelFontSize ?? Math.round(totalSize * 0.05);
  const labelHeight = frame.label ? Math.round(labelFontSize * 1.8) : 0;

  const inset = thickness + padding;
  const qrSize = totalSize - inset * 2 - labelHeight;

  let qrX = inset;
  let qrY = inset;

  if (frame.label) {
    if (frame.labelPosition === 'top') {
      qrY = inset + labelHeight;
    }
    // 'bottom' (default): QR stays at top, label goes below
  }

  return { qrX, qrY, qrSize: Math.max(qrSize, 1) };
}

/**
 * Render the frame border SVG elements.
 */
export function renderFrameSVG(
  totalSize: number,
  frame: FrameConfig,
  fgColor: string,
): string {
  const parts: string[] = [];
  const thickness = frame.thickness ?? Math.round(totalSize / 30);
  const padding = frame.padding ?? Math.round(totalSize / 25);
  const labelFontSize = frame.labelFontSize ?? Math.round(totalSize * 0.05);
  const labelHeight = frame.label ? Math.round(labelFontSize * 1.8) : 0;
  const frameColor = frame.color ?? fgColor;

  const halfStroke = thickness / 2;
  const rx = frame.style === 'rounded' ? Math.round(totalSize * 0.04) : 0;

  // Frame border (stroke rect)
  if (rx > 0) {
    parts.push(
      `<rect x="${halfStroke}" y="${halfStroke}" width="${totalSize - thickness}" height="${totalSize - thickness}" rx="${rx}" ry="${rx}" fill="none" stroke="${frameColor}" stroke-width="${thickness}"/>`,
    );
  } else {
    parts.push(
      `<rect x="${halfStroke}" y="${halfStroke}" width="${totalSize - thickness}" height="${totalSize - thickness}" fill="none" stroke="${frameColor}" stroke-width="${thickness}"/>`,
    );
  }

  // Label
  if (frame.label) {
    const labelColor = frame.labelColor ?? fgColor;
    const escaped = escapeXml(frame.label);
    const cx = totalSize / 2;

    let labelY: number;
    if (frame.labelPosition === 'top') {
      // Label at top, above QR
      labelY = thickness + padding + labelFontSize;
    } else {
      // Label at bottom (default), below QR
      labelY = totalSize - thickness - padding + labelFontSize * 0.3;
    }

    parts.push(
      `<text x="${cx}" y="${labelY}" text-anchor="middle" font-family="sans-serif" font-size="${labelFontSize}" font-weight="bold" fill="${labelColor}">${escaped}</text>`,
    );
  }

  return parts.join('');
}
