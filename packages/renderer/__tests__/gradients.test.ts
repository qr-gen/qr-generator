import { describe, it, expect } from 'vitest';
import { renderGradientDef, getGradientId } from '../src/svg/gradients';

describe('Gradients', () => {
  it('creates linear gradient def', () => {
    const result = renderGradientDef({ type: 'linear', colors: ['#000', '#fff'] }, 'fg');
    expect(result).toContain('<linearGradient');
    expect(result).toContain('id="qr-gradient-fg"');
    expect(result).toContain('<stop');
    expect(result).toContain('stop-color="#000"');
    expect(result).toContain('stop-color="#fff"');
    expect(result).toContain('</linearGradient>');
  });

  it('creates radial gradient def', () => {
    const result = renderGradientDef({ type: 'radial', colors: ['#f00', '#00f'] }, 'fg');
    expect(result).toContain('<radialGradient');
    expect(result).toContain('</radialGradient>');
  });

  it('handles 3+ color stops', () => {
    const result = renderGradientDef({ type: 'linear', colors: ['#f00', '#0f0', '#00f'] }, 'fg');
    expect(result).toContain('offset="0%"');
    expect(result).toContain('offset="50%"');
    expect(result).toContain('offset="100%"');
  });

  it('getGradientId returns url reference', () => {
    expect(getGradientId('fg')).toBe('url(#qr-gradient-fg)');
  });
});
