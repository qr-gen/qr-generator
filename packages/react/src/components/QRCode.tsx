import { useMemo, forwardRef } from 'react';
import { generateQR } from '@qr-gen/core';
import type { ErrorCorrectionLevel } from '@qr-gen/core';
import { renderSVG } from '@qr-gen/vanilla';
import type { RenderOptions, ModuleShape, ColorConfig, LogoConfig, FinderShape } from '@qr-gen/vanilla';

export interface QRCodeProps {
  value: string;
  size?: number;
  errorCorrection?: ErrorCorrectionLevel;
  version?: number;
  fgColor?: ColorConfig;
  bgColor?: string;
  shape?: ModuleShape;
  margin?: number;
  logo?: LogoConfig;
  finderShape?: FinderShape;
  finderColor?: ColorConfig;
  skipValidation?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const QRCode = forwardRef<HTMLDivElement, QRCodeProps>(
  function QRCode(props, ref) {
    const {
      value,
      size = 256,
      errorCorrection,
      version,
      fgColor,
      bgColor,
      shape,
      margin,
      logo,
      finderShape,
      finderColor,
      skipValidation,
      className,
      style,
    } = props;

    const svgString = useMemo(() => {
      // Auto-upgrade EC to H when logo is present
      const ec: ErrorCorrectionLevel = logo ? 'H' : (errorCorrection ?? 'M');
      const qr = generateQR({ data: value, errorCorrection: ec, version });

      const renderOpts: RenderOptions = {
        size,
        fgColor,
        bgColor,
        shape,
        margin,
        logo,
        finderShape,
        finderColor,
        skipValidation,
        moduleTypes: qr.moduleTypes,
      };

      return renderSVG(qr.matrix, renderOpts);
    }, [value, size, errorCorrection, version, fgColor, bgColor, shape, margin, logo, finderShape, finderColor, skipValidation]);

    return (
      <div
        ref={ref}
        className={className}
        style={style}
        dangerouslySetInnerHTML={{ __html: svgString }}
      />
    );
  },
);
