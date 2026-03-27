import type { EncodingMode } from '../types';
import { NumericEncoder } from './numeric';
import { AlphanumericEncoder } from './alphanumeric';

const numericEncoder = new NumericEncoder();
const alphanumericEncoder = new AlphanumericEncoder();

export function selectMode(data: string): EncodingMode {
  if (numericEncoder.canEncode(data)) return 'numeric';
  if (alphanumericEncoder.canEncode(data)) return 'alphanumeric';
  return 'byte';
}
