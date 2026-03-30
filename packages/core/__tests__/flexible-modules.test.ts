import { describe, it, expect } from 'vitest';
import { getFlexibleModules } from '../src/halftone/flexible-modules.js';
import { generateQR } from '../src/generate.js';
import { MODULE_TYPE } from '../src/types.js';

describe('getFlexibleModules', () => {
  it('marks only DATA modules as flexible for v1', () => {
    const qr = generateQR({ data: 'TEST', errorCorrection: 'H' });
    const flexible = getFlexibleModules(qr.moduleTypes);

    expect(flexible.length).toBe(qr.size);
    expect(flexible[0].length).toBe(qr.size);

    for (let r = 0; r < qr.size; r++) {
      for (let c = 0; c < qr.size; c++) {
        if (qr.moduleTypes[r][c] === MODULE_TYPE.DATA) {
          expect(flexible[r][c]).toBe(true);
        } else {
          expect(flexible[r][c]).toBe(false);
        }
      }
    }
  });

  it('marks only DATA modules as flexible for v5', () => {
    // Longer data to force a higher version
    const qr = generateQR({
      data: 'https://example.com/this-is-a-longer-url-to-force-version-5-or-higher',
      errorCorrection: 'H',
    });
    const flexible = getFlexibleModules(qr.moduleTypes);

    let flexCount = 0;
    let fixedCount = 0;
    for (let r = 0; r < qr.size; r++) {
      for (let c = 0; c < qr.size; c++) {
        if (flexible[r][c]) {
          expect(qr.moduleTypes[r][c]).toBe(MODULE_TYPE.DATA);
          flexCount++;
        } else {
          fixedCount++;
        }
      }
    }
    expect(flexCount).toBeGreaterThan(0);
    expect(fixedCount).toBeGreaterThan(0);
  });

  it('never marks FINDER modules as flexible', () => {
    const qr = generateQR({ data: 'HELLO', errorCorrection: 'H' });
    const flexible = getFlexibleModules(qr.moduleTypes);

    for (let r = 0; r < qr.size; r++) {
      for (let c = 0; c < qr.size; c++) {
        if (
          qr.moduleTypes[r][c] === MODULE_TYPE.FINDER ||
          qr.moduleTypes[r][c] === MODULE_TYPE.FINDER_INNER
        ) {
          expect(flexible[r][c]).toBe(false);
        }
      }
    }
  });

  it('never marks TIMING modules as flexible', () => {
    const qr = generateQR({ data: 'HELLO', errorCorrection: 'H' });
    const flexible = getFlexibleModules(qr.moduleTypes);

    for (let r = 0; r < qr.size; r++) {
      for (let c = 0; c < qr.size; c++) {
        if (qr.moduleTypes[r][c] === MODULE_TYPE.TIMING) {
          expect(flexible[r][c]).toBe(false);
        }
      }
    }
  });

  it('respects excludeRegion parameter', () => {
    const qr = generateQR({ data: 'TEST', errorCorrection: 'H' });
    const center = Math.floor(qr.size / 2);
    const region = { x: center - 2, y: center - 2, width: 5, height: 5 };

    const flexible = getFlexibleModules(qr.moduleTypes, region);

    // All modules within the exclude region should be non-flexible
    for (let r = region.y; r < region.y + region.height; r++) {
      for (let c = region.x; c < region.x + region.width; c++) {
        if (r >= 0 && r < qr.size && c >= 0 && c < qr.size) {
          expect(flexible[r][c]).toBe(false);
        }
      }
    }
  });

  it('returns correct dimensions matching input', () => {
    const qr = generateQR({ data: 'A', errorCorrection: 'H' });
    const flexible = getFlexibleModules(qr.moduleTypes);
    expect(flexible.length).toBe(qr.moduleTypes.length);
    expect(flexible[0].length).toBe(qr.moduleTypes[0].length);
  });

  it('excludeRegion does not affect modules outside the region', () => {
    const qr = generateQR({ data: 'TEST', errorCorrection: 'H' });
    const withoutExclude = getFlexibleModules(qr.moduleTypes);
    const withExclude = getFlexibleModules(qr.moduleTypes, {
      x: 10, y: 10, width: 3, height: 3,
    });

    // Modules outside the region should be the same
    for (let r = 0; r < qr.size; r++) {
      for (let c = 0; c < qr.size; c++) {
        if (r < 10 || r >= 13 || c < 10 || c >= 13) {
          expect(withExclude[r][c]).toBe(withoutExclude[r][c]);
        }
      }
    }
  });
});
