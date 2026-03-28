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
  moduleScale?: number;
  customModule?: (args: CustomModuleArgs) => string | null;
  margin?: number;
  title?: string;
  skipValidation?: boolean;
  bgOpacity?: number;
  borderRadius?: number;
  frame?: FrameConfig;
  moduleTypes?: number[][];
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
  | 'INVALID_BG_OPACITY';

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
