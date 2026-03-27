import { ErrorCorrectionLevel } from '../types';

/**
 * Error correction block structure per version and EC level.
 *
 * Defines how data codewords are split into blocks and how many
 * EC codewords each block receives.
 *
 * Source: ISO/IEC 18004, Table 9
 */

export interface ECBlockGroup {
  /** Number of blocks in this group */
  count: number;
  /** Data codewords per block in this group */
  dataCodewords: number;
}

export interface ECInfo {
  /** Total number of data codewords for this version/EC combination */
  totalDataCodewords: number;
  /** Number of error correction codewords per block */
  ecCodewordsPerBlock: number;
  /** Block groups (1 or 2 groups with potentially different data codeword counts) */
  groups: ECBlockGroup[];
}

/**
 * EC_BLOCKS[version][ecLevel] = ECInfo
 * Index 0 is unused; versions are 1-indexed.
 */
export const EC_BLOCKS: Record<ErrorCorrectionLevel, ECInfo>[] = [
  {} as Record<ErrorCorrectionLevel, ECInfo>, // index 0 unused
  // Version 1
  {
    L: { totalDataCodewords: 19, ecCodewordsPerBlock: 7, groups: [{ count: 1, dataCodewords: 19 }] },
    M: { totalDataCodewords: 16, ecCodewordsPerBlock: 10, groups: [{ count: 1, dataCodewords: 16 }] },
    Q: { totalDataCodewords: 13, ecCodewordsPerBlock: 13, groups: [{ count: 1, dataCodewords: 13 }] },
    H: { totalDataCodewords: 9, ecCodewordsPerBlock: 17, groups: [{ count: 1, dataCodewords: 9 }] },
  },
  // Version 2
  {
    L: { totalDataCodewords: 34, ecCodewordsPerBlock: 10, groups: [{ count: 1, dataCodewords: 34 }] },
    M: { totalDataCodewords: 28, ecCodewordsPerBlock: 16, groups: [{ count: 1, dataCodewords: 28 }] },
    Q: { totalDataCodewords: 22, ecCodewordsPerBlock: 22, groups: [{ count: 1, dataCodewords: 22 }] },
    H: { totalDataCodewords: 16, ecCodewordsPerBlock: 28, groups: [{ count: 1, dataCodewords: 16 }] },
  },
  // Version 3
  {
    L: { totalDataCodewords: 55, ecCodewordsPerBlock: 15, groups: [{ count: 1, dataCodewords: 55 }] },
    M: { totalDataCodewords: 44, ecCodewordsPerBlock: 26, groups: [{ count: 1, dataCodewords: 44 }] },
    Q: { totalDataCodewords: 34, ecCodewordsPerBlock: 18, groups: [{ count: 2, dataCodewords: 17 }] },
    H: { totalDataCodewords: 26, ecCodewordsPerBlock: 22, groups: [{ count: 2, dataCodewords: 13 }] },
  },
  // Version 4
  {
    L: { totalDataCodewords: 80, ecCodewordsPerBlock: 20, groups: [{ count: 1, dataCodewords: 80 }] },
    M: { totalDataCodewords: 64, ecCodewordsPerBlock: 18, groups: [{ count: 2, dataCodewords: 32 }] },
    Q: { totalDataCodewords: 48, ecCodewordsPerBlock: 26, groups: [{ count: 2, dataCodewords: 24 }] },
    H: { totalDataCodewords: 36, ecCodewordsPerBlock: 16, groups: [{ count: 4, dataCodewords: 9 }] },
  },
  // Version 5
  {
    L: { totalDataCodewords: 108, ecCodewordsPerBlock: 26, groups: [{ count: 1, dataCodewords: 108 }] },
    M: { totalDataCodewords: 86, ecCodewordsPerBlock: 24, groups: [{ count: 2, dataCodewords: 43 }] },
    Q: { totalDataCodewords: 62, ecCodewordsPerBlock: 18, groups: [{ count: 2, dataCodewords: 15 }, { count: 2, dataCodewords: 16 }] },
    H: { totalDataCodewords: 46, ecCodewordsPerBlock: 22, groups: [{ count: 2, dataCodewords: 11 }, { count: 2, dataCodewords: 12 }] },
  },
  // Version 6
  {
    L: { totalDataCodewords: 136, ecCodewordsPerBlock: 18, groups: [{ count: 2, dataCodewords: 68 }] },
    M: { totalDataCodewords: 108, ecCodewordsPerBlock: 16, groups: [{ count: 4, dataCodewords: 27 }] },
    Q: { totalDataCodewords: 76, ecCodewordsPerBlock: 24, groups: [{ count: 4, dataCodewords: 19 }] },
    H: { totalDataCodewords: 60, ecCodewordsPerBlock: 28, groups: [{ count: 4, dataCodewords: 15 }] },
  },
  // Version 7
  {
    L: { totalDataCodewords: 156, ecCodewordsPerBlock: 20, groups: [{ count: 2, dataCodewords: 78 }] },
    M: { totalDataCodewords: 124, ecCodewordsPerBlock: 18, groups: [{ count: 4, dataCodewords: 31 }] },
    Q: { totalDataCodewords: 88, ecCodewordsPerBlock: 18, groups: [{ count: 2, dataCodewords: 14 }, { count: 4, dataCodewords: 15 }] },
    H: { totalDataCodewords: 66, ecCodewordsPerBlock: 26, groups: [{ count: 4, dataCodewords: 13 }, { count: 1, dataCodewords: 14 }] },
  },
  // Version 8
  {
    L: { totalDataCodewords: 194, ecCodewordsPerBlock: 24, groups: [{ count: 2, dataCodewords: 97 }] },
    M: { totalDataCodewords: 154, ecCodewordsPerBlock: 22, groups: [{ count: 2, dataCodewords: 38 }, { count: 2, dataCodewords: 39 }] },
    Q: { totalDataCodewords: 110, ecCodewordsPerBlock: 22, groups: [{ count: 4, dataCodewords: 18 }, { count: 2, dataCodewords: 19 }] },
    H: { totalDataCodewords: 86, ecCodewordsPerBlock: 26, groups: [{ count: 4, dataCodewords: 14 }, { count: 2, dataCodewords: 15 }] },
  },
  // Version 9
  {
    L: { totalDataCodewords: 232, ecCodewordsPerBlock: 30, groups: [{ count: 2, dataCodewords: 116 }] },
    M: { totalDataCodewords: 182, ecCodewordsPerBlock: 22, groups: [{ count: 3, dataCodewords: 36 }, { count: 2, dataCodewords: 37 }] },
    Q: { totalDataCodewords: 132, ecCodewordsPerBlock: 20, groups: [{ count: 4, dataCodewords: 16 }, { count: 4, dataCodewords: 17 }] },
    H: { totalDataCodewords: 100, ecCodewordsPerBlock: 24, groups: [{ count: 4, dataCodewords: 12 }, { count: 4, dataCodewords: 13 }] },
  },
  // Version 10
  {
    L: { totalDataCodewords: 274, ecCodewordsPerBlock: 18, groups: [{ count: 2, dataCodewords: 68 }, { count: 2, dataCodewords: 69 }] },
    M: { totalDataCodewords: 216, ecCodewordsPerBlock: 26, groups: [{ count: 4, dataCodewords: 43 }, { count: 1, dataCodewords: 44 }] },
    Q: { totalDataCodewords: 154, ecCodewordsPerBlock: 24, groups: [{ count: 6, dataCodewords: 19 }, { count: 2, dataCodewords: 20 }] },
    H: { totalDataCodewords: 122, ecCodewordsPerBlock: 28, groups: [{ count: 6, dataCodewords: 15 }, { count: 2, dataCodewords: 16 }] },
  },
  // Version 11
  {
    L: { totalDataCodewords: 324, ecCodewordsPerBlock: 20, groups: [{ count: 4, dataCodewords: 81 }] },
    M: { totalDataCodewords: 254, ecCodewordsPerBlock: 30, groups: [{ count: 1, dataCodewords: 50 }, { count: 4, dataCodewords: 51 }] },
    Q: { totalDataCodewords: 180, ecCodewordsPerBlock: 28, groups: [{ count: 4, dataCodewords: 22 }, { count: 4, dataCodewords: 23 }] },
    H: { totalDataCodewords: 140, ecCodewordsPerBlock: 24, groups: [{ count: 3, dataCodewords: 12 }, { count: 8, dataCodewords: 13 }] },
  },
  // Version 12
  {
    L: { totalDataCodewords: 370, ecCodewordsPerBlock: 24, groups: [{ count: 2, dataCodewords: 92 }, { count: 2, dataCodewords: 93 }] },
    M: { totalDataCodewords: 290, ecCodewordsPerBlock: 22, groups: [{ count: 6, dataCodewords: 36 }, { count: 2, dataCodewords: 37 }] },
    Q: { totalDataCodewords: 206, ecCodewordsPerBlock: 26, groups: [{ count: 4, dataCodewords: 20 }, { count: 6, dataCodewords: 21 }] },
    H: { totalDataCodewords: 158, ecCodewordsPerBlock: 28, groups: [{ count: 7, dataCodewords: 14 }, { count: 4, dataCodewords: 15 }] },
  },
  // Version 13
  {
    L: { totalDataCodewords: 428, ecCodewordsPerBlock: 26, groups: [{ count: 4, dataCodewords: 107 }] },
    M: { totalDataCodewords: 334, ecCodewordsPerBlock: 22, groups: [{ count: 8, dataCodewords: 37 }, { count: 1, dataCodewords: 38 }] },
    Q: { totalDataCodewords: 244, ecCodewordsPerBlock: 24, groups: [{ count: 8, dataCodewords: 20 }, { count: 4, dataCodewords: 21 }] },
    H: { totalDataCodewords: 180, ecCodewordsPerBlock: 22, groups: [{ count: 12, dataCodewords: 11 }, { count: 4, dataCodewords: 12 }] },
  },
  // Version 14
  {
    L: { totalDataCodewords: 461, ecCodewordsPerBlock: 30, groups: [{ count: 3, dataCodewords: 115 }, { count: 1, dataCodewords: 116 }] },
    M: { totalDataCodewords: 365, ecCodewordsPerBlock: 24, groups: [{ count: 4, dataCodewords: 40 }, { count: 5, dataCodewords: 41 }] },
    Q: { totalDataCodewords: 261, ecCodewordsPerBlock: 20, groups: [{ count: 11, dataCodewords: 16 }, { count: 5, dataCodewords: 17 }] },
    H: { totalDataCodewords: 197, ecCodewordsPerBlock: 24, groups: [{ count: 11, dataCodewords: 12 }, { count: 5, dataCodewords: 13 }] },
  },
  // Version 15
  {
    L: { totalDataCodewords: 523, ecCodewordsPerBlock: 22, groups: [{ count: 5, dataCodewords: 87 }, { count: 1, dataCodewords: 88 }] },
    M: { totalDataCodewords: 415, ecCodewordsPerBlock: 24, groups: [{ count: 5, dataCodewords: 41 }, { count: 5, dataCodewords: 42 }] },
    Q: { totalDataCodewords: 295, ecCodewordsPerBlock: 30, groups: [{ count: 5, dataCodewords: 24 }, { count: 7, dataCodewords: 25 }] },
    H: { totalDataCodewords: 223, ecCodewordsPerBlock: 24, groups: [{ count: 11, dataCodewords: 12 }, { count: 7, dataCodewords: 13 }] },
  },
  // Version 16
  {
    L: { totalDataCodewords: 589, ecCodewordsPerBlock: 24, groups: [{ count: 5, dataCodewords: 98 }, { count: 1, dataCodewords: 99 }] },
    M: { totalDataCodewords: 453, ecCodewordsPerBlock: 28, groups: [{ count: 7, dataCodewords: 45 }, { count: 3, dataCodewords: 46 }] },
    Q: { totalDataCodewords: 325, ecCodewordsPerBlock: 24, groups: [{ count: 15, dataCodewords: 19 }, { count: 2, dataCodewords: 20 }] },
    H: { totalDataCodewords: 253, ecCodewordsPerBlock: 30, groups: [{ count: 3, dataCodewords: 15 }, { count: 13, dataCodewords: 16 }] },
  },
  // Version 17
  {
    L: { totalDataCodewords: 647, ecCodewordsPerBlock: 28, groups: [{ count: 1, dataCodewords: 107 }, { count: 5, dataCodewords: 108 }] },
    M: { totalDataCodewords: 507, ecCodewordsPerBlock: 28, groups: [{ count: 10, dataCodewords: 46 }, { count: 1, dataCodewords: 47 }] },
    Q: { totalDataCodewords: 367, ecCodewordsPerBlock: 28, groups: [{ count: 1, dataCodewords: 22 }, { count: 15, dataCodewords: 23 }] },
    H: { totalDataCodewords: 283, ecCodewordsPerBlock: 28, groups: [{ count: 2, dataCodewords: 14 }, { count: 17, dataCodewords: 15 }] },
  },
  // Version 18
  {
    L: { totalDataCodewords: 721, ecCodewordsPerBlock: 30, groups: [{ count: 5, dataCodewords: 120 }, { count: 1, dataCodewords: 121 }] },
    M: { totalDataCodewords: 563, ecCodewordsPerBlock: 26, groups: [{ count: 9, dataCodewords: 43 }, { count: 4, dataCodewords: 44 }] },
    Q: { totalDataCodewords: 397, ecCodewordsPerBlock: 28, groups: [{ count: 17, dataCodewords: 22 }, { count: 1, dataCodewords: 23 }] },
    H: { totalDataCodewords: 313, ecCodewordsPerBlock: 28, groups: [{ count: 2, dataCodewords: 14 }, { count: 19, dataCodewords: 15 }] },
  },
  // Version 19
  {
    L: { totalDataCodewords: 795, ecCodewordsPerBlock: 28, groups: [{ count: 3, dataCodewords: 113 }, { count: 4, dataCodewords: 114 }] },
    M: { totalDataCodewords: 627, ecCodewordsPerBlock: 26, groups: [{ count: 3, dataCodewords: 44 }, { count: 11, dataCodewords: 45 }] },
    Q: { totalDataCodewords: 445, ecCodewordsPerBlock: 26, groups: [{ count: 17, dataCodewords: 21 }, { count: 4, dataCodewords: 22 }] },
    H: { totalDataCodewords: 341, ecCodewordsPerBlock: 26, groups: [{ count: 9, dataCodewords: 13 }, { count: 16, dataCodewords: 14 }] },
  },
  // Version 20
  {
    L: { totalDataCodewords: 861, ecCodewordsPerBlock: 28, groups: [{ count: 3, dataCodewords: 107 }, { count: 5, dataCodewords: 108 }] },
    M: { totalDataCodewords: 669, ecCodewordsPerBlock: 26, groups: [{ count: 3, dataCodewords: 41 }, { count: 13, dataCodewords: 42 }] },
    Q: { totalDataCodewords: 485, ecCodewordsPerBlock: 28, groups: [{ count: 15, dataCodewords: 24 }, { count: 5, dataCodewords: 25 }] },
    H: { totalDataCodewords: 385, ecCodewordsPerBlock: 28, groups: [{ count: 15, dataCodewords: 15 }, { count: 10, dataCodewords: 16 }] },
  },
  // Version 21
  {
    L: { totalDataCodewords: 932, ecCodewordsPerBlock: 28, groups: [{ count: 4, dataCodewords: 116 }, { count: 4, dataCodewords: 117 }] },
    M: { totalDataCodewords: 714, ecCodewordsPerBlock: 26, groups: [{ count: 17, dataCodewords: 42 }] },
    Q: { totalDataCodewords: 512, ecCodewordsPerBlock: 30, groups: [{ count: 17, dataCodewords: 22 }, { count: 6, dataCodewords: 23 }] },
    H: { totalDataCodewords: 406, ecCodewordsPerBlock: 28, groups: [{ count: 19, dataCodewords: 16 }, { count: 6, dataCodewords: 17 }] },
  },
  // Version 22
  {
    L: { totalDataCodewords: 1006, ecCodewordsPerBlock: 28, groups: [{ count: 2, dataCodewords: 111 }, { count: 7, dataCodewords: 112 }] },
    M: { totalDataCodewords: 782, ecCodewordsPerBlock: 28, groups: [{ count: 17, dataCodewords: 46 }] },
    Q: { totalDataCodewords: 568, ecCodewordsPerBlock: 24, groups: [{ count: 7, dataCodewords: 24 }, { count: 16, dataCodewords: 25 }] },
    H: { totalDataCodewords: 442, ecCodewordsPerBlock: 28, groups: [{ count: 34, dataCodewords: 13 }] },
  },
  // Version 23
  {
    L: { totalDataCodewords: 1094, ecCodewordsPerBlock: 30, groups: [{ count: 4, dataCodewords: 121 }, { count: 5, dataCodewords: 122 }] },
    M: { totalDataCodewords: 860, ecCodewordsPerBlock: 28, groups: [{ count: 4, dataCodewords: 47 }, { count: 14, dataCodewords: 48 }] },
    Q: { totalDataCodewords: 614, ecCodewordsPerBlock: 30, groups: [{ count: 11, dataCodewords: 24 }, { count: 14, dataCodewords: 25 }] },
    H: { totalDataCodewords: 464, ecCodewordsPerBlock: 28, groups: [{ count: 16, dataCodewords: 15 }, { count: 14, dataCodewords: 16 }] },
  },
  // Version 24
  {
    L: { totalDataCodewords: 1174, ecCodewordsPerBlock: 30, groups: [{ count: 6, dataCodewords: 117 }, { count: 4, dataCodewords: 118 }] },
    M: { totalDataCodewords: 914, ecCodewordsPerBlock: 28, groups: [{ count: 6, dataCodewords: 45 }, { count: 14, dataCodewords: 46 }] },
    Q: { totalDataCodewords: 664, ecCodewordsPerBlock: 30, groups: [{ count: 11, dataCodewords: 24 }, { count: 16, dataCodewords: 25 }] },
    H: { totalDataCodewords: 514, ecCodewordsPerBlock: 28, groups: [{ count: 30, dataCodewords: 16 }, { count: 2, dataCodewords: 17 }] },
  },
  // Version 25
  {
    L: { totalDataCodewords: 1276, ecCodewordsPerBlock: 26, groups: [{ count: 8, dataCodewords: 106 }, { count: 4, dataCodewords: 107 }] },
    M: { totalDataCodewords: 1000, ecCodewordsPerBlock: 28, groups: [{ count: 8, dataCodewords: 47 }, { count: 13, dataCodewords: 48 }] },
    Q: { totalDataCodewords: 718, ecCodewordsPerBlock: 30, groups: [{ count: 7, dataCodewords: 24 }, { count: 22, dataCodewords: 25 }] },
    H: { totalDataCodewords: 538, ecCodewordsPerBlock: 28, groups: [{ count: 22, dataCodewords: 15 }, { count: 13, dataCodewords: 16 }] },
  },
  // Version 26
  {
    L: { totalDataCodewords: 1370, ecCodewordsPerBlock: 28, groups: [{ count: 10, dataCodewords: 114 }, { count: 2, dataCodewords: 115 }] },
    M: { totalDataCodewords: 1062, ecCodewordsPerBlock: 28, groups: [{ count: 19, dataCodewords: 46 }, { count: 4, dataCodewords: 47 }] },
    Q: { totalDataCodewords: 754, ecCodewordsPerBlock: 28, groups: [{ count: 28, dataCodewords: 22 }, { count: 6, dataCodewords: 23 }] },
    H: { totalDataCodewords: 596, ecCodewordsPerBlock: 28, groups: [{ count: 33, dataCodewords: 16 }, { count: 4, dataCodewords: 17 }] },
  },
  // Version 27
  {
    L: { totalDataCodewords: 1468, ecCodewordsPerBlock: 30, groups: [{ count: 8, dataCodewords: 122 }, { count: 4, dataCodewords: 123 }] },
    M: { totalDataCodewords: 1128, ecCodewordsPerBlock: 28, groups: [{ count: 22, dataCodewords: 45 }, { count: 3, dataCodewords: 46 }] },
    Q: { totalDataCodewords: 808, ecCodewordsPerBlock: 30, groups: [{ count: 8, dataCodewords: 23 }, { count: 26, dataCodewords: 24 }] },
    H: { totalDataCodewords: 628, ecCodewordsPerBlock: 28, groups: [{ count: 12, dataCodewords: 15 }, { count: 28, dataCodewords: 16 }] },
  },
  // Version 28
  {
    L: { totalDataCodewords: 1531, ecCodewordsPerBlock: 30, groups: [{ count: 3, dataCodewords: 117 }, { count: 10, dataCodewords: 118 }] },
    M: { totalDataCodewords: 1193, ecCodewordsPerBlock: 28, groups: [{ count: 3, dataCodewords: 45 }, { count: 23, dataCodewords: 46 }] },
    Q: { totalDataCodewords: 871, ecCodewordsPerBlock: 30, groups: [{ count: 4, dataCodewords: 24 }, { count: 31, dataCodewords: 25 }] },
    H: { totalDataCodewords: 661, ecCodewordsPerBlock: 28, groups: [{ count: 11, dataCodewords: 15 }, { count: 31, dataCodewords: 16 }] },
  },
  // Version 29
  {
    L: { totalDataCodewords: 1631, ecCodewordsPerBlock: 30, groups: [{ count: 7, dataCodewords: 116 }, { count: 7, dataCodewords: 117 }] },
    M: { totalDataCodewords: 1267, ecCodewordsPerBlock: 28, groups: [{ count: 21, dataCodewords: 45 }, { count: 7, dataCodewords: 46 }] },
    Q: { totalDataCodewords: 911, ecCodewordsPerBlock: 30, groups: [{ count: 1, dataCodewords: 23 }, { count: 37, dataCodewords: 24 }] },
    H: { totalDataCodewords: 701, ecCodewordsPerBlock: 28, groups: [{ count: 19, dataCodewords: 15 }, { count: 26, dataCodewords: 16 }] },
  },
  // Version 30
  {
    L: { totalDataCodewords: 1735, ecCodewordsPerBlock: 30, groups: [{ count: 5, dataCodewords: 115 }, { count: 10, dataCodewords: 116 }] },
    M: { totalDataCodewords: 1373, ecCodewordsPerBlock: 28, groups: [{ count: 19, dataCodewords: 47 }, { count: 10, dataCodewords: 48 }] },
    Q: { totalDataCodewords: 985, ecCodewordsPerBlock: 30, groups: [{ count: 15, dataCodewords: 24 }, { count: 25, dataCodewords: 25 }] },
    H: { totalDataCodewords: 745, ecCodewordsPerBlock: 28, groups: [{ count: 23, dataCodewords: 15 }, { count: 25, dataCodewords: 16 }] },
  },
  // Version 31
  {
    L: { totalDataCodewords: 1843, ecCodewordsPerBlock: 30, groups: [{ count: 13, dataCodewords: 115 }, { count: 3, dataCodewords: 116 }] },
    M: { totalDataCodewords: 1455, ecCodewordsPerBlock: 28, groups: [{ count: 2, dataCodewords: 46 }, { count: 29, dataCodewords: 47 }] },
    Q: { totalDataCodewords: 1033, ecCodewordsPerBlock: 30, groups: [{ count: 42, dataCodewords: 24 }, { count: 1, dataCodewords: 25 }] },
    H: { totalDataCodewords: 793, ecCodewordsPerBlock: 28, groups: [{ count: 23, dataCodewords: 15 }, { count: 28, dataCodewords: 16 }] },
  },
  // Version 32
  {
    L: { totalDataCodewords: 1955, ecCodewordsPerBlock: 30, groups: [{ count: 17, dataCodewords: 115 }] },
    M: { totalDataCodewords: 1541, ecCodewordsPerBlock: 28, groups: [{ count: 10, dataCodewords: 46 }, { count: 23, dataCodewords: 47 }] },
    Q: { totalDataCodewords: 1115, ecCodewordsPerBlock: 30, groups: [{ count: 10, dataCodewords: 24 }, { count: 35, dataCodewords: 25 }] },
    H: { totalDataCodewords: 845, ecCodewordsPerBlock: 28, groups: [{ count: 19, dataCodewords: 15 }, { count: 35, dataCodewords: 16 }] },
  },
  // Version 33
  {
    L: { totalDataCodewords: 2071, ecCodewordsPerBlock: 30, groups: [{ count: 17, dataCodewords: 115 }, { count: 1, dataCodewords: 116 }] },
    M: { totalDataCodewords: 1631, ecCodewordsPerBlock: 28, groups: [{ count: 14, dataCodewords: 46 }, { count: 21, dataCodewords: 47 }] },
    Q: { totalDataCodewords: 1171, ecCodewordsPerBlock: 30, groups: [{ count: 29, dataCodewords: 24 }, { count: 19, dataCodewords: 25 }] },
    H: { totalDataCodewords: 901, ecCodewordsPerBlock: 28, groups: [{ count: 11, dataCodewords: 15 }, { count: 46, dataCodewords: 16 }] },
  },
  // Version 34
  {
    L: { totalDataCodewords: 2191, ecCodewordsPerBlock: 30, groups: [{ count: 13, dataCodewords: 115 }, { count: 6, dataCodewords: 116 }] },
    M: { totalDataCodewords: 1725, ecCodewordsPerBlock: 28, groups: [{ count: 14, dataCodewords: 46 }, { count: 23, dataCodewords: 47 }] },
    Q: { totalDataCodewords: 1231, ecCodewordsPerBlock: 30, groups: [{ count: 44, dataCodewords: 24 }, { count: 7, dataCodewords: 25 }] },
    H: { totalDataCodewords: 961, ecCodewordsPerBlock: 28, groups: [{ count: 59, dataCodewords: 16 }, { count: 1, dataCodewords: 17 }] },
  },
  // Version 35
  {
    L: { totalDataCodewords: 2306, ecCodewordsPerBlock: 30, groups: [{ count: 12, dataCodewords: 121 }, { count: 7, dataCodewords: 122 }] },
    M: { totalDataCodewords: 1812, ecCodewordsPerBlock: 28, groups: [{ count: 12, dataCodewords: 47 }, { count: 26, dataCodewords: 48 }] },
    Q: { totalDataCodewords: 1286, ecCodewordsPerBlock: 30, groups: [{ count: 39, dataCodewords: 24 }, { count: 14, dataCodewords: 25 }] },
    H: { totalDataCodewords: 986, ecCodewordsPerBlock: 28, groups: [{ count: 22, dataCodewords: 15 }, { count: 41, dataCodewords: 16 }] },
  },
  // Version 36
  {
    L: { totalDataCodewords: 2434, ecCodewordsPerBlock: 30, groups: [{ count: 6, dataCodewords: 121 }, { count: 14, dataCodewords: 122 }] },
    M: { totalDataCodewords: 1914, ecCodewordsPerBlock: 28, groups: [{ count: 6, dataCodewords: 47 }, { count: 34, dataCodewords: 48 }] },
    Q: { totalDataCodewords: 1354, ecCodewordsPerBlock: 30, groups: [{ count: 46, dataCodewords: 24 }, { count: 10, dataCodewords: 25 }] },
    H: { totalDataCodewords: 1054, ecCodewordsPerBlock: 28, groups: [{ count: 2, dataCodewords: 15 }, { count: 64, dataCodewords: 16 }] },
  },
  // Version 37
  {
    L: { totalDataCodewords: 2566, ecCodewordsPerBlock: 30, groups: [{ count: 17, dataCodewords: 122 }, { count: 4, dataCodewords: 123 }] },
    M: { totalDataCodewords: 1992, ecCodewordsPerBlock: 28, groups: [{ count: 29, dataCodewords: 46 }, { count: 14, dataCodewords: 47 }] },
    Q: { totalDataCodewords: 1426, ecCodewordsPerBlock: 30, groups: [{ count: 49, dataCodewords: 24 }, { count: 10, dataCodewords: 25 }] },
    H: { totalDataCodewords: 1096, ecCodewordsPerBlock: 28, groups: [{ count: 24, dataCodewords: 15 }, { count: 46, dataCodewords: 16 }] },
  },
  // Version 38
  {
    L: { totalDataCodewords: 2702, ecCodewordsPerBlock: 30, groups: [{ count: 4, dataCodewords: 122 }, { count: 18, dataCodewords: 123 }] },
    M: { totalDataCodewords: 2102, ecCodewordsPerBlock: 28, groups: [{ count: 13, dataCodewords: 46 }, { count: 32, dataCodewords: 47 }] },
    Q: { totalDataCodewords: 1502, ecCodewordsPerBlock: 30, groups: [{ count: 48, dataCodewords: 24 }, { count: 14, dataCodewords: 25 }] },
    H: { totalDataCodewords: 1142, ecCodewordsPerBlock: 28, groups: [{ count: 42, dataCodewords: 15 }, { count: 32, dataCodewords: 16 }] },
  },
  // Version 39
  {
    L: { totalDataCodewords: 2812, ecCodewordsPerBlock: 30, groups: [{ count: 20, dataCodewords: 117 }, { count: 4, dataCodewords: 118 }] },
    M: { totalDataCodewords: 2216, ecCodewordsPerBlock: 28, groups: [{ count: 40, dataCodewords: 47 }, { count: 7, dataCodewords: 48 }] },
    Q: { totalDataCodewords: 1582, ecCodewordsPerBlock: 30, groups: [{ count: 43, dataCodewords: 24 }, { count: 22, dataCodewords: 25 }] },
    H: { totalDataCodewords: 1222, ecCodewordsPerBlock: 28, groups: [{ count: 10, dataCodewords: 15 }, { count: 67, dataCodewords: 16 }] },
  },
  // Version 40
  {
    L: { totalDataCodewords: 2956, ecCodewordsPerBlock: 30, groups: [{ count: 19, dataCodewords: 118 }, { count: 6, dataCodewords: 119 }] },
    M: { totalDataCodewords: 2334, ecCodewordsPerBlock: 28, groups: [{ count: 18, dataCodewords: 47 }, { count: 31, dataCodewords: 48 }] },
    Q: { totalDataCodewords: 1666, ecCodewordsPerBlock: 30, groups: [{ count: 34, dataCodewords: 24 }, { count: 34, dataCodewords: 25 }] },
    H: { totalDataCodewords: 1276, ecCodewordsPerBlock: 28, groups: [{ count: 20, dataCodewords: 15 }, { count: 61, dataCodewords: 16 }] },
  },
];
