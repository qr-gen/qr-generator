export type ModuleShape = 'square' | 'rounded' | 'dots';
export type FinderShape = 'square' | 'rounded';

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

export interface RenderOptions {
  size: number;
  fgColor?: ColorConfig;
  bgColor?: string;
  shape?: ModuleShape;
  finderShape?: FinderShape;
  finderColor?: ColorConfig;
  logo?: LogoConfig;
  margin?: number;
  skipValidation?: boolean;
  moduleTypes?: number[][];
}

export type ValidationCode =
  | 'CONTRAST_TOO_LOW'
  | 'LOGO_TOO_LARGE'
  | 'EC_NOT_H_WITH_LOGO'
  | 'INVALID_COLOR'
  | 'SHAPE_SCAN_RISK'
  | 'MODULE_TOO_SMALL';

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
