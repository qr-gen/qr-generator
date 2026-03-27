import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
  },
  resolve: {
    alias: {
      '@qr-gen/core': path.resolve(__dirname, '../core/src/index.ts'),
      '@qr-gen/vanilla': path.resolve(__dirname, '../renderer/src/index.ts'),
    },
  },
});
