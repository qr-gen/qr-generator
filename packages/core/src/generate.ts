import type { QRCode, GenerateQROptions } from './types';
import { encodeData } from './encoding/data-encoder';
import { interleaveBlocks } from './error-correction/interleave';
import { buildMatrix } from './matrix/matrix-builder';

class LRUCache<V> {
  private map = new Map<string, V>();
  constructor(private capacity: number) {}
  get(key: string): V | undefined {
    const val = this.map.get(key);
    if (val !== undefined) {
      this.map.delete(key);
      this.map.set(key, val);
    }
    return val;
  }
  set(key: string, value: V): void {
    if (this.map.has(key)) this.map.delete(key);
    if (this.map.size >= this.capacity) {
      const first = this.map.keys().next().value;
      this.map.delete(first!);
    }
    this.map.set(key, value);
  }
  clear(): void { this.map.clear(); }
}

const cache = new LRUCache<QRCode>(16);

export function clearQRCache(): void { cache.clear(); }

/**
 * Generate a QR code from input data.
 * Returns the complete QR matrix with metadata.
 */
export function generateQR(options: GenerateQROptions): QRCode {
  const { data, version, errorCorrection, minVersion } = options;

  const cacheKey = JSON.stringify({ data, version, errorCorrection, minVersion });
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  // Step 1: Encode data (mode selection, version selection, bit stream assembly)
  const encoded = encodeData(
    data,
    version ?? (minVersion ? undefined : undefined),
    errorCorrection,
  );

  // Step 2: Generate EC and interleave blocks
  const codewords = interleaveBlocks(encoded.codewords, encoded.version, encoded.errorCorrection);

  // Step 3: Build the matrix
  const { matrix, moduleTypes } = buildMatrix(codewords, encoded.version, encoded.errorCorrection);

  const size = 4 * encoded.version + 17;

  const result: QRCode = {
    matrix,
    version: encoded.version,
    errorCorrection: encoded.errorCorrection,
    mode: encoded.mode,
    size,
    moduleTypes,
  };

  cache.set(cacheKey, result);

  return result;
}
