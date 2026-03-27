import { describe, it, expect } from 'vitest';
import { createQR } from '../src/create-qr';

const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];

describe('createQR', () => {
  it('format svg: returns object with data as string containing <svg', () => {
    const result = createQR('hello', { size: 256, format: 'svg' });
    expect(typeof result.data).toBe('string');
    expect(result.data as string).toContain('<svg');
    expect(result.format).toBe('svg');
  });

  it('format png: returns object with data as Uint8Array starting with PNG signature', () => {
    const result = createQR('hello', { size: 100, format: 'png' });
    expect(result.data).toBeInstanceOf(Uint8Array);
    const bytes = Array.from((result.data as Uint8Array).slice(0, 8));
    expect(bytes).toEqual(PNG_SIGNATURE);
    expect(result.format).toBe('png');
  });

  it('format bmp: returns object with data as Uint8Array starting with "BM"', () => {
    const result = createQR('hello', { size: 100, format: 'bmp' });
    expect(result.data).toBeInstanceOf(Uint8Array);
    const data = result.data as Uint8Array;
    expect(data[0]).toBe(66); // 'B'
    expect(data[1]).toBe(77); // 'M'
    expect(result.format).toBe('bmp');
  });

  it('format data-uri: returns object with data as string starting with data:image/png;base64,', () => {
    const result = createQR('hello', { size: 100, format: 'data-uri' });
    expect(typeof result.data).toBe('string');
    expect(result.data as string).toMatch(/^data:image\/png;base64,/);
    expect(result.format).toBe('data-uri');
  });

  it('default format is svg (backward compatible)', () => {
    const result = createQR('hello', { size: 256 });
    expect(typeof result.data).toBe('string');
    expect(result.data as string).toContain('<svg');
    expect(result.format).toBe('svg');
  });

  it('auto-upgrades EC to H when logo is present', () => {
    const result = createQR('hello', {
      size: 256,
      logo: { src: '/logo.png', width: 30, height: 30 },
    });
    expect(result.errorCorrection).toBe('H');
  });

  it('validation runs by default', () => {
    expect(() =>
      createQR('hello', {
        size: 256,
        fgColor: '#999999',
        bgColor: '#ffffff',
      }),
    ).toThrow(/validation failed/i);
  });

  it('returns correct metadata: version, errorCorrection, size', () => {
    const result = createQR('hello', { size: 256 });
    expect(result.version).toBeGreaterThanOrEqual(1);
    expect(result.errorCorrection).toBeDefined();
    expect(result.size).toBeGreaterThan(0);
  });

  it('returns validation result', () => {
    const result = createQR('hello', { size: 256 });
    expect(result.validation).toBeDefined();
    expect(result.validation.valid).toBe(true);
    expect(result.validation.issues).toHaveLength(0);
  });

  it('respects specified EC when no logo', () => {
    const result = createQR('hello', { size: 256 }, { errorCorrection: 'L' });
    expect(result.errorCorrection).toBe('L');
  });

  it('overrides user EC to H when logo is present', () => {
    const result = createQR('hello', {
      size: 256,
      logo: { src: '/logo.png', width: 30, height: 30 },
    }, { errorCorrection: 'L' });
    expect(result.errorCorrection).toBe('H');
  });

  it('applies finderColor to finder modules in SVG output', () => {
    const result = createQR('hello', {
      size: 256,
      format: 'svg',
      finderColor: '#ff0000',
    });
    expect(result.data as string).toContain('#ff0000');
  });
});
