import { describe, it, expect } from 'vitest';
import {
  computeLogoBounds,
  isModuleInLogoBounds,
  renderLogoImage,
  renderLogoClearZone,
} from '../src/svg/logo';
import type { LogoConfig } from '../src/types';

describe('computeLogoBounds', () => {
  it('centers logo within the QR code', () => {
    const logo: LogoConfig = { src: '/logo.png', width: 40, height: 40 };
    const bounds = computeLogoBounds(logo, 256, 0);
    expect(bounds.x).toBe(108); // (256 - 40) / 2
    expect(bounds.y).toBe(108);
    expect(bounds.width).toBe(40);
    expect(bounds.height).toBe(40);
  });

  it('applies padding to the clear zone', () => {
    const logo: LogoConfig = { src: '/logo.png', width: 40, height: 40, padding: 5 };
    const bounds = computeLogoBounds(logo, 256, 5);
    // Logo center: (256-40)/2 = 108
    // Clear zone extends by padding
    expect(bounds.clearX).toBe(103); // 108 - 5
    expect(bounds.clearY).toBe(103);
    expect(bounds.clearWidth).toBe(50); // 40 + 5*2
    expect(bounds.clearHeight).toBe(50);
  });

  it('uses default padding of 2 * moduleSize when padding not specified', () => {
    const logo: LogoConfig = { src: '/logo.png', width: 40, height: 40 };
    const moduleSize = 4;
    const bounds = computeLogoBounds(logo, 256, moduleSize * 2);
    const defaultPadding = 8; // 2 * 4
    expect(bounds.clearX).toBe(108 - defaultPadding);
    expect(bounds.clearY).toBe(108 - defaultPadding);
    expect(bounds.clearWidth).toBe(40 + defaultPadding * 2);
    expect(bounds.clearHeight).toBe(40 + defaultPadding * 2);
  });

  it('handles non-square logos', () => {
    const logo: LogoConfig = { src: '/logo.png', width: 60, height: 30 };
    const bounds = computeLogoBounds(logo, 256, 0);
    expect(bounds.x).toBe(98); // (256 - 60) / 2
    expect(bounds.y).toBe(113); // (256 - 30) / 2
    expect(bounds.width).toBe(60);
    expect(bounds.height).toBe(30);
  });
});

describe('isModuleInLogoBounds', () => {
  // Logo at center of 256px QR, 40x40, padding 8
  // clearX=100, clearY=100, clearWidth=56, clearHeight=56
  const bounds = {
    x: 108, y: 108, width: 40, height: 40,
    clearX: 100, clearY: 100, clearWidth: 56, clearHeight: 56,
  };

  it('returns true for module inside the clear zone', () => {
    // Module center at (120, 120) - inside clear zone [100, 156] x [100, 156]
    expect(isModuleInLogoBounds(120, 120, 4, bounds)).toBe(true);
  });

  it('returns false for module outside the clear zone', () => {
    // Module center at (10, 10) - far outside
    expect(isModuleInLogoBounds(10, 10, 4, bounds)).toBe(false);
  });

  it('returns false for module at the edge (center outside clear zone)', () => {
    // Module center at (97, 120) - just outside clear zone left edge (100)
    expect(isModuleInLogoBounds(97, 120, 4, bounds)).toBe(false);
  });

  it('returns true for module whose center is just inside the clear zone', () => {
    // Module at x=100, center = 100 + 2 = 102 which is inside [100, 156]
    expect(isModuleInLogoBounds(100, 120, 4, bounds)).toBe(true);
  });
});

describe('renderLogoImage', () => {
  it('generates an SVG image element with correct attributes', () => {
    const svg = renderLogoImage(108, 108, 40, 40, '/logo.png');
    expect(svg).toContain('<image');
    expect(svg).toContain('href="/logo.png"');
    expect(svg).toContain('x="108"');
    expect(svg).toContain('y="108"');
    expect(svg).toContain('width="40"');
    expect(svg).toContain('height="40"');
    expect(svg).toContain('/>');
  });

  it('handles data URI sources', () => {
    const dataUri = 'data:image/png;base64,iVBORw0KGgo=';
    const svg = renderLogoImage(10, 10, 20, 20, dataUri);
    expect(svg).toContain(`href="${dataUri}"`);
  });
});

describe('renderLogoClearZone', () => {
  it('generates a white rect for the clear zone', () => {
    const svg = renderLogoClearZone(100, 100, 56, 56, '#ffffff');
    expect(svg).toContain('<rect');
    expect(svg).toContain('x="100"');
    expect(svg).toContain('y="100"');
    expect(svg).toContain('width="56"');
    expect(svg).toContain('height="56"');
    expect(svg).toContain('fill="#ffffff"');
  });

  it('uses the provided background color', () => {
    const svg = renderLogoClearZone(0, 0, 10, 10, '#f0f0f0');
    expect(svg).toContain('fill="#f0f0f0"');
  });
});
