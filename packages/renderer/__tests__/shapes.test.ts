import { describe, it, expect } from 'vitest';
import { renderModule } from '../src/svg/shapes';

describe('Module Shapes', () => {
  it('square produces rect', () => {
    const result = renderModule(0, 0, 10, 'square', '#000');
    expect(result).toContain('<rect');
    expect(result).not.toContain('rx=');
  });

  it('rounded produces rect with rounded corners', () => {
    const result = renderModule(0, 0, 10, 'rounded', '#000');
    expect(result).toContain('<rect');
    expect(result).toContain('rx=');
  });

  it('dots produces circle', () => {
    const result = renderModule(0, 0, 10, 'dots', '#000');
    expect(result).toContain('<circle');
  });

  it('square positions correctly', () => {
    const result = renderModule(20, 30, 10, 'square', '#f00');
    expect(result).toContain('x="20"');
    expect(result).toContain('y="30"');
    expect(result).toContain('fill="#f00"');
  });
});
