import { describe, it, expect } from 'vitest';
import { generateQR } from '@qr-kit/core';
import { renderSVG } from '../src/svg/renderer';
import { renderPNG } from '../src/png/renderer';
import { renderBMP } from '../src/bmp/renderer';
import { rasterizeMatrix } from '../src/raster/rasterize';
import { renderDataURI } from '../src/data-uri/renderer';
import { createQR } from '../src/create-qr';
import * as fs from 'fs';
import * as path from 'path';

describe('Server-Side Rendering Compatibility', () => {
  const qr = generateQR({ data: 'https://example.com' });
  const { matrix, moduleTypes } = qr;

  describe('SVG generation without DOM', () => {
    it('generates valid SVG string in Node.js without any DOM APIs', () => {
      const svg = renderSVG(matrix, {
        size: 300,
        moduleTypes,
        skipValidation: true,
      });
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
      expect(svg).toContain('viewBox');
      expect(typeof svg).toBe('string');
    });

    it('generates SVG with all styling options without DOM', () => {
      const svg = renderSVG(matrix, {
        size: 300,
        fgColor: '#333333',
        bgColor: '#ffffff',
        shape: 'rounded',
        finderShape: 'circle',
        finderColor: '#ff0000',
        moduleScale: 0.8,
        borderRadius: 10,
        moduleTypes,
        skipValidation: true,
      });
      expect(svg).toContain('<svg');
    });

    it('generates SVG with gradient without DOM', () => {
      const svg = renderSVG(matrix, {
        size: 300,
        fgColor: {
          type: 'linear',
          colors: ['#ff0000', '#0000ff'],
          angle: 45,
        },
        moduleTypes,
        skipValidation: true,
      });
      expect(svg).toContain('<linearGradient');
    });
  });

  describe('PNG generation without Canvas', () => {
    it('generates PNG as Uint8Array without Canvas API', () => {
      const png = renderPNG(matrix, {
        size: 100,
        moduleTypes,
        skipValidation: true,
      });
      expect(png).toBeInstanceOf(Uint8Array);
      expect(png.length).toBeGreaterThan(0);
      // Verify PNG magic bytes
      expect(png[0]).toBe(0x89);
      expect(png[1]).toBe(0x50); // P
      expect(png[2]).toBe(0x4E); // N
      expect(png[3]).toBe(0x47); // G
    });

    it('generates PNG with custom colors without Canvas', () => {
      const png = renderPNG(matrix, {
        size: 100,
        fgColor: '#ff0000',
        bgColor: '#ffffff',
        shape: 'dots',
        moduleTypes,
        skipValidation: true,
      });
      expect(png).toBeInstanceOf(Uint8Array);
      expect(png[0]).toBe(0x89);
    });
  });

  describe('BMP generation without Canvas', () => {
    it('generates BMP as Uint8Array without Canvas API', () => {
      const bmp = renderBMP(matrix, {
        size: 100,
        moduleTypes,
        skipValidation: true,
      });
      expect(bmp).toBeInstanceOf(Uint8Array);
      expect(bmp.length).toBeGreaterThan(0);
      // Verify BMP magic bytes
      expect(bmp[0]).toBe(0x42); // B
      expect(bmp[1]).toBe(0x4D); // M
    });
  });

  describe('Raster pipeline uses Uint8Array, not Node Buffer', () => {
    it('PixelBuffer data is Uint8Array', () => {
      const buffer = rasterizeMatrix(matrix, {
        size: 100,
        moduleTypes,
        skipValidation: true,
      });
      expect(buffer.data).toBeInstanceOf(Uint8Array);
      // Verify it's NOT a Node Buffer (which is a subclass of Uint8Array)
      expect(buffer.data.constructor.name).toBe('Uint8Array');
    });
  });

  describe('Data URI generation without DOM', () => {
    it('generates data URI string', () => {
      const uri = renderDataURI(matrix, {
        size: 100,
        moduleTypes,
        skipValidation: true,
      });
      expect(typeof uri).toBe('string');
      expect(uri).toMatch(/^data:image\//);
    });
  });

  describe('createQR convenience function', () => {
    it('generates SVG format without DOM', () => {
      const result = createQR('https://example.com', { size: 200 });
      expect(typeof result.data).toBe('string');
      expect(result.format).toBe('svg');
      expect((result.data as string)).toContain('<svg');
    });

    it('generates PNG format without Canvas', () => {
      const result = createQR('https://example.com', { size: 100, format: 'png' });
      expect(result.data).toBeInstanceOf(Uint8Array);
      expect(result.format).toBe('png');
    });

    it('toDataURL works without DOM', () => {
      const result = createQR('https://example.com', { size: 100 });
      const dataUrl = result.toDataURL();
      expect(typeof dataUrl).toBe('string');
      expect(dataUrl).toMatch(/^data:image\//);
    });
  });

  describe('Production code audit - no browser globals in core paths', () => {
    it('core package source contains no browser-specific globals', () => {
      const coreDir = path.join(__dirname, '../../core/src');
      const files = getAllTsFiles(coreDir);
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        // Check for browser globals (outside comments and strings)
        expect(content).not.toMatch(/\bwindow\b(?!.*\/\/)/);
        expect(content).not.toMatch(/\bdocument\b(?!.*\/\/)/);
        expect(content).not.toMatch(/\bnavigator\b/);
      }
    });

    it('renderer SVG/raster/PNG/BMP source contains no browser globals', () => {
      const dirs = [
        path.join(__dirname, '../src/svg'),
        path.join(__dirname, '../src/raster'),
        path.join(__dirname, '../src/png'),
        path.join(__dirname, '../src/bmp'),
        path.join(__dirname, '../src/utils'),
        path.join(__dirname, '../src/validation'),
      ];
      for (const dir of dirs) {
        if (!fs.existsSync(dir)) continue;
        const files = getAllTsFiles(dir);
        for (const file of files) {
          const content = fs.readFileSync(file, 'utf-8');
          expect(content).not.toMatch(/\bwindow\./);
          expect(content).not.toMatch(/\bdocument\./);
          expect(content).not.toMatch(/\bnavigator\./);
        }
      }
    });
  });
});

function getAllTsFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllTsFiles(full));
    } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.test.ts')) {
      files.push(full);
    }
  }
  return files;
}
