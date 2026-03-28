import type { RenderOptions } from '../types';

export type PresetName = 'default' | 'minimal' | 'rounded' | 'dots' | 'sharp' | 'elegant';

export const PRESET_NAMES: PresetName[] = ['default', 'minimal', 'rounded', 'dots', 'sharp', 'elegant'];

const PRESETS: Record<PresetName, Partial<RenderOptions>> = {
  default: {},
  minimal: {
    shape: 'dots',
    moduleScale: 0.7,
    bgColor: 'transparent',
  },
  rounded: {
    shape: 'rounded',
    finderShape: 'rounded',
    moduleScale: 0.9,
  },
  dots: {
    shape: 'dots',
    finderShape: 'circle',
    moduleScale: 0.85,
  },
  sharp: {
    shape: 'square',
    finderShape: 'square',
  },
  elegant: {
    shape: 'rounded',
    finderShape: 'circle',
    moduleScale: 0.9,
    finderInnerShape: 'circle',
  },
};

/**
 * Get render options for a named preset.
 * Returns a `Partial<RenderOptions>` that can be spread into your render options.
 * Overrides take precedence over preset values.
 */
export function applyPreset(
  name: PresetName,
  overrides?: Partial<RenderOptions>,
): Partial<RenderOptions> {
  const preset = PRESETS[name];
  if (!preset) {
    throw new Error(`Unknown preset: "${name}". Available: ${PRESET_NAMES.join(', ')}`);
  }
  if (overrides) {
    return { ...preset, ...overrides };
  }
  return { ...preset };
}
