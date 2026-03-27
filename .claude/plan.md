# Phase 1 Implementation Plan

4 features: Download Support, Overlay Image Mode, Circle Finder Patterns, Diamond Module Shape.

---

## Feature 1: Diamond Module Shape (Effort: Low)

Add `'diamond'` to `ModuleShape`. Simplest feature — start here.

### Changes

**`packages/renderer/src/types.ts`**
- Extend `ModuleShape = 'square' | 'rounded' | 'dots' | 'diamond'`

**`packages/renderer/src/svg/helpers.ts`**
- Add `svgPolygon(points: string, fill: string): string` — renders `<polygon points="..." fill="..."/>`

**`packages/renderer/src/svg/shapes.ts`**
- Add `case 'diamond'`: render as `<polygon>` with 4 points (top, right, bottom, left of cell center)
  - Points: `(x + size/2, y)`, `(x + size, y + size/2)`, `(x + size/2, y + size)`, `(x, y + size/2)`

**`packages/renderer/src/raster/shapes.ts`**
- Add `case 'diamond'` — use `PixelBuffer.fillDiamond()` (new method) or inline pixel test

**`packages/renderer/src/raster/pixel-buffer.ts`**
- Add `fillDiamond(cx, cy, halfSize, r, g, b, a)` — fills pixels where `|px - cx| + |py - cy| <= halfSize` (manhattan distance)

**`packages/renderer/src/raster/rasterize.ts`**
- Add `case 'diamond'` to `isPixelInShape()` — manhattan distance check: `|px - (mx + size/2)| + |py - (my + size/2)| <= size/2`

### Tests
- `__tests__/shapes.test.ts`: diamond produces `<polygon>`, correct points
- `__tests__/raster-shapes.test.ts`: diamond fills center, corners empty, midpoints filled

---

## Feature 2: Circle Finder Patterns (Effort: Medium)

Add `'circle'` to `FinderShape`. Requires composite rendering — 3 concentric circles per finder location instead of per-module rendering.

### Key Design
The 3 finder patterns (7×7 modules each) are located at:
- Top-left: row 0-6, col 0-6
- Top-right: row 0-6, col (size-7) to (size-1)
- Bottom-left: row (size-7) to (size-1), col 0-6

When `finderShape === 'circle'`, skip all individual finder module rendering and instead draw 3 concentric circles per finder:
- **Outer circle**: radius = 3.5 modules (covers 7×7 area), fill = finderColor or fgColor
- **Middle circle**: radius = 2.5 modules (covers 5×5 area), fill = bgColor
- **Inner circle**: radius = 1.5 modules (covers 3×3 area), fill = finderColor or fgColor

### Changes

**`packages/renderer/src/types.ts`**
- Extend `FinderShape = 'square' | 'rounded' | 'circle'`

**`packages/renderer/src/svg/renderer.ts`**
- Before the module loop: if `finderShape === 'circle'`, call `renderCircleFinders()` that produces the concentric circles SVG
- In the module loop: skip finder modules (moduleType === 1) when `finderShape === 'circle'` — separators (type 7) are already 0 so won't render

**`packages/renderer/src/svg/finders.ts`** (new file)
- `renderCircleFinders(matrixSize, margin, moduleSize, finderFill, bgColor): string`
- Computes center of each finder (3.5 modules from top-left of finder area + margin offset)
- Draws outer → middle (bg) → inner circles using `svgCircle()`

**`packages/renderer/src/raster/rasterize.ts`**
- Same approach: before module loop, if `finderShape === 'circle'`, render concentric circles via `PixelBuffer.fillCircle()`
- In module loop: skip finder modules when circle finders

### Tests
- `__tests__/svg-renderer.test.ts` or new `__tests__/circle-finders.test.ts`: SVG output contains 9 `<circle>` elements (3 per finder × 3 finders) when `finderShape: 'circle'`
- Raster test: verify pixels at finder centers are filled, pixels at the "gap" ring are bgColor

---

## Feature 3: Overlay Image Mode (Effort: High)

New `position: 'center' | 'overlay'` option on `LogoConfig`. In overlay mode, the image fills the entire QR area as a background and modules are drawn on top.

