import { describe, it, expect } from 'vitest';
import * as CoreExports from '../src/index';

describe('barrel exports', () => {
  it('exports generateQR', () => {
    expect(CoreExports.generateQR).toBeDefined();
    expect(typeof CoreExports.generateQR).toBe('function');
  });

  it('exports clearQRCache', () => {
    expect(CoreExports.clearQRCache).toBeDefined();
    expect(typeof CoreExports.clearQRCache).toBe('function');
  });

  it('exports data helpers', () => {
    expect(typeof CoreExports.formatWifi).toBe('function');
    expect(typeof CoreExports.formatVCard).toBe('function');
    expect(typeof CoreExports.formatCalendarEvent).toBe('function');
    expect(typeof CoreExports.formatSMS).toBe('function');
    expect(typeof CoreExports.formatEmail).toBe('function');
    expect(typeof CoreExports.formatGeo).toBe('function');
  });
});
