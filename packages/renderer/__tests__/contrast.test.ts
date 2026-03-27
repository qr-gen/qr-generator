import { describe, it, expect } from 'vitest';
import { contrastRatio, parseHexColor } from '../src/validation/contrast';

describe('Contrast', () => {
  it('parses hex color #000000', () => {
    expect(parseHexColor('#000000')).toEqual([0, 0, 0]);
  });

  it('parses hex color #ffffff', () => {
    expect(parseHexColor('#ffffff')).toEqual([255, 255, 255]);
  });

  it('parses shorthand #fff', () => {
    expect(parseHexColor('#fff')).toEqual([255, 255, 255]);
  });

  it('parses shorthand #000', () => {
    expect(parseHexColor('#000')).toEqual([0, 0, 0]);
  });

  it('max contrast between black and white is 21', () => {
    const ratio = contrastRatio('#000000', '#ffffff');
    expect(ratio).toBeCloseTo(21, 0);
  });

  it('no contrast between same colors is 1', () => {
    const ratio = contrastRatio('#000000', '#000000');
    expect(ratio).toBeCloseTo(1, 0);
  });

  it('contrast between #999 and #fff is below 4.5', () => {
    const ratio = contrastRatio('#999999', '#ffffff');
    expect(ratio).toBeLessThan(4.5);
  });

  it('contrast between #000 and #fff passes WCAG', () => {
    const ratio = contrastRatio('#000', '#fff');
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
});
