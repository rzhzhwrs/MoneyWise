import type { ExpenseShare, Person, PersonOwes, ShareMode } from '../types';

/**
 * Calculate how much each person owes given the expense amount and shares.
 * Pure function — no side effects.
 */
export function calculateSplit(
  totalCents: number,
  people: Person[],
  shares: ExpenseShare[],
  shareMode: ShareMode,
): PersonOwes[] {
  return people.map((person) => {
    const share = shares.find((s) => s.personId === person.id);
    const value = share?.value ?? 0;

    let amount: number;
    if (shareMode === 'percentage') {
      amount = Math.round(totalCents * (value / 100));
    } else {
      amount = Math.round(value);
    }

    return {
      personId: person.id,
      personName: person.name,
      amount,
    };
  });
}

/**
 * Compute equal shares for n people.
 * In percentage mode: floor(100/n) each, remainder to person[0].
 * In fixed mode: floor(totalCents/n) each, remainder cents to person[0].
 */
export function computeEqualShares(
  totalCents: number,
  n: number,
  shareMode: ShareMode,
): number[] {
  if (n <= 0) return [];

  if (shareMode === 'percentage') {
    const base = Math.floor(100 / n);
    const remainder = 100 - base * n;
    return Array.from({ length: n }, (_, i) =>
      i === 0 ? base + remainder : base,
    );
  } else {
    const base = Math.floor(totalCents / n);
    const remainder = totalCents - base * n;
    return Array.from({ length: n }, (_, i) =>
      i === 0 ? base + remainder : base,
    );
  }
}
