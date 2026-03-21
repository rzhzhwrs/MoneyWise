import type { ExpenseShare, Person, ShareMode } from '../types';
import type { SplitSummary, PersonOwes } from '../types';
import { calculateSplit } from './splitCalculator';

const EPSILON = 0.001;

/**
 * Validate that shares correctly sum to the expected total.
 * Returns a SplitSummary with isValid and a user-facing error message.
 */
export function validateSplit(
  totalCents: number,
  people: Person[],
  shares: ExpenseShare[],
  shareMode: ShareMode,
): SplitSummary {
  const personOwes: PersonOwes[] = calculateSplit(totalCents, people, shares, shareMode);

  if (people.length === 0) {
    return {
      personOwes: [],
      isValid: false,
      error: 'Add at least one person to split with.',
    };
  }

  if (shareMode === 'percentage') {
    const total = shares.reduce((sum, s) => sum + s.value, 0);
    const diff = Math.abs(total - 100);

    if (diff > EPSILON) {
      const remaining = 100 - total;
      if (remaining > 0) {
        return {
          personOwes,
          isValid: false,
          error: `Shares sum to ${total.toFixed(1)}% — ${remaining.toFixed(1)}% unassigned`,
        };
      } else {
        return {
          personOwes,
          isValid: false,
          error: `Shares sum to ${total.toFixed(1)}% — ${Math.abs(remaining).toFixed(1)}% over`,
        };
      }
    }
  } else {
    const total = shares.reduce((sum, s) => sum + s.value, 0);
    const diff = Math.abs(total - totalCents);

    if (diff > EPSILON) {
      const remaining = totalCents - total;
      if (remaining > 0) {
        return {
          personOwes,
          isValid: false,
          error: `Shares sum to ${(total / 100).toFixed(2)} — ${(remaining / 100).toFixed(2)} remaining`,
        };
      } else {
        return {
          personOwes,
          isValid: false,
          error: `Shares sum to ${(total / 100).toFixed(2)} — ${(Math.abs(remaining) / 100).toFixed(2)} over`,
        };
      }
    }
  }

  return { personOwes, isValid: true, error: null };
}
