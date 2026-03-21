/**
 * Format a cents integer into a human-readable currency string.
 * e.g. formatCurrency(1050, 'USD') → '$10.50'
 */
export function formatCurrency(cents: number, currency: string = 'USD'): string {
  const amount = cents / 100;
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Fallback for unknown currency codes
    return `${currency} ${amount.toFixed(2)}`;
  }
}

/** Parse a decimal string like "10.50" → 1050 cents */
export function parseCents(value: string): number {
  const n = parseFloat(value);
  if (isNaN(n)) return 0;
  return Math.round(n * 100);
}

/** Convert cents to display string like "10.50" */
export function centsToDisplay(cents: number): string {
  return (cents / 100).toFixed(2);
}
