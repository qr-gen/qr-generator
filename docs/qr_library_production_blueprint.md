# QR Library – Production Grade API, Architecture & Build Config

## 1. Monorepo Setup

Use pnpm workspaces.

```
root/
  packages/
    core/
    renderer/
    react/
  tsconfig.base.json
  package.json
  pnpm-workspace.yaml
```

---

## 2. Package Breakdown

### @qr-lib/core
Pure QR generation engine

```
core/
  src/
    encode/
      byte.ts
      alphanumeric.ts
    error-correction/
      gf256.ts
      reed-solomon.ts
    matrix/
      patterns.ts
      placement.ts
      masking.ts
    utils/
    index.ts
```

---

### @qr-lib/renderer

```
renderer/
  src/
    svg/
      renderer.ts
      shapes.ts
      gradients.ts
    canvas/
      renderer.ts
    types.ts
    index.ts
```

---

### @qr-lib/react

```
react/
  src/
    components/
      QRCode.tsx
    hooks/
      useQRCode.ts
    index.ts
```

---

## 3. Core API (Strict & Minimal)

```ts
export type ErrorCorrection = 'L' | 'M' | 'Q' | 'H';

export interface GenerateQROptions {
  data: string;
  version?: number;
  errorCorrection?: ErrorCorrection;
}

export function generateQR(options: GenerateQROptions): number[][];
```

---

## 4. Renderer API

```ts
export interface RenderOptions {
  size: number;
  fgColor?: string;
  bgColor?: string;
  shape?: 'square' | 'dots' | 'rounded';
  gradient?: {
    type: 'linear' | 'radial';
    colors: string[];
  };
}

export function renderSVG(matrix: number[][], options: RenderOptions): string;
```

---

## 5. React API

```tsx
<QRCode
  value="https://example.com"
  size={240}
  fgColor="#000"
  bgColor="#fff"
  shape="dots"
  logo={{ src: "/logo.png", size: 40 }}
/>
```

---

## 6. Validation Layer

Rules:
- Contrast ratio >= 4.5
- Logo size <= 20%
- Auto upgrade error correction to H if logo present

---

## 7. Build Config (tsup)

### core/tsup.config.ts

```ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  treeshake: true,
  minify: true,
});
```

---

## 8. package.json (core)

```json
{
  "name": "@qr-lib/core",
  "version": "1.0.0",
  "main": "dist/index.cjs",
  "module": "dist/index.js",
  "types": "dist/index.d.ts",
  "sideEffects": false
}
```

---

## 9. Tree Shaking Strategy

- No side effects
- Pure functions only
- Named exports only

---

## 10. Performance Guidelines

- Cache GF(256) tables
- Memoize matrix generation
- Avoid re-renders in React

---

## 11. Testing Strategy

- Unit tests for encoding
- Snapshot tests for matrices
- Real QR scan tests

---

## 12. Release Strategy

- Semantic versioning
- Separate versioning for packages
- Changesets for release management

---

## Final Note

This is a SYSTEM, not a component.

Do not:
- mix core + UI
- skip validation
- over-engineer themes

Do:
- keep core deterministic
- enforce constraints
- optimize for bundle size
