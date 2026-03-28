import { describe, it, expect } from 'vitest';
import { computeScannability } from '../src/validation/scannability';

describe('scannability scoring', () => {
  it('perfect settings score near 100', () => {
    const result = computeScannability({
      errorCorrection: 'H',
      fgColor: '#000000',
      bgColor: '#ffffff',
      shape: 'square',
      size: 256,
      margin: 4,
    });
    expect(result.score).toBe(100);
    expect(result.breakdown.errorCorrection).toBe(25);
    expect(result.breakdown.contrast).toBe(25);
    expect(result.breakdown.logoImpact).toBe(20);
    expect(result.breakdown.moduleShape).toBe(15);
    expect(result.breakdown.quietZone).toBe(15);
  });

  it('EC level L scores lower than H', () => {
    const resultL = computeScannability({ errorCorrection: 'L', size: 256 });
    const resultH = computeScannability({ errorCorrection: 'H', size: 256 });
    expect(resultL.score).toBeLessThan(resultH.score);
    expect(resultL.breakdown.errorCorrection).toBe(10);
    expect(resultH.breakdown.errorCorrection).toBe(25);
  });

  it('EC level M scores 15', () => {
    const result = computeScannability({ errorCorrection: 'M', size: 256 });
    expect(result.breakdown.errorCorrection).toBe(15);
  });

  it('EC level Q scores 20', () => {
    const result = computeScannability({ errorCorrection: 'Q', size: 256 });
    expect(result.breakdown.errorCorrection).toBe(20);
  });

  it('low contrast reduces score', () => {
    const result = computeScannability({
      errorCorrection: 'H',
      fgColor: '#808080',
      bgColor: '#ffffff',
      shape: 'square',
      size: 256,
      margin: 4,
    });
    expect(result.breakdown.contrast).toBeLessThan(25);
  });

  it('dots shape scores lower than square', () => {
    const dots = computeScannability({ errorCorrection: 'H', shape: 'dots', size: 256 });
    const square = computeScannability({ errorCorrection: 'H', shape: 'square', size: 256 });
    expect(dots.breakdown.moduleShape).toBeLessThan(square.breakdown.moduleShape);
    expect(dots.breakdown.moduleShape).toBe(8);
    expect(square.breakdown.moduleShape).toBe(15);
  });

  it('rounded shape scores 12', () => {
    const result = computeScannability({ errorCorrection: 'H', shape: 'rounded', size: 256 });
    expect(result.breakdown.moduleShape).toBe(12);
  });

  it('large logo reduces score', () => {
    const withLogo = computeScannability({
      errorCorrection: 'H',
      size: 256,
      logo: { src: 'logo.png', width: 50, height: 50 },  // ~3.8% area
    });
    const withoutLogo = computeScannability({
      errorCorrection: 'H',
      size: 256,
    });
    expect(withLogo.breakdown.logoImpact).toBeLessThan(withoutLogo.breakdown.logoImpact);
  });

  it('logo area thresholds', () => {
    // No logo = 20
    expect(computeScannability({ errorCorrection: 'H', size: 100 }).breakdown.logoImpact).toBe(20);

    // <= 10% area = 15
    // size=100, logo 30x30 = 9% area
    expect(computeScannability({
      errorCorrection: 'H', size: 100,
      logo: { src: 'x', width: 30, height: 30 }
    }).breakdown.logoImpact).toBe(15);

    // <= 15% area = 10
    // logo 38x38 = 14.4% area
    expect(computeScannability({
      errorCorrection: 'H', size: 100,
      logo: { src: 'x', width: 38, height: 38 }
    }).breakdown.logoImpact).toBe(10);

    // <= 20% area = 5
    // logo 44x44 = 19.36% area
    expect(computeScannability({
      errorCorrection: 'H', size: 100,
      logo: { src: 'x', width: 44, height: 44 }
    }).breakdown.logoImpact).toBe(5);

    // > 20% area = 0
    // logo 46x46 = 21.16% area
    expect(computeScannability({
      errorCorrection: 'H', size: 100,
      logo: { src: 'x', width: 46, height: 46 }
    }).breakdown.logoImpact).toBe(0);
  });

  it('margin thresholds', () => {
    expect(computeScannability({ errorCorrection: 'H', size: 256, margin: 4 }).breakdown.quietZone).toBe(15);
    expect(computeScannability({ errorCorrection: 'H', size: 256, margin: 3 }).breakdown.quietZone).toBe(10);
    expect(computeScannability({ errorCorrection: 'H', size: 256, margin: 2 }).breakdown.quietZone).toBe(5);
    expect(computeScannability({ errorCorrection: 'H', size: 256, margin: 1 }).breakdown.quietZone).toBe(2);
    expect(computeScannability({ errorCorrection: 'H', size: 256, margin: 0 }).breakdown.quietZone).toBe(0);
  });

  it('score is always between 0 and 100', () => {
    // Worst case
    const worst = computeScannability({
      errorCorrection: 'L',
      fgColor: '#777777',
      bgColor: '#888888',
      shape: 'dots',
      size: 256,
      margin: 0,
      logo: { src: 'x', width: 200, height: 200 },
    });
    expect(worst.score).toBeGreaterThanOrEqual(0);
    expect(worst.score).toBeLessThanOrEqual(100);
  });

  it('uses defaults when options are omitted', () => {
    const result = computeScannability({ errorCorrection: 'M', size: 256 });
    // Default fgColor=#000000, bgColor=#ffffff → max contrast
    expect(result.breakdown.contrast).toBe(25);
    // Default shape=square
    expect(result.breakdown.moduleShape).toBe(15);
    // Default margin=4
    expect(result.breakdown.quietZone).toBe(15);
    // No logo
    expect(result.breakdown.logoImpact).toBe(20);
  });

  it('diamond shape scores 10', () => {
    const result = computeScannability({ errorCorrection: 'H', shape: 'diamond', size: 256 });
    expect(result.breakdown.moduleShape).toBe(10);
  });

  it('overlay image reduces score', () => {
    const withOverlay = computeScannability({
      errorCorrection: 'H',
      size: 256,
      overlayImage: { src: 'test.png' },
    });
    const withoutOverlay = computeScannability({
      errorCorrection: 'H',
      size: 256,
    });
    expect(withOverlay.score).toBeLessThan(withoutOverlay.score);
  });

  it('gradient fgColor uses minimum endpoint contrast', () => {
    // A gradient from dark to medium — the worst endpoint contrast should be used
    const result = computeScannability({
      errorCorrection: 'H',
      fgColor: { type: 'linear', colors: ['#000000', '#666666'] },
      bgColor: '#ffffff',
      size: 256,
    });
    // #666666 on white has contrast ~5.74 → ≥4.5 → 20 points
    expect(result.breakdown.contrast).toBe(20);
  });
});
