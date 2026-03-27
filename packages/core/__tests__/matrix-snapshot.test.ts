import { describe, it, expect, beforeEach } from 'vitest';
import { generateQR, clearQRCache } from '../src/generate';

describe('matrix snapshots', () => {
  // Clear cache before each to ensure deterministic results
  beforeEach(() => { clearQRCache(); });

  it('HELLO snapshot', () => {
    const result = generateQR({ data: 'HELLO' });
    expect(result.matrix).toMatchSnapshot();
    expect(result.moduleTypes).toMatchSnapshot();
  });

  it('numeric with EC=H snapshot', () => {
    const result = generateQR({ data: '12345', errorCorrection: 'H' });
    expect(result.matrix).toMatchSnapshot();
    expect(result.moduleTypes).toMatchSnapshot();
  });

  it('URL snapshot', () => {
    const result = generateQR({ data: 'https://example.com' });
    expect(result.matrix).toMatchSnapshot();
    expect(result.moduleTypes).toMatchSnapshot();
  });

  it('long data (version 7+) snapshot', () => {
    // 180 alphanumeric chars require version 7+ with default EC (M)
    const longData = 'A'.repeat(180);
    const result = generateQR({ data: longData });
    expect(result.version).toBeGreaterThanOrEqual(7);
    expect(result.matrix).toMatchSnapshot();
    expect(result.moduleTypes).toMatchSnapshot();
  });
});
