# @qr-gen/vanilla

Zero-dependency QR code renderer with multi-format output — SVG, PNG, BMP, Canvas, and Data URI. Built from scratch with custom PNG/BMP encoders (no native dependencies).

**5.5 KB gzipped.**

## Install

```bash
npm install @qr-gen/vanilla
```

Automatically installs `@qr-gen/core`.

## Quick Start

```ts
import { createQR } from '@qr-gen/vanilla';

const result = createQR('https://example.com', { size: 256 });
document.getElementById('qr').innerHTML = result.data;
```

## Output Formats

```ts
import { createQR } from '@qr-gen/vanilla';

// SVG (default)
const svg = createQR('hello', { size: 256 });

// PNG
const png = createQR('hello', { size: 256, format: 'png' });

// BMP
const bmp = createQR('hello', { size: 256, format: 'bmp' });

// Data URI (for <img> tags)
const uri = createQR('hello', { size: 256, format: 'data-uri' });
```

## Low-Level Renderers

```ts
import { generateQR } from '@qr-gen/core';
import { renderSVG, renderPNG, renderBMP, renderCanvas } from '@qr-gen/vanilla';

const qr = generateQR({ data: 'https://example.com' });

const svg = renderSVG(qr.matrix, { size: 256 });
const png = renderPNG(qr.matrix, { size: 512 });
const bmp = renderBMP(qr.matrix, { size: 512 });

// Canvas (browser only)
renderCanvas(qr.matrix, { size: 256 }, document.getElementById('canvas'));
```

## Styling

```ts
createQR('https://example.com', {
  size: 300,
  fgColor: '#1a1a2e',
  bgColor: '#e0e0e0',
  shape: 'dots',              // 'square' | 'rounded' | 'dots'
  margin: 4,
});
```

## Gradients

```ts
createQR('https://example.com', {
  size: 300,
  fgColor: {
    type: 'linear',
    colors: ['#667eea', '#764ba2'],
    angle: 135,
  },
});
```

## Finder Pattern Customization

```ts
createQR('https://example.com', {
  size: 300,
  shape: 'dots',
  finderShape: 'rounded',
  finderColor: '#e94560',
});
```

## Logo Embedding

```ts
createQR('https://example.com', {
  size: 300,
  logo: {
    src: '/logo.png',
    width: 50,
    height: 50,
  },
});
// EC auto-upgrades to 'H' when a logo is present
```

## Scannability Scoring

```ts
import { computeScannability } from '@qr-gen/vanilla';

const { score, breakdown } = computeScannability({
  errorCorrection: 'H',
  fgColor: '#000000',
  bgColor: '#ffffff',
  shape: 'square',
  size: 256,
  margin: 4,
});
// score: 0-100
```

## Save to File (Node.js)

```ts
import { createQR } from '@qr-gen/vanilla';
import { writeFileSync } from 'fs';

writeFileSync('qr.svg', createQR('https://example.com', { size: 512 }).data);
writeFileSync('qr.png', createQR('https://example.com', { size: 512, format: 'png' }).data);
```

## Render Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `size` | `number` | required | Output size in pixels |
| `fgColor` | `string \| GradientConfig` | `'#000000'` | Foreground color or gradient |
| `bgColor` | `string` | `'#ffffff'` | Background color |
| `shape` | `'square' \| 'rounded' \| 'dots'` | `'square'` | Module shape |
| `finderShape` | `'square' \| 'rounded'` | same as `shape` | Finder pattern shape |
| `finderColor` | `string \| GradientConfig` | same as `fgColor` | Finder pattern color |
| `logo` | `LogoConfig` | — | Logo to embed in center |
| `margin` | `number` | `4` | Quiet zone in modules |
| `skipValidation` | `boolean` | `false` | Skip contrast/size checks |

## License

MIT
