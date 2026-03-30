const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/** Reverse lookup table: base64 char code → 6-bit value */
const DECODE_TABLE = /* @__PURE__ */ buildDecodeTable();

function buildDecodeTable(): Uint8Array {
  const table = new Uint8Array(128).fill(0xff);
  for (let i = 0; i < ALPHABET.length; i++) {
    table[ALPHABET.charCodeAt(i)] = i;
  }
  return table;
}

/**
 * Decode a base64 string to a Uint8Array.
 * Handles standard base64 with or without padding.
 */
export function base64Decode(encoded: string): Uint8Array {
  if (encoded.length === 0) return new Uint8Array(0);

  // Strip padding to compute output length
  let end = encoded.length;
  while (end > 0 && encoded[end - 1] === '=') end--;

  const mainChunks = Math.floor(end / 4);
  const remainder = end % 4;
  const outLen = mainChunks * 3 + (remainder === 3 ? 2 : remainder === 2 ? 1 : 0);
  const out = new Uint8Array(outLen);

  let si = 0;
  let di = 0;

  // Process 4-char groups
  for (let i = 0; i < mainChunks; i++) {
    const a = DECODE_TABLE[encoded.charCodeAt(si++)];
    const b = DECODE_TABLE[encoded.charCodeAt(si++)];
    const c = DECODE_TABLE[encoded.charCodeAt(si++)];
    const d = DECODE_TABLE[encoded.charCodeAt(si++)];
    out[di++] = (a << 2) | (b >> 4);
    out[di++] = ((b & 0x0f) << 4) | (c >> 2);
    out[di++] = ((c & 0x03) << 6) | d;
  }

  // Handle remaining chars (no padding)
  if (remainder === 3) {
    const a = DECODE_TABLE[encoded.charCodeAt(si++)];
    const b = DECODE_TABLE[encoded.charCodeAt(si++)];
    const c = DECODE_TABLE[encoded.charCodeAt(si++)];
    out[di++] = (a << 2) | (b >> 4);
    out[di++] = ((b & 0x0f) << 4) | (c >> 2);
  } else if (remainder === 2) {
    const a = DECODE_TABLE[encoded.charCodeAt(si++)];
    const b = DECODE_TABLE[encoded.charCodeAt(si++)];
    out[di++] = (a << 2) | (b >> 4);
  }

  return out;
}

/**
 * Encode binary data or a string to a base64 string.
 * Uses standard base64 alphabet (A-Z, a-z, 0-9, +, /) with = padding.
 */
export function base64Encode(data: Uint8Array | string): string {
  const bytes =
    typeof data === 'string'
      ? new Uint8Array(Array.from(data, (ch) => ch.charCodeAt(0)))
      : data;

  const len = bytes.length;
  if (len === 0) return '';

  let result = '';
  let i = 0;

  // Process 3 bytes at a time into 4 base64 characters
  for (; i + 2 < len; i += 3) {
    const b0 = bytes[i];
    const b1 = bytes[i + 1];
    const b2 = bytes[i + 2];

    result +=
      ALPHABET[b0 >> 2] +
      ALPHABET[((b0 & 0x03) << 4) | (b1 >> 4)] +
      ALPHABET[((b1 & 0x0f) << 2) | (b2 >> 6)] +
      ALPHABET[b2 & 0x3f];
  }

  // Handle remaining bytes with padding
  if (i < len) {
    const b0 = bytes[i];
    result += ALPHABET[b0 >> 2];

    if (i + 1 < len) {
      // 2 bytes remaining → 3 base64 chars + 1 padding
      const b1 = bytes[i + 1];
      result +=
        ALPHABET[((b0 & 0x03) << 4) | (b1 >> 4)] +
        ALPHABET[(b1 & 0x0f) << 2] +
        '=';
    } else {
      // 1 byte remaining → 2 base64 chars + 2 padding
      result += ALPHABET[(b0 & 0x03) << 4] + '==';
    }
  }

  return result;
}
