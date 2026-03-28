import type { ModuleShape } from '../types';
import { svgRect, svgRoundedRect, svgCircle, svgPolygon } from './helpers';

export function renderModule(
  x: number, y: number, size: number, shape: ModuleShape, fill: string,
): string {
  switch (shape) {
    case 'square':
      return svgRect(x, y, size, size, fill);
    case 'rounded':
      return svgRoundedRect(x, y, size, size, size * 0.3, fill);
    case 'dots':
      return svgCircle(x + size / 2, y + size / 2, size * 0.45, fill);
    case 'diamond': {
      const cx = x + size / 2;
      const cy = y + size / 2;
      const half = size * 0.45;
      const pts = `${cx},${cy - half} ${cx + half},${cy} ${cx},${cy + half} ${cx - half},${cy}`;
      return svgPolygon(pts, fill);
    }
  }
}
