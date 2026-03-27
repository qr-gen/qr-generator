export { parseHexColor } from '../utils/color';
import { parseHexColor } from '../utils/color';

/**
 * Calculate relative luminance per WCAG 2.0.
 */
function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate WCAG contrast ratio between two hex colors.
 * Returns a value between 1 (no contrast) and 21 (max contrast).
 */
export function contrastRatio(color1: string, color2: string): number {
  const [r1, g1, b1] = parseHexColor(color1);
  const [r2, g2, b2] = parseHexColor(color2);
  const l1 = relativeLuminance(r1, g1, b1);
  const l2 = relativeLuminance(r2, g2, b2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}
