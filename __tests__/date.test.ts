import {
  todayString,
  toDateString,
  parseDateString,
  formatDisplayDate,
  formatShortDate,
  nowISO,
} from '../src/utils/date';

describe('toDateString', () => {
  it('formats a date to YYYY-MM-DD', () => {
    expect(toDateString(new Date(2026, 2, 21))).toBe('2026-03-21');
  });

  it('pads month and day with leading zero', () => {
    expect(toDateString(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('parseDateString', () => {
  it('parses YYYY-MM-DD to a Date', () => {
    const d = parseDateString('2026-03-21');
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(2); // 0-indexed
    expect(d.getDate()).toBe(21);
  });
});

describe('todayString', () => {
  it('returns a string in YYYY-MM-DD format', () => {
    expect(todayString()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('matches the current date', () => {
    const d = new Date();
    const expected = toDateString(d);
    expect(todayString()).toBe(expected);
  });
});

describe('formatDisplayDate (zh-CN)', () => {
  it('contains the year', () => {
    expect(formatDisplayDate('2026-03-21')).toContain('2026');
  });

  it('contains the day number', () => {
    expect(formatDisplayDate('2026-03-21')).toContain('21');
  });

  it('uses Chinese year character', () => {
    expect(formatDisplayDate('2026-03-21')).toContain('年');
  });

  it('uses Chinese day character', () => {
    expect(formatDisplayDate('2026-03-21')).toContain('日');
  });
});

describe('formatShortDate (zh-CN)', () => {
  it('does not contain the year', () => {
    expect(formatShortDate('2026-03-21')).not.toContain('2026');
  });

  it('contains the day number', () => {
    expect(formatShortDate('2026-03-21')).toContain('21');
  });

  it('uses Chinese day character', () => {
    expect(formatShortDate('2026-03-21')).toContain('日');
  });
});

describe('nowISO', () => {
  it('returns a valid ISO string', () => {
    expect(() => new Date(nowISO())).not.toThrow();
    expect(new Date(nowISO()).getFullYear()).toBeGreaterThan(2020);
  });
});
