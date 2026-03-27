import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useQRCode } from '../src/hooks/useQRCode';

describe('useQRCode', () => {
  it('returns a QR code result', () => {
    const { result } = renderHook(() => useQRCode({ value: 'HELLO WORLD' }));
    expect(result.current.matrix).toBeDefined();
    expect(result.current.version).toBe(1);
    expect(result.current.size).toBe(21);
  });

  it('returns matrix with correct dimensions', () => {
    const { result } = renderHook(() => useQRCode({ value: 'TEST' }));
    expect(result.current.matrix).toHaveLength(result.current.size);
    expect(result.current.matrix[0]).toHaveLength(result.current.size);
  });

  it('memoizes on same input', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useQRCode({ value }),
      { initialProps: { value: 'HELLO' } },
    );
    const first = result.current.matrix;
    rerender({ value: 'HELLO' });
    expect(result.current.matrix).toBe(first); // same reference
  });

  it('recomputes on different input', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useQRCode({ value }),
      { initialProps: { value: 'AAA' } },
    );
    const first = result.current.matrix;
    rerender({ value: 'BBB' });
    expect(result.current.matrix).not.toBe(first); // different reference
  });

  it('respects error correction level', () => {
    const { result } = renderHook(() =>
      useQRCode({ value: 'TEST', errorCorrection: 'H' }),
    );
    expect(result.current).toBeDefined();
  });

  describe('hasLogo support', () => {
    it('auto-upgrades EC to H when hasLogo is true', () => {
      const { result } = renderHook(() =>
        useQRCode({ value: 'TEST', errorCorrection: 'L', hasLogo: true }),
      );
      expect(result.current.errorCorrection).toBe('H');
    });

    it('does not upgrade EC when hasLogo is false', () => {
      const { result } = renderHook(() =>
        useQRCode({ value: 'TEST', errorCorrection: 'L', hasLogo: false }),
      );
      expect(result.current.errorCorrection).toBe('L');
    });

    it('does not upgrade EC when hasLogo is not specified', () => {
      const { result } = renderHook(() =>
        useQRCode({ value: 'TEST', errorCorrection: 'M' }),
      );
      expect(result.current.errorCorrection).toBe('M');
    });

    it('uses H by default when hasLogo is true and no EC specified', () => {
      const { result } = renderHook(() =>
        useQRCode({ value: 'TEST', hasLogo: true }),
      );
      expect(result.current.errorCorrection).toBe('H');
    });
  });

  it('returns moduleTypes array', () => {
    const { result } = renderHook(() => useQRCode({ value: 'TEST' }));
    expect(result.current.moduleTypes).toBeDefined();
    expect(Array.isArray(result.current.moduleTypes)).toBe(true);
    expect(result.current.moduleTypes.length).toBe(result.current.size);
  });
});
