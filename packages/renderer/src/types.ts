export interface PhysicalSize {
  width: number;
  height: number;
  unit: 'mm' | 'in';
}

export type ModuleShape = 'square' | 'rounded' | 'dots' | 'diamond';
export type FinderShape = 'square' | 'rounded' | 'circle';

export interface GradientConfig {
  type: 'linear' | 'radial';
  colors: [string, string, ...string[]];
  angle?: number;
}

export type ColorConfig = string | GradientConfig;

export interface LogoConfig {
  src: string;
  width: number;
  height: number;
  padding?: number;
}

export interface OverlayImageConfig {
  /** Image source — URL or data URI. Used as `href` in SVG `<image>`. */
  src: string;
  /** Opacity of the background image (0-1). Default: 0.3 */
  opacity?: number;
  /** Background color behind finder patterns to ensure visibility. Default: bgColor */
  finderBackgroundColor?: string;
}

export interface CustomModuleArgs {
  x: number;
  y: number;
  size: number;
  row: number;
  col: number;
  moduleType: number;
}

export interface FrameConfig {
  style: 'square' | 'rounded';
  color?: string;
  thickness?: number;
  label?: string;
  labelPosition?: 'top' | 'bottom';
  labelColor?: string;
  labelFontSize?: number;
  padding?: number;
}

export interface HalftoneImageData {
  /** RGBA pixel data, 4 bytes per pixel, row-major order */
  data: Uint8Array;
  width: number;
  height: number;
}

export interface HalftoneConfig {
  /**
   * Target image. Accepts either:
   * - A PNG base64 data URI string (`data:image/png;base64,...`)
   * - Raw RGBA pixel data (`{ data, width, height }`) for any image format
   *   decoded externally (e.g. via canvas in the browser)
   */
  image: string | HalftoneImageData;
  /** How aggressively to match the image, 0-1. Default: 0.7 */
  strength?: number;
  /** Grayscale threshold for binary conversion, 0-255. Default: 128 */
  threshold?: number;
}

export interface RenderOptions {
  size: number;
  fgColor?: ColorConfig;
  bgColor?: string;
  shape?: ModuleShape;
  finderShape?: FinderShape;
  finderColor?: ColorConfig;
  finderOuterColor?: ColorConfig;
  finderInnerColor?: ColorConfig;
  finderOuterShape?: FinderShape;
  finderInnerShape?: FinderShape;
  logo?: LogoConfig;
  overlayImage?: OverlayImageConfig;
  halftone?: HalftoneConfig;
  moduleScale?: number;
  customModule?: (args: CustomModuleArgs) => string | null;
  margin?: number;
  title?: string;
  skipValidation?: boolean;
  bgOpacity?: number;
  borderRadius?: number;
  frame?: FrameConfig;
  moduleTypes?: number[][];
  /** Color of the quiet zone / margin area. Defaults to bgColor. */
  marginColor?: string;
  /** Color for alignment pattern modules. Defaults to fgColor. */
  alignmentColor?: ColorConfig;
  /** Color for timing pattern modules. Defaults to fgColor. */
  timingColor?: ColorConfig;
  /** DPI for raster output. Defaults to 72 (screen). Common print value: 300. */
  dpi?: number;
  /** Physical output size. When set, pixel dimensions are calculated from this and dpi. */
  physicalSize?: PhysicalSize;
  /** Merge adjacent square modules into combined path elements for smaller SVG output. Default: false. */
  optimizeSvg?: boolean;
}

export type ValidationCode =
  | 'CONTRAST_TOO_LOW'
  | 'LOGO_TOO_LARGE'
  | 'EC_NOT_H_WITH_LOGO'
  | 'INVALID_COLOR'
  | 'SHAPE_SCAN_RISK'
  | 'MODULE_TOO_SMALL'
  | 'OVERLAY_REQUIRES_HIGH_EC'
  | 'OVERLAY_HIGH_OPACITY'
  | 'INVALID_MODULE_SCALE'
  | 'INVALID_BG_OPACITY'
  | 'HALFTONE_REQUIRES_HIGH_EC'
  | 'HALFTONE_INVALID_IMAGE'
  | 'HALFTONE_INVALID_STRENGTH';

export type ValidationSeverity = 'error' | 'warning';

export interface ValidationIssue {
  code: ValidationCode;
  severity: ValidationSeverity;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

export type OutputFormat = 'svg' | 'png' | 'bmp' | 'data-uri';
