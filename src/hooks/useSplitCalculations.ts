import { useMemo } from 'react';
import type { SplitSummary, Person, ExpenseShare, ShareMode } from '../types';
import { validateSplit } from '../utils/validation';

export function useSplitCalculations(
  totalCents: number,
  people: Person[],
  shares: ExpenseShare[],
  shareMode: ShareMode,
): SplitSummary {
  return useMemo(
    () => validateSplit(totalCents, people, shares, shareMode),
    [totalCents, people, shares, shareMode],
  );
}
