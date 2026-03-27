# Full QR Code React Library – Engineering Guide

## Overview
This document describes how to build a **production-grade QR code library** from scratch with:
- Full QR spec compliance (ISO/IEC 18004)
- Custom rendering (themes, shapes, logos)
- React integration
- Strict validation for scannability

---

# 1. System Architecture

## Monorepo Structure

packages/
  core/        -> QR generation engine
  renderer/    -> SVG/Canvas rendering
  react/       -> React wrapper

---

# 2. Core Engine

## Responsibilities
- Data encoding
- Error correction (Reed–Solomon)
- Matrix generation
- Masking

## API

```ts
generateQR({
  data: string,
  version?: number,
  errorCorrection?: 'L' | 'M' | 'Q' | 'H'
}): number[][]
```

---

## Encoding

### Modes
- Numeric
- Alphanumeric
- Byte (required for MVP)
- Kanji (optional)

### Structure

[Mode][Length][Data][Terminator][Padding]

---

## Error Correction

### Requirements
- Implement GF(256)
- Log/antilog tables
- Polynomial division

### Output
data codewords + error correction codewords

---

## Matrix Construction

### Include:
- Finder patterns
- Timing patterns
- Alignment patterns
- Format info
- Version info

---

## Masking

Apply 8 masks and select lowest penalty.

Penalty Rules:
1. Consecutive modules
2. 2x2 blocks
3. Finder-like patterns
4. Black/white ratio

---

# 3. Renderer

## Input
QR Matrix (2D array)

## Output Options
- SVG (primary)
- Canvas (optional)

---

## Shapes

Supported:
- Square
- Rounded
- Circle (dots)

Constraints:
- Maintain module center visibility
- Avoid overlapping modules

---

## Colors

Options:
- Solid
- Linear gradient
- Radial gradient

Validation:
- Ensure contrast ratio > 4.5

---

## Finder Patterns

Customizable:
- Shape: square / rounded
- Color: independent from data modules

Constraints:
- Must remain visually distinct
- Cannot remove structure

---

## Logo Embedding

Rules:
- Force error correction = H
- Max size = 20% of QR
- Clear background behind logo

---

# 4. React Layer

## Component API

```tsx
<QRCode
  value="string"
  size={number}
  fgColor="#000"
  bgColor="#fff"
  shape="square | dots | rounded"
  eyeShape="square | rounded"
  logo={{ src: string, size: number }}
/>
```

---

# 5. Validation System

## Must Enforce

- Contrast ratio
- Logo size limits
- Error correction adjustment
- Shape safety

---

# 6. Performance

- Use memoization for matrix generation
- Avoid re-renders
- Use SVG for flexibility

---

# 7. Build System

## Tools
- TypeScript
- tsup / rollup

## Output
- ESM
- CJS
- Types

---

# 8. Bundle Optimization

- No dependencies
- Tree-shakable exports
- Separate packages

---

# 9. Testing

## Required
- Unit tests for encoding
- Snapshot tests for matrix
- Real-world scan tests

---

# 10. Roadmap

Phase 1:
- Core engine
- Basic SVG renderer

Phase 2:
- Shapes + colors

Phase 3:
- Logo support

Phase 4:
- Validation system

Phase 5:
- Scannability scoring

---

# Final Notes

This is not a UI library.
This is a **spec-compliant encoding system with constrained rendering**.

If you compromise:
- Encoding → QR breaks
- Rendering rules → scanning fails
