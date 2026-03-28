import { PixelBuffer } from './pixel-buffer.js';
import { ModuleShape } from '../types.js';

export function renderRasterModule(
  buffer: PixelBuffer,
  x: number,
  y: number,
  size: number,
  shape: ModuleShape,
  r: number,
  g: number,
  b: number,
  a: number,
): void {
  switch (shape) {
    case 'square':
      buffer.fillRect(x, y, size, size, r, g, b, a);
      break;
    case 'rounded':
      buffer.fillRoundedRect(x, y, size, size, size * 0.3, r, g, b, a);
      break;
    case 'dots':
      buffer.fillCircle(x + size / 2, y + size / 2, size * 0.45, r, g, b, a);
      break;
    case 'diamond':
      buffer.fillDiamond(x + size / 2, y + size / 2, size * 0.45, r, g, b, a);
      break;
  }
}
