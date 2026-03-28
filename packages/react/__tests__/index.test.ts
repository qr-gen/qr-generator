import { describe, it, expect } from 'vitest';
import { QRCode, useQRCode } from '../src/index';

describe('barrel exports', () => {
  it('exports QRCode component', () => {
    expect(QRCode).toBeDefined();
    expect(typeof QRCode).toBe('object'); // forwardRef returns an object
  });

  it('exports useQRCode hook', () => {
    expect(useQRCode).toBeDefined();
    expect(typeof useQRCode).toBe('function');
  });
});
