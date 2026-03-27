const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

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
