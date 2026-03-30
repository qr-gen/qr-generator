export { generateQR, clearQRCache } from './generate';
export type {
  QRCode,
  GenerateQROptions,
  ErrorCorrectionLevel,
  EncodingMode,
  ModuleType,
} from './types';
export { MODULE_TYPE } from './types';
export { QRError, DataTooLongError, InvalidVersionError, InvalidInputError } from './errors';

export { getFlexibleModules } from './halftone';
export type { ExcludeRegion } from './halftone';

export {
  formatWifi,
  formatVCard,
  formatCalendarEvent,
  formatSMS,
  formatEmail,
  formatGeo,
} from './data-helpers';
export type {
  WifiOptions,
  VCardOptions,
  CalendarEventOptions,
  SMSOptions,
  EmailOptions,
  GeoOptions,
} from './data-helpers';
