import { describe, it, expect } from 'vitest';
import { svgRect, svgCircle, svgRoundedRect, svgDocument } from '../src/svg/helpers';

describe('SVG Helpers', () => {
  describe('svgRect', () => {
    it('produces a rect element', () => {
      const result = svgRect(0, 0, 10, 10, '#000');
      expect(result).toContain('<rect');
      expect(result).toContain('x="0"');
      expect(result).toContain('y="0"');
      expect(result).toContain('width="10"');
      expect(result).toContain('height="10"');
      expect(result).toContain('fill="#000"');
    });
  });

  describe('svgCircle', () => {
    it('produces a circle element', () => {
      const result = svgCircle(5, 5, 4, '#000');
      expect(result).toContain('<circle');
      expect(result).toContain('cx="5"');
      expect(result).toContain('cy="5"');
      expect(result).toContain('r="4"');
    });
  });

  describe('svgRoundedRect', () => {
    it('produces a rect with rx/ry', () => {
      const result = svgRoundedRect(0, 0, 10, 10, 3, '#000');
      expect(result).toContain('rx="3"');
      expect(result).toContain('ry="3"');
    });
  });

  describe('svgDocument', () => {
    it('wraps content in svg element', () => {
      const result = svgDocument(100, 100, '<rect/>');
      expect(result).toContain('<svg');
      expect(result).toContain('xmlns="http://www.w3.org/2000/svg"');
      expect(result).toContain('width="100"');
      expect(result).toContain('height="100"');
      expect(result).toContain('viewBox="0 0 100 100"');
      expect(result).toContain('<rect/>');
      expect(result).toContain('</svg>');
    });
  });
});
