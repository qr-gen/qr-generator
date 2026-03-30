import { describe, it, expect } from 'vitest';
import { getModuleColor } from '../src/utils/module-color';
import { MODULE_TYPE } from '@qr-kit/core';
import type { RenderOptions, GradientConfig } from '../src/types';

const gradient: GradientConfig = {
  type: 'linear',
  colors: ['#ff0000', '#0000ff'],
  angle: 90,
};

const baseOptions: RenderOptions = {
  size: 300,
  fgColor: '#000000',
};

describe('getModuleColor', () => {
  describe('DATA modules', () => {
    it('returns fgColor for DATA modules', () => {
      expect(getModuleColor(MODULE_TYPE.DATA, baseOptions)).toBe('#000000');
    });

    it('returns fgColor gradient for DATA modules', () => {
      const opts: RenderOptions = { ...baseOptions, fgColor: gradient };
      expect(getModuleColor(MODULE_TYPE.DATA, opts)).toBe(gradient);
    });

    it('defaults to #000000 when fgColor not set', () => {
      expect(getModuleColor(MODULE_TYPE.DATA, { size: 300 })).toBe('#000000');
    });
  });

  describe('FINDER modules', () => {
    it('returns fgColor when no finder colors set', () => {
      expect(getModuleColor(MODULE_TYPE.FINDER, baseOptions)).toBe('#000000');
    });

    it('returns finderColor when set', () => {
      const opts: RenderOptions = { ...baseOptions, finderColor: '#ff0000' };
      expect(getModuleColor(MODULE_TYPE.FINDER, opts)).toBe('#ff0000');
    });

    it('returns finderOuterColor over finderColor', () => {
      const opts: RenderOptions = { ...baseOptions, finderColor: '#ff0000', finderOuterColor: '#00ff00' };
      expect(getModuleColor(MODULE_TYPE.FINDER, opts)).toBe('#00ff00');
    });

    it('falls back finderOuterColor -> finderColor -> fgColor', () => {
      expect(getModuleColor(MODULE_TYPE.FINDER, baseOptions)).toBe('#000000');
      expect(getModuleColor(MODULE_TYPE.FINDER, { ...baseOptions, finderColor: '#aaa' })).toBe('#aaa');
      expect(getModuleColor(MODULE_TYPE.FINDER, { ...baseOptions, finderColor: '#aaa', finderOuterColor: '#bbb' })).toBe('#bbb');
    });
  });

  describe('FINDER_INNER modules', () => {
    it('returns fgColor when no finder colors set', () => {
      expect(getModuleColor(MODULE_TYPE.FINDER_INNER, baseOptions)).toBe('#000000');
    });

    it('returns finderColor when set', () => {
      const opts: RenderOptions = { ...baseOptions, finderColor: '#ff0000' };
      expect(getModuleColor(MODULE_TYPE.FINDER_INNER, opts)).toBe('#ff0000');
    });

    it('returns finderInnerColor over finderColor', () => {
      const opts: RenderOptions = { ...baseOptions, finderColor: '#ff0000', finderInnerColor: '#0000ff' };
      expect(getModuleColor(MODULE_TYPE.FINDER_INNER, opts)).toBe('#0000ff');
    });
  });

  describe('ALIGNMENT modules', () => {
    it('returns fgColor when alignmentColor not set', () => {
      expect(getModuleColor(MODULE_TYPE.ALIGNMENT, baseOptions)).toBe('#000000');
    });

    it('returns alignmentColor when set', () => {
      const opts: RenderOptions = { ...baseOptions, alignmentColor: '#00cc00' };
      expect(getModuleColor(MODULE_TYPE.ALIGNMENT, opts)).toBe('#00cc00');
    });

    it('accepts gradient for alignmentColor', () => {
      const opts: RenderOptions = { ...baseOptions, alignmentColor: gradient };
      expect(getModuleColor(MODULE_TYPE.ALIGNMENT, opts)).toBe(gradient);
    });
  });

  describe('TIMING modules', () => {
    it('returns fgColor when timingColor not set', () => {
      expect(getModuleColor(MODULE_TYPE.TIMING, baseOptions)).toBe('#000000');
    });

    it('returns timingColor when set', () => {
      const opts: RenderOptions = { ...baseOptions, timingColor: '#0000cc' };
      expect(getModuleColor(MODULE_TYPE.TIMING, opts)).toBe('#0000cc');
    });

    it('accepts gradient for timingColor', () => {
      const opts: RenderOptions = { ...baseOptions, timingColor: gradient };
      expect(getModuleColor(MODULE_TYPE.TIMING, opts)).toBe(gradient);
    });
  });

  describe('other module types', () => {
    it('returns fgColor for FORMAT_INFO', () => {
      expect(getModuleColor(MODULE_TYPE.FORMAT_INFO, baseOptions)).toBe('#000000');
    });

    it('returns fgColor for VERSION_INFO', () => {
      expect(getModuleColor(MODULE_TYPE.VERSION_INFO, baseOptions)).toBe('#000000');
    });

    it('returns fgColor for DARK_MODULE', () => {
      expect(getModuleColor(MODULE_TYPE.DARK_MODULE, baseOptions)).toBe('#000000');
    });

    it('returns fgColor for SEPARATOR', () => {
      expect(getModuleColor(MODULE_TYPE.SEPARATOR, baseOptions)).toBe('#000000');
    });
  });

  describe('combined options', () => {
    it('each module type gets its specific color when all are set', () => {
      const opts: RenderOptions = {
        size: 300,
        fgColor: '#000000',
        finderColor: '#111111',
        finderOuterColor: '#222222',
        finderInnerColor: '#333333',
        alignmentColor: '#444444',
        timingColor: '#555555',
      };
      expect(getModuleColor(MODULE_TYPE.DATA, opts)).toBe('#000000');
      expect(getModuleColor(MODULE_TYPE.FINDER, opts)).toBe('#222222');
      expect(getModuleColor(MODULE_TYPE.FINDER_INNER, opts)).toBe('#333333');
      expect(getModuleColor(MODULE_TYPE.ALIGNMENT, opts)).toBe('#444444');
      expect(getModuleColor(MODULE_TYPE.TIMING, opts)).toBe('#555555');
      expect(getModuleColor(MODULE_TYPE.FORMAT_INFO, opts)).toBe('#000000');
    });
  });
});
