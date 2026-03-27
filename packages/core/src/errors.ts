export class QRError extends Error {
  readonly code: string;
  readonly suggestion?: string;

  constructor(code: string, message: string, suggestion?: string) {
    super(message);
    this.name = 'QRError';
    this.code = code;
    this.suggestion = suggestion;
  }
}

export class DataTooLongError extends QRError {
  constructor(dataLength: number, maxCapacity: number, errorCorrection: string) {
    super(
      'DATA_TOO_LONG',
      `Data length (${dataLength} bytes) exceeds maximum capacity (${maxCapacity} bytes) for error correction level '${errorCorrection}'.`,
      `Use a lower error correction level or shorten your data.`,
    );
    this.name = 'DataTooLongError';
  }
}

export class InvalidVersionError extends QRError {
  constructor(version: number, reason: string) {
    super(
      'INVALID_VERSION',
      `Invalid QR version ${version}: ${reason}`,
      `Remove the 'version' option to auto-select, or choose a version between 1 and 40.`,
    );
    this.name = 'InvalidVersionError';
  }
}

export class InvalidInputError extends QRError {
  constructor(reason: string) {
    super(
      'INVALID_INPUT',
      `Invalid input: ${reason}`,
    );
    this.name = 'InvalidInputError';
  }
}
