import { calculateSplit, computeEqualShares } from '../src/utils/splitCalculator';
import type { Person, ExpenseShare } from '../src/types';

function makePerson(id: string, name: string): Person {
  return { id, expenseId: 'exp1', name, sortOrder: 0 };
}

function makeShare(
  personId: string,
  value: number,
  shareMode: 'percentage' | 'fixed' = 'percentage',
): ExpenseShare {
  return { id: `share-${personId}`, expenseId: 'exp1', personId, value, shareMode };
}

describe('calculateSplit', () => {
  it('splits by percentage correctly', () => {
    const people = [makePerson('a', 'Alice'), makePerson('b', 'Bob')];
    const shares = [makeShare('a', 60), makeShare('b', 40)];
    const result = calculateSplit(10000, people, shares, 'percentage');

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ personId: 'a', personName: 'Alice', amount: 6000 });
    expect(result[1]).toEqual({ personId: 'b', personName: 'Bob', amount: 4000 });
  });

  it('splits by fixed amount correctly', () => {
    const people = [makePerson('a', 'Alice'), makePerson('b', 'Bob')];
    const shares = [makeShare('a', 3000, 'fixed'), makeShare('b', 7000, 'fixed')];
    const result = calculateSplit(10000, people, shares, 'fixed');

    expect(result[0].amount).toBe(3000);
    expect(result[1].amount).toBe(7000);
  });

  it('returns 0 for person with no share entry', () => {
    const people = [makePerson('a', 'Alice'), makePerson('b', 'Bob')];
    const shares = [makeShare('a', 100)];
    const result = calculateSplit(5000, people, shares, 'percentage');

    expect(result[0].amount).toBe(5000);
    expect(result[1].amount).toBe(0);
  });

  it('returns empty array for no people', () => {
    const result = calculateSplit(5000, [], [], 'percentage');
    expect(result).toEqual([]);
  });

  it('rounds to nearest cent in percentage mode', () => {
    const people = [makePerson('a', 'Alice'), makePerson('b', 'Bob'), makePerson('c', 'Carol')];
    const shares = [
      makeShare('a', 33.33),
      makeShare('b', 33.33),
      makeShare('c', 33.34),
    ];
    const result = calculateSplit(10000, people, shares, 'percentage');
    const total = result.reduce((s, r) => s + r.amount, 0);
    // total should be close to 10000
    expect(Math.abs(total - 10000)).toBeLessThanOrEqual(2);
  });
});

describe('computeEqualShares', () => {
  it('splits evenly 2 people in percentage mode', () => {
    const shares = computeEqualShares(10000, 2, 'percentage');
    expect(shares).toEqual([50, 50]);
    expect(shares.reduce((s, v) => s + v, 0)).toBe(100);
  });

  it('splits evenly 3 people in percentage mode, remainder to person[0]', () => {
    const shares = computeEqualShares(10000, 3, 'percentage');
    expect(shares[0]).toBe(34);  // 33 + 1 remainder
    expect(shares[1]).toBe(33);
    expect(shares[2]).toBe(33);
    expect(shares.reduce((s, v) => s + v, 0)).toBe(100);
  });

  it('splits evenly 3 people in fixed mode, remainder to person[0]', () => {
    const shares = computeEqualShares(10000, 3, 'fixed');
    expect(shares[0]).toBe(3334); // 3333 + 1
    expect(shares[1]).toBe(3333);
    expect(shares[2]).toBe(3333);
    expect(shares.reduce((s, v) => s + v, 0)).toBe(10000);
  });

  it('splits evenly 4 people in fixed mode', () => {
    const shares = computeEqualShares(10000, 4, 'fixed');
    expect(shares).toEqual([2500, 2500, 2500, 2500]);
    expect(shares.reduce((s, v) => s + v, 0)).toBe(10000);
  });

  it('handles 1 person', () => {
    expect(computeEqualShares(10000, 1, 'percentage')).toEqual([100]);
    expect(computeEqualShares(10000, 1, 'fixed')).toEqual([10000]);
  });

  it('handles 0 people', () => {
    expect(computeEqualShares(10000, 0, 'percentage')).toEqual([]);
  });
});
