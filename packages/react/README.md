# @qr-gen/react

React component and hook for generating QR codes. Zero-dependency QR engine with custom rendering — shapes, gradients, logos, and finder pattern customization.

**0.5 KB gzipped** (+ 13.2 KB for core + vanilla, installed automatically).

## Install

```bash
npm install @qr-gen/react
```

Requires React 18+. Automatically installs `@qr-gen/core` and `@qr-gen/vanilla`.

## Quick Start

```tsx
import { QRCode } from '@qr-gen/react';

function App() {
  return <QRCode value="https://example.com" size={256} />;
}
```

## Styling

```tsx
<QRCode
  value="https://example.com"
  size={300}
  fgColor="#1a1a2e"
  bgColor="#ffffff"
  shape="rounded"
  margin={4}
/>
```

## Gradients

```tsx
<QRCode
  value="https://example.com"
  size={300}
  fgColor={{
    type: 'linear',
    colors: ['#667eea', '#764ba2'],
    angle: 135,
  }}
/>
```

## Finder Pattern Customization

```tsx
<QRCode
  value="https://example.com"
  size={300}
  shape="dots"
  finderShape="rounded"
  finderColor="#e94560"
/>
```

## Logo Embedding

```tsx
<QRCode
  value="https://example.com"
  size={300}
  logo={{
    src: "/logo.png",
    width: 50,
    height: 50,
  }}
/>
```

Error correction is automatically upgraded to `'H'` when a logo is present.

## useQRCode Hook

For custom rendering (Canvas, WebGL, etc.), use the hook to get the raw QR matrix:

```tsx
import { useQRCode } from '@qr-gen/react';

function CustomQR() {
  const { matrix, moduleTypes, version, size } = useQRCode({
    value: 'https://example.com',
    errorCorrection: 'H',
  });

  return <canvas ref={/* render matrix yourself */} />;
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | required | Data to encode |
| `size` | `number` | `256` | Output size in pixels |
| `errorCorrection` | `'L' \| 'M' \| 'Q' \| 'H'` | `'M'` | Error correction level |
| `version` | `number` | auto | QR version (1-40) |
| `fgColor` | `string \| GradientConfig` | `'#000000'` | Foreground color or gradient |
| `bgColor` | `string` | `'#ffffff'` | Background color |
| `shape` | `'square' \| 'rounded' \| 'dots'` | `'square'` | Module shape |
| `finderShape` | `'square' \| 'rounded'` | same as `shape` | Finder pattern shape |
| `finderColor` | `string \| GradientConfig` | same as `fgColor` | Finder pattern color |
| `logo` | `LogoConfig` | — | Logo to embed in center |
| `margin` | `number` | `4` | Quiet zone in modules |
| `skipValidation` | `boolean` | `false` | Skip contrast/size checks |
| `className` | `string` | — | CSS class on wrapper div |
| `style` | `CSSProperties` | — | Inline styles on wrapper div |

The component forwards refs to the wrapper `<div>`.

## License

MIT
