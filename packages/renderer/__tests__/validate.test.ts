import { describe, it, expect } from 'vitest';
import { validateRenderOptions } from '../src/validation/validate';
import type { RenderOptions, ValidationResult } from '../src/types';

describe('validateRenderOptions', () => {
  const defaults: RenderOptions = {
    size: 256,
    fgColor: '#000000',
    bgColor: '#ffffff',
  };

  describe('contrast validation', () => {
    it('returns valid when contrast >= 4.5', () => {
      const result = validateRenderOptions(defaults);
      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('returns error when contrast < 4.5 with solid colors', () => {
      const result = validateRenderOptions({
        ...defaults,
        fgColor: '#999999',
        bgColor: '#ffffff',
      });
      expect(result.valid).toBe(false);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].code).toBe('CONTRAST_TOO_LOW');
      expect(result.issues[0].severity).toBe('error');
    });

    it('skips contrast check when fgColor is a gradient', () => {
      const result = validateRenderOptions({
        ...defaults,
        fgColor: { type: 'linear', colors: ['#999999', '#aaaaaa'] },
      });
      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('checks contrast with default colors when not specified', () => {
      const result = validateRenderOptions({ size: 256 });
      expect(result.valid).toBe(true);
    });
  });

  describe('logo size validation', () => {
    it('returns error when logo area exceeds 20% of QR area', () => {
      const result = validateRenderOptions({
        ...defaults,
        logo: { src: '/logo.png', width: 150, height: 150 },
      });
      expect(result.valid).toBe(false);
      expect(result.issues.some(i => i.code === 'LOGO_TOO_LARGE')).toBe(true);
    });

    it('returns valid when logo area is exactly 20%', () => {
      // QR area = 256*256 = 65536, 20% = 13107.2
      // sqrt(13107.2) ~= 114.48, use 114x114 = 12996 < 13107.2
      const result = validateRenderOptions({
        ...defaults,
        logo: { src: '/logo.png', width: 114, height: 114 },
      });
      const logoIssues = result.issues.filter(i => i.code === 'LOGO_TOO_LARGE');
      expect(logoIssues).toHaveLength(0);
    });

    it('returns valid when logo is small', () => {
      const result = validateRenderOptions({
        ...defaults,
        logo: { src: '/logo.png', width: 40, height: 40 },
      });
      const logoIssues = result.issues.filter(i => i.code === 'LOGO_TOO_LARGE');
      expect(logoIssues).toHaveLength(0);
    });
  });

  describe('EC level warning with logo', () => {
    it('returns warning when logo present and EC is not H', () => {
      const result = validateRenderOptions(
        { ...defaults, logo: { src: '/logo.png', width: 40, height: 40 } },
        'L',
      );
      expect(result.issues.some(i => i.code === 'EC_NOT_H_WITH_LOGO')).toBe(true);
      expect(result.issues.find(i => i.code === 'EC_NOT_H_WITH_LOGO')!.severity).toBe('warning');
    });

    it('returns no warning when logo present and EC is H', () => {
      const result = validateRenderOptions(
        { ...defaults, logo: { src: '/logo.png', width: 40, height: 40 } },
        'H',
      );
      expect(result.issues.some(i => i.code === 'EC_NOT_H_WITH_LOGO')).toBe(false);
    });

    it('returns no warning when no logo', () => {
      const result = validateRenderOptions(defaults, 'L');
      expect(result.issues.some(i => i.code === 'EC_NOT_H_WITH_LOGO')).toBe(false);
    });
  });

  describe('invalid color detection', () => {
    it('returns error for invalid hex fgColor', () => {
      const result = validateRenderOptions({
        ...defaults,
        fgColor: 'notacolor',
      });
      expect(result.issues.some(i => i.code === 'INVALID_COLOR')).toBe(true);
    });

    it('returns error for invalid hex bgColor', () => {
      const result = validateRenderOptions({
        ...defaults,
        bgColor: 'xyz',
      });
      expect(result.issues.some(i => i.code === 'INVALID_COLOR')).toBe(true);
    });
  });

  describe('shape safety validation', () => {
    it('produces SHAPE_SCAN_RISK warning for dots shape with EC level L', () => {
      const result = validateRenderOptions(
        { ...defaults, shape: 'dots' },
        'L',
      );
      expect(result.valid).toBe(true);
      expect(result.issues.some(i => i.code === 'SHAPE_SCAN_RISK')).toBe(true);
      expect(result.issues.find(i => i.code === 'SHAPE_SCAN_RISK')!.severity).toBe('warning');
    });

    it('no SHAPE_SCAN_RISK warning for dots shape with EC level H', () => {
      const result = validateRenderOptions(
        { ...defaults, shape: 'dots' },
        'H',
      );
      expect(result.issues.some(i => i.code === 'SHAPE_SCAN_RISK')).toBe(false);
    });

    it('no SHAPE_SCAN_RISK warning for rounded shape with EC level L', () => {
      const result = validateRenderOptions(
        { ...defaults, shape: 'rounded' },
        'L',
      );
      expect(result.issues.some(i => i.code === 'SHAPE_SCAN_RISK')).toBe(false);
    });

    it('no SHAPE_SCAN_RISK warning for square shape with any EC level', () => {
      const result = validateRenderOptions(
        { ...defaults, shape: 'square' },
        'L',
      );
      expect(result.issues.some(i => i.code === 'SHAPE_SCAN_RISK')).toBe(false);
    });

    it('produces MODULE_TOO_SMALL warning for small size with dots shape', () => {
      const result = validateRenderOptions(
        { ...defaults, size: 50, shape: 'dots' },
        undefined,
        21,
      );
      expect(result.valid).toBe(true);
      expect(result.issues.some(i => i.code === 'MODULE_TOO_SMALL')).toBe(true);
      expect(result.issues.find(i => i.code === 'MODULE_TOO_SMALL')!.severity).toBe('warning');
    });

    it('no MODULE_TOO_SMALL warning for small size with square shape', () => {
      const result = validateRenderOptions(
        { ...defaults, size: 50, shape: 'square' },
        undefined,
        21,
      );
      expect(result.issues.some(i => i.code === 'MODULE_TOO_SMALL')).toBe(false);
    });

    it('no MODULE_TOO_SMALL warning for normal size with dots shape', () => {
      const result = validateRenderOptions(
        { ...defaults, size: 256, shape: 'dots' },
        undefined,
        21,
      );
      expect(result.issues.some(i => i.code === 'MODULE_TOO_SMALL')).toBe(false);
    });
  });

  describe('multiple issues', () => {
    it('returns multiple issues at once', () => {
      const result = validateRenderOptions(
        {
          ...defaults,
          fgColor: '#999999',
          bgColor: '#ffffff',
          logo: { src: '/logo.png', width: 200, height: 200 },
        },
        'L',
      );
      expect(result.valid).toBe(false);
      expect(result.issues.length).toBeGreaterThanOrEqual(2);
      const codes = result.issues.map(i => i.code);
      expect(codes).toContain('CONTRAST_TOO_LOW');
      expect(codes).toContain('LOGO_TOO_LARGE');
    });
  });
});
