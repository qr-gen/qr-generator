import { base64Decode } from '../utils/base64.js';
import { decodePNG, type DecodedPNG } from '../png/decoder.js';

/**
 * Decode a base64 data URI (PNG format) into RGBA pixel data.
 * Expects format: data:image/png;base64,<data>
 */
export function decodeImageFromDataURI(dataURI: string): DecodedPNG {
  // Validate and extract the base64 portion
  const match = dataURI.match(/^data:image\/png[^;]*;(?:[^;]*;)*base64,(.+)$/s);
  if (!match) {
    if (dataURI.startsWith('data:')) {
      throw new Error('Halftone: only PNG data URIs are supported');
    }
    throw new Error('Halftone: invalid data URI format, expected data:image/png;base64,...');
  }

  const base64Data = match[1];
  const pngBytes = base64Decode(base64Data);
  return decodePNG(pngBytes);
}
