import type { ModuleShape } from '../types';
import { svgRect, svgRoundedRect, svgCircle } from './helpers';

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
  }
}
