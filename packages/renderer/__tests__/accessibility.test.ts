import { describe, it, expect } from 'vitest';
import { renderSVG } from '../src/svg/renderer';

const simpleMatrix = [
  [1, 0, 1],
  [0, 1, 0],
  [1, 0, 1],
];

describe('SVG Accessibility', () => {
  it('default SVG contains <title>QR Code</title>', () => {
    const svg = renderSVG(simpleMatrix, { size: 100 });
    expect(svg).toContain('<title>QR Code</title>');
  });

  it('default SVG has role="img" on svg element', () => {
    const svg = renderSVG(simpleMatrix, { size: 100 });
    expect(svg).toContain('role="img"');
  });

  it('custom title produces matching <title>', () => {
    const svg = renderSVG(simpleMatrix, { size: 100, title: 'Scan for menu' });
    expect(svg).toContain('<title>Scan for menu</title>');
  });

  it('empty title omits <title> and role attribute', () => {
    const svg = renderSVG(simpleMatrix, { size: 100, title: '' });
    expect(svg).not.toContain('<title>');
    expect(svg).not.toContain('role="img"');
  });

  it('escapes XML special characters in title', () => {
    const svg = renderSVG(simpleMatrix, { size: 100, title: 'A & B <C>' });
    expect(svg).toContain('<title>A &amp; B &lt;C&gt;</title>');
    expect(svg).not.toContain('<title>A & B <C></title>');
  });

  it('<title> appears inside <svg> element', () => {
    const svg = renderSVG(simpleMatrix, { size: 100 });
    const svgStart = svg.indexOf('<svg');
    const titleStart = svg.indexOf('<title>');
    const svgEnd = svg.indexOf('</svg>');
    expect(titleStart).toBeGreaterThan(svgStart);
    expect(titleStart).toBeLessThan(svgEnd);
  });
});
