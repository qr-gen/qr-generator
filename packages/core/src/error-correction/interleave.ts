import type { ErrorCorrectionLevel } from '../types';
import { EC_BLOCKS } from '../tables/ec-blocks';
import { generateECCodewords } from './reed-solomon';

/**
 * Split data into blocks, generate EC per block, and interleave.
 * Returns the final codeword sequence ready for matrix placement.
 */
export function interleaveBlocks(
  data: Uint8Array,
  version: number,
  ec: ErrorCorrectionLevel,
): Uint8Array {
  const ecInfo = EC_BLOCKS[version][ec];
  const { ecCodewordsPerBlock, groups } = ecInfo;

  // Split data into blocks
  const dataBlocks: Uint8Array[] = [];
  let offset = 0;
  for (const group of groups) {
    for (let i = 0; i < group.count; i++) {
      dataBlocks.push(data.slice(offset, offset + group.dataCodewords));
      offset += group.dataCodewords;
    }
  }

  // Generate EC for each block
  const ecBlocks: Uint8Array[] = dataBlocks.map(block =>
    generateECCodewords(block, ecCodewordsPerBlock)
  );

  // Interleave data codewords
  const result: number[] = [];
  const maxDataBlockSize = Math.max(...dataBlocks.map(b => b.length));
  for (let i = 0; i < maxDataBlockSize; i++) {
    for (const block of dataBlocks) {
      if (i < block.length) {
        result.push(block[i]);
      }
    }
  }

  // Interleave EC codewords
  for (let i = 0; i < ecCodewordsPerBlock; i++) {
    for (const block of ecBlocks) {
      if (i < block.length) {
        result.push(block[i]);
      }
    }
  }

  return new Uint8Array(result);
}
