export { renderSVG } from './svg/renderer';
export { renderPNG } from './png/renderer';
export { renderBMP } from './bmp/renderer';
export { renderCanvas } from './canvas/renderer';
export { renderDataURI } from './data-uri/renderer';
export type { DataURIFormat } from './data-uri/renderer';
export { createQRSVG } from './create-qr-svg';
export type { CreateQROptions, CreateQRSVGResult } from './create-qr-svg';
export { createQR } from './create-qr';
export type { CreateQRResult } from './create-qr';
export { contrastRatio } from './validation/contrast';
export { validateRenderOptions } from './validation/validate';
export { computeScannability } from './validation/scannability';
export type { ScannabilityResult, ScannabilityBreakdown } from './validation/scannability';
export { computeLogoBounds, isModuleInLogoBounds } from './svg/logo';
export type { LogoBounds } from './svg/logo';
export type {
  RenderOptions,
  ModuleShape,
  FinderShape,
  GradientConfig,
  ColorConfig,
  LogoConfig,
  ValidationCode,
  ValidationSeverity,
  ValidationIssue,
  ValidationResult,
  OutputFormat,
} from './types';
