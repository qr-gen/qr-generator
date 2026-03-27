import { describe, it, expect, vi } from 'vitest';
import { renderCanvas } from '../src/canvas/renderer';

// Mock canvas and 2D context
function createMockCanvas() {
  const imageDataStore: { data: Uint8ClampedArray; width: number; height: number } | null = null;
  const ctx = {
    createImageData: vi.fn((w: number, h: number) => ({
      data: new Uint8ClampedArray(w * h * 4),
      width: w,
      height: h,
    })),
    putImageData: vi.fn(),
  };
  const canvas = {
    width: 0,
    height: 0,
    getContext: vi.fn((type: string) => type === '2d' ? ctx : null),
  } as unknown as HTMLCanvasElement;
  return { canvas, ctx };
}

describe('renderCanvas', () => {
  const matrix = [
    [1, 0, 1],
    [0, 1, 0],
    [1, 0, 1],
  ];

  it('sets canvas width and height to the specified size', () => {
    const { canvas } = createMockCanvas();
    renderCanvas(matrix, { size: 256, skipValidation: true }, canvas);
    expect(canvas.width).toBe(256);
    expect(canvas.height).toBe(256);
  });

  it('calls getContext with "2d"', () => {
    const { canvas } = createMockCanvas();
    renderCanvas(matrix, { size: 128, skipValidation: true }, canvas);
    expect(canvas.getContext).toHaveBeenCalledWith('2d');
  });

  it('calls createImageData with correct dimensions', () => {
    const { canvas, ctx } = createMockCanvas();
    renderCanvas(matrix, { size: 100, skipValidation: true }, canvas);
    expect(ctx.createImageData).toHaveBeenCalledWith(100, 100);
  });

  it('calls putImageData to draw pixels', () => {
    const { canvas, ctx } = createMockCanvas();
    renderCanvas(matrix, { size: 100, skipValidation: true }, canvas);
    expect(ctx.putImageData).toHaveBeenCalledTimes(1);
    const imageData = ctx.putImageData.mock.calls[0][0];
    expect(imageData.data.length).toBe(100 * 100 * 4);
  });

  it('throws when canvas context is null', () => {
    const canvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => null),
    } as unknown as HTMLCanvasElement;
    expect(() => renderCanvas(matrix, { size: 100, skipValidation: true }, canvas)).toThrow('Could not get 2d context');
  });

  it('passes moduleTypes through for finder rendering', () => {
    const { canvas, ctx } = createMockCanvas();
    const moduleTypes = [
      [1, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];
    // Should not throw
    renderCanvas(matrix, {
      size: 100, skipValidation: true,
      moduleTypes,
      finderColor: '#ff0000',
    }, canvas);
    expect(ctx.putImageData).toHaveBeenCalledTimes(1);
  });

  it('respects custom colors', () => {
    const { canvas, ctx } = createMockCanvas();
    renderCanvas(matrix, { size: 100, fgColor: '#ff0000', bgColor: '#0000ff', skipValidation: true }, canvas);
    const imageData = ctx.putImageData.mock.calls[0][0];
    // Check that image data is not all zeros (has been filled with colors)
    const hasNonZero = imageData.data.some((v: number) => v > 0);
    expect(hasNonZero).toBe(true);
  });
});
