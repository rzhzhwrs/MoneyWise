/** Returns today's date as "YYYY-MM-DD" */
export function todayString(): string {
  const d = new Date();
  return toDateString(d);
}

/** Convert a Date to "YYYY-MM-DD" */
export function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Parse "YYYY-MM-DD" to a Date (local time) */
export function parseDateString(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Format "YYYY-MM-DD" for display, e.g. "2026年3月21日" */
export function formatDisplayDate(s: string): string {
  const date = parseDateString(s);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** Format "YYYY-MM-DD" short, e.g. "3月21日" */
export function formatShortDate(s: string): string {
  const date = parseDateString(s);
  return date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });
}

export function nowISO(): string {
  return new Date().toISOString();
}
