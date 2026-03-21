import { formatCurrency, parseCents, centsToDisplay } from '../src/utils/currency';

describe('formatCurrency', () => {
  it('formats CNY correctly', () => {
    expect(formatCurrency(10050, 'CNY')).toContain('100');
    expect(formatCurrency(10050, 'CNY')).toContain('50');
  });

  it('formats USD correctly', () => {
    const result = formatCurrency(1099, 'USD');
    expect(result).toContain('10');
    expect(result).toContain('99');
  });

  it('formats zero', () => {
    const result = formatCurrency(0, 'CNY');
    expect(result).toContain('0');
  });

  it('formats large amounts', () => {
    const result = formatCurrency(1000000, 'CNY'); // ¥10,000.00
    expect(result).toContain('10');
    expect(result).toContain('000');
  });

  it('falls back gracefully for unknown currency codes', () => {
    const result = formatCurrency(500, 'XYZ');
    expect(result).toContain('XYZ');
    expect(result).toContain('5.00');
  });
});

describe('parseCents', () => {
  it('parses a decimal string to cents', () => {
    expect(parseCents('10.50')).toBe(1050);
  });

  it('parses an integer string', () => {
    expect(parseCents('100')).toBe(10000);
  });

  it('rounds to nearest cent', () => {
    expect(parseCents('10.999')).toBe(1100);
  });

  it('returns 0 for empty string', () => {
    expect(parseCents('')).toBe(0);
  });

  it('returns 0 for non-numeric input', () => {
    expect(parseCents('abc')).toBe(0);
  });

  it('handles zero', () => {
    expect(parseCents('0.00')).toBe(0);
  });

  it('handles single decimal place', () => {
    expect(parseCents('9.9')).toBe(990);
  });
});

describe('centsToDisplay', () => {
  it('converts cents to two-decimal string', () => {
    expect(centsToDisplay(1050)).toBe('10.50');
  });

  it('converts zero', () => {
    expect(centsToDisplay(0)).toBe('0.00');
  });

  it('converts whole number cents', () => {
    expect(centsToDisplay(10000)).toBe('100.00');
  });

  it('round-trips with parseCents', () => {
    const original = 4567;
    expect(parseCents(centsToDisplay(original))).toBe(original);
  });
});
