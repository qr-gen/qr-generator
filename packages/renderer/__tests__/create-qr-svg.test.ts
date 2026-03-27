import { describe, it, expect } from 'vitest';
import { createQRSVG } from '../src/create-qr-svg';

describe('createQRSVG', () => {
  it('generates a valid SVG string', () => {
    const result = createQRSVG('hello', { size: 256 });
    expect(result.svg).toContain('<svg');
    expect(result.svg).toContain('</svg>');
  });

  it('returns QR metadata', () => {
    const result = createQRSVG('hello', { size: 256 });
    expect(result.version).toBeGreaterThanOrEqual(1);
    expect(result.size).toBeGreaterThan(0);
    expect(result.errorCorrection).toBeDefined();
  });

  it('auto-upgrades EC to H when logo is present', () => {
    const result = createQRSVG('hello', {
      size: 256,
      logo: { src: '/logo.png', width: 30, height: 30 },
    });
    expect(result.errorCorrection).toBe('H');
  });

  it('respects EC=H even without logo', () => {
    const result = createQRSVG('hello', { size: 256 }, { errorCorrection: 'H' });
    expect(result.errorCorrection).toBe('H');
  });

  it('uses specified EC when no logo', () => {
    const result = createQRSVG('hello', { size: 256 }, { errorCorrection: 'L' });
    expect(result.errorCorrection).toBe('L');
  });

  it('overrides user EC to H when logo is present', () => {
    const result = createQRSVG('hello', {
      size: 256,
      logo: { src: '/logo.png', width: 30, height: 30 },
    }, { errorCorrection: 'L' });
    expect(result.errorCorrection).toBe('H');
  });

  it('renders logo in SVG output', () => {
    const result = createQRSVG('hello', {
      size: 256,
      logo: { src: '/logo.png', width: 30, height: 30 },
    });
    expect(result.svg).toContain('<image');
    expect(result.svg).toContain('href="/logo.png"');
  });

  it('returns validation result', () => {
    const result = createQRSVG('hello', { size: 256 });
    expect(result.validation.valid).toBe(true);
    expect(result.validation.issues).toHaveLength(0);
  });

  it('throws on validation errors by default', () => {
    expect(() =>
      createQRSVG('hello', {
        size: 256,
        fgColor: '#999999',
        bgColor: '#ffffff',
      }),
    ).toThrow(/contrast/i);
  });

  it('does not throw when skipValidation is true', () => {
    expect(() =>
      createQRSVG('hello', {
        size: 256,
        fgColor: '#999999',
        bgColor: '#ffffff',
        skipValidation: true,
      }),
    ).not.toThrow();
  });

  it('applies finderColor to finder modules in SVG output', () => {
    const result = createQRSVG('hello', {
      size: 256,
      finderColor: '#ff0000',
    });
    expect(result.svg).toContain('#ff0000');
  });
});
