import type { EncodingMode, ErrorCorrectionLevel } from '../types';
import { MODE_INDICATOR } from '../types';
import { BitBuffer } from './bit-buffer';
import { NumericEncoder } from './numeric';
import { AlphanumericEncoder } from './alphanumeric';
import { ByteEncoder } from './byte';
import { selectMode } from './mode-selector';
import { VERSION_CAPACITY } from '../tables/version-capacity';
import { EC_BLOCKS } from '../tables/ec-blocks';
import { DataTooLongError, InvalidVersionError } from '../errors';

const numericEncoder = new NumericEncoder();
const alphanumericEncoder = new AlphanumericEncoder();
const byteEncoder = new ByteEncoder();

function getEncoder(mode: EncodingMode) {
  switch (mode) {
    case 'numeric': return numericEncoder;
    case 'alphanumeric': return alphanumericEncoder;
    case 'byte': return byteEncoder;
  }
}

function findMinVersion(data: string, mode: EncodingMode, ec: ErrorCorrectionLevel, minVersion: number): number {
  const encoder = getEncoder(mode);
  const dataLength = encoder.getDataLength(data);
  for (let v = minVersion; v <= 40; v++) {
    if (dataLength <= VERSION_CAPACITY[v][ec][mode]) {
      return v;
    }
  }
  throw new DataTooLongError(dataLength, VERSION_CAPACITY[40][ec][mode], ec);
}

export interface EncodedData {
  codewords: Uint8Array;
  version: number;
  mode: EncodingMode;
  errorCorrection: ErrorCorrectionLevel;
}

export function encodeData(
  data: string,
  version: number | undefined,
  ec: ErrorCorrectionLevel | undefined,
): EncodedData {
  const errorCorrection = ec ?? 'M';
  const mode = selectMode(data);
  const encoder = getEncoder(mode);

  // Determine version
  let ver: number;
  if (version !== undefined) {
    if (version < 1 || version > 40) {
      throw new InvalidVersionError(version, 'Version must be between 1 and 40.');
    }
    const dataLength = encoder.getDataLength(data);
    const capacity = VERSION_CAPACITY[version][errorCorrection][mode];
    if (dataLength > capacity) {
      throw new DataTooLongError(dataLength, capacity, errorCorrection);
    }
    ver = version;
  } else {
    ver = findMinVersion(data, mode, errorCorrection, 1);
  }

  const totalDataCodewords = EC_BLOCKS[ver][errorCorrection].totalDataCodewords;

  // Build bit stream
  const buffer = new BitBuffer();

  // Mode indicator (4 bits)
  buffer.put(MODE_INDICATOR[mode], 4);

  // Character count indicator
  const charCountBits = encoder.getCharCountBits(ver);
  buffer.put(encoder.getDataLength(data), charCountBits);

  // Encoded data
  encoder.encode(data, buffer);

  // Terminator: up to 4 zero bits, but don't exceed total capacity
  const totalBits = totalDataCodewords * 8;
  const terminatorLength = Math.min(4, totalBits - buffer.getLengthInBits());
  if (terminatorLength > 0) {
    buffer.put(0, terminatorLength);
  }

  // Pad to byte boundary
  while (buffer.getLengthInBits() % 8 !== 0) {
    buffer.put(0, 1);
  }

  // Pad with alternating 0xEC, 0x11 to fill capacity
  const padBytes = [0xEC, 0x11];
  let padIndex = 0;
  while (buffer.getLengthInBits() < totalBits) {
    buffer.put(padBytes[padIndex], 8);
    padIndex = (padIndex + 1) % 2;
  }

  return {
    codewords: buffer.getBytes(),
    version: ver,
    mode,
    errorCorrection,
  };
}