### Changes

**`packages/renderer/src/types.ts`**
- Extend `LogoConfig`:
  ```ts
  interface LogoConfig {
    src: string;
    width: number;
    height: number;
    padding?: number;
    position?: 'center' | 'overlay';       // default: 'center'
    imageBackgroundColor?: string;          // finder fill in overlay mode
  }
  ```

**`packages/renderer/src/svg/renderer.ts`**
- When `logo.position === 'overlay'`:
  - Render the `<image>` element **first** (full-bleed, covering entire QR area) right after background rect
  - Do NOT compute logoBounds / skip modules — render ALL data modules on top
  - For finder modules: use `imageBackgroundColor ?? bgColor` as a background fill behind finder patterns to keep them scannable (render a filled rect/circle behind each finder before the finder modules)
  - No clear zone

**`packages/renderer/src/svg/logo.ts`**
- Add `renderOverlayImage(size: number, src: string): string` — renders full-bleed `<image>` at (0, 0, size, size)

**`packages/renderer/src/raster/rasterize.ts`**
- Overlay mode in raster: skip image embedding (raster already can't embed images), but skip the logo clear zone logic. Modules render on top as normal. Document that overlay mode is primarily for SVG output.

**`packages/renderer/src/validation/validate.ts`**
- When `logo.position === 'overlay'`: skip the logo-too-large check (image is supposed to be full-bleed), but still warn about EC level

### Tests
- SVG contains `<image>` before module elements when overlay mode
- No clear zone skipping — all modules render
- Finder background rects present in overlay mode
- Validation does not error on logo size in overlay mode

---

## Feature 4: Download Support (Effort: Low)

### Renderer Package

**`packages/renderer/src/download.ts`** (new file)
- `downloadQR(result: CreateQRResult, filename?: string): void`
  - SVG: create Blob from string with `type: 'image/svg+xml'`, create object URL, trigger download via hidden `<a>` element click
  - PNG: create Blob from Uint8Array with `type: 'image/png'`, same approach
  - BMP: create Blob from Uint8Array with `type: 'image/bmp'`, same approach
  - Data-URI: convert to Blob, same approach
  - Default filename: `'qr-code.{ext}'` based on format
  - Clean up object URL after download

**`packages/renderer/src/index.ts`**
- Export `downloadQR`

### React Package

**`packages/react/src/components/QRCode.tsx`**
- Add `downloadable?: boolean` prop — when true, renders a download button below the QR code
- Expose `download(filename?: string)` method via `useImperativeHandle` on the existing `forwardRef`
  - Internally calls `createQR()` with `format: 'svg'` (or current format) and `downloadQR()`
- Define `QRCodeRef` interface: `{ download: (filename?: string) => void }`
- Change ref generic from `HTMLDivElement` to `QRCodeRef`

**`packages/react/src/index.ts`**
- Export `QRCodeRef` type

### Tests
- Unit test `downloadQR`: mock `document.createElement`, `URL.createObjectURL`, verify correct Blob type and filename
- React test: `downloadable` prop renders button, ref `download` method is callable

---

## Implementation Order

1. **Diamond Module Shape** — isolated, low risk, touches shapes only
2. **Circle Finder Patterns** — medium complexity, touches renderer flow
3. **Overlay Image Mode** — high complexity, touches logo + renderer
4. **Download Support** — independent, touches new files + React

## File Impact Summary

| File | Features |
|------|----------|
| `types.ts` | Diamond, Circle, Overlay |
| `svg/shapes.ts` | Diamond |
| `svg/helpers.ts` | Diamond |
| `svg/renderer.ts` | Circle, Overlay |
| `svg/finders.ts` (new) | Circle |
| `svg/logo.ts` | Overlay |
| `raster/shapes.ts` | Diamond |
| `raster/pixel-buffer.ts` | Diamond |
| `raster/rasterize.ts` | Diamond, Circle, Overlay |
| `validation/validate.ts` | Overlay |
| `download.ts` (new) | Download |
| `index.ts` (renderer) | Download, types |
| `react/QRCode.tsx` | Download |
| `react/index.ts` | Download |
