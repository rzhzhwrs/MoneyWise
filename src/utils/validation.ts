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
      error: '请至少添加一位分摊人员。',
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
          error: `已分配 ${total.toFixed(1)}%，剩余 ${remaining.toFixed(1)}% 未分配`,
        };
      } else {
        return {
          personOwes,
          isValid: false,
          error: `已分配 ${total.toFixed(1)}%，超出 ${Math.abs(remaining).toFixed(1)}%`,
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
          error: `已分配 ${(total / 100).toFixed(2)}，剩余 ${(remaining / 100).toFixed(2)} 未分配`,
        };
      } else {
        return {
          personOwes,
          isValid: false,
          error: `已分配 ${(total / 100).toFixed(2)}，超出 ${(Math.abs(remaining) / 100).toFixed(2)}`,
        };
      }
    }
  }

  return { personOwes, isValid: true, error: null };
}
