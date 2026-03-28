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

  it('diamond produces polygon', () => {
    const result = renderModule(0, 0, 10, 'diamond', '#000');
    expect(result).toContain('<polygon');
    expect(result).toContain('fill="#000"');
  });

  it('diamond has 4 correct vertex points', () => {
    const result = renderModule(0, 0, 10, 'diamond', '#000');
    // cx=5, cy=5, half=4.5
    // top: (5, 0.5), right: (9.5, 5), bottom: (5, 9.5), left: (0.5, 5)
    expect(result).toContain('5,0.5');  // top
    expect(result).toContain('9.5,5');  // right
    expect(result).toContain('5,9.5');  // bottom
    expect(result).toContain('0.5,5');  // left
  });

  it('diamond with offset position has correct coordinates', () => {
    const result = renderModule(20, 30, 10, 'diamond', '#f00');
    // cx=25, cy=35, half=4.5
    expect(result).toContain('25,30.5');  // top
    expect(result).toContain('29.5,35'); // right
    expect(result).toContain('25,39.5'); // bottom
    expect(result).toContain('20.5,35'); // left
    expect(result).toContain('fill="#f00"');
  });
});
