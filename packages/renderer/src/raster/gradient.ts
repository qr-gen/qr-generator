import { GradientConfig } from '../types.js';
import { parseHexColor } from '../utils/color.js';

/**
 * Compute the gradient color at pixel (x, y) within a (width x height) grid.
 *
 * For linear gradients, the angle follows CSS convention:
 *   0° = top to bottom, 90° = left to right, 180° = bottom to top, etc.
 *
 * For radial gradients, the gradient radiates from the center outward,
 * where 0 = center and 1 = farthest corner.
 *
 * Returns an [r, g, b, a] tuple with a always 255.
 */
export function getGradientColor(
  x: number,
  y: number,
  width: number,
  height: number,
  config: GradientConfig,
): [number, number, number, number] {
  const t =
    config.type === 'radial'
      ? computeRadialPosition(x, y, width, height)
      : computeLinearPosition(x, y, width, height, config.angle ?? 0);

  const clamped = Math.max(0, Math.min(1, t));
  const [r, g, b] = interpolateColors(config.colors, clamped);
  return [r, g, b, 255];
}

/**
 * Compute normalized position (0-1) along a linear gradient axis.
 * Angle follows CSS gradient convention: 0° = top-to-bottom, 90° = left-to-right.
 */
function computeLinearPosition(
  x: number,
  y: number,
  width: number,
  height: number,
  angleDeg: number,
): number {
  // CSS gradient angle: 0° points downward (+y), 90° points right (+x)
  // Convert to radians where the direction vector is (sin(angle), cos(angle))
  const rad = (angleDeg * Math.PI) / 180;
  const dx = Math.sin(rad);
  const dy = Math.cos(rad);

  // Normalize pixel position to -0.5..0.5 range (centered)
  const nx = x / (width - 1) - 0.5;
  const ny = y / (height - 1) - 0.5;

  // Project onto gradient direction
  const proj = nx * dx + ny * dy;

  // The gradient line extends from -maxProj to +maxProj
  // maxProj = |dx|*0.5 + |dy|*0.5
  const maxProj = Math.abs(dx) * 0.5 + Math.abs(dy) * 0.5;

  if (maxProj === 0) return 0.5;

  // Normalize to 0-1
  return (proj + maxProj) / (2 * maxProj);
}

/**
 * Compute normalized position (0-1) for a radial gradient.
 * 0 = center, 1 = farthest corner.
 */
function computeRadialPosition(
  x: number,
  y: number,
  width: number,
  height: number,
): number {
  const cx = (width - 1) / 2;
  const cy = (height - 1) / 2;

  const distX = x - cx;
  const distY = y - cy;
  const dist = Math.sqrt(distX * distX + distY * distY);

  // Farthest corner distance
  const maxDist = Math.sqrt(cx * cx + cy * cy);

  if (maxDist === 0) return 0;
  return dist / maxDist;
}

/**
 * Interpolate between evenly-spaced color stops at position t (0-1).
 */
function interpolateColors(
  colors: [string, string, ...string[]],
  t: number,
): [number, number, number] {
  const numStops = colors.length;

  if (numStops === 1) {
    return parseHexColor(colors[0]);
  }

  // Scale t to the stop index range
  const scaledT = t * (numStops - 1);
  const stopIndex = Math.floor(scaledT);

  // If we're at or past the last stop, return last color
  if (stopIndex >= numStops - 1) {
    return parseHexColor(colors[numStops - 1]);
  }

  const localT = scaledT - stopIndex;
  const c1 = parseHexColor(colors[stopIndex]);
  const c2 = parseHexColor(colors[stopIndex + 1]);

  return [
    Math.round(c1[0] + (c2[0] - c1[0]) * localT),
    Math.round(c1[1] + (c2[1] - c1[1]) * localT),
    Math.round(c1[2] + (c2[2] - c1[2]) * localT),
  ];
}
