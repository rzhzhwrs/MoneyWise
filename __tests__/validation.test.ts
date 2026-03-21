import { validateSplit } from '../src/utils/validation';
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

describe('validateSplit — percentage mode', () => {
  it('is valid when shares sum to exactly 100%', () => {
    const people = [makePerson('a', 'Alice'), makePerson('b', 'Bob')];
    const shares = [makeShare('a', 50), makeShare('b', 50)];
    const result = validateSplit(10000, people, shares, 'percentage');

    expect(result.isValid).toBe(true);
    expect(result.error).toBeNull();
    expect(result.personOwes).toHaveLength(2);
  });

  it('is invalid when shares sum to less than 100%', () => {
    const people = [makePerson('a', 'Alice'), makePerson('b', 'Bob')];
    const shares = [makeShare('a', 50), makeShare('b', 35)];
    const result = validateSplit(10000, people, shares, 'percentage');

    expect(result.isValid).toBe(false);
    expect(result.error).toContain('85.0%');
    expect(result.error).toContain('15.0% unassigned');
  });

  it('is invalid when shares sum to more than 100%', () => {
    const people = [makePerson('a', 'Alice'), makePerson('b', 'Bob')];
    const shares = [makeShare('a', 70), makeShare('b', 50)];
    const result = validateSplit(10000, people, shares, 'percentage');

    expect(result.isValid).toBe(false);
    expect(result.error).toContain('over');
  });

  it('is valid with three people summing to 100%', () => {
    const people = [makePerson('a', 'Alice'), makePerson('b', 'Bob'), makePerson('c', 'Carol')];
    const shares = [makeShare('a', 34), makeShare('b', 33), makeShare('c', 33)];
    const result = validateSplit(10000, people, shares, 'percentage');

    expect(result.isValid).toBe(true);
  });

  it('is invalid when no people', () => {
    const result = validateSplit(10000, [], [], 'percentage');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('at least one person');
  });
});

describe('validateSplit — fixed mode', () => {
  it('is valid when fixed shares sum to expense amount', () => {
    const people = [makePerson('a', 'Alice'), makePerson('b', 'Bob')];
    const shares = [makeShare('a', 6000, 'fixed'), makeShare('b', 4000, 'fixed')];
    const result = validateSplit(10000, people, shares, 'fixed');

    expect(result.isValid).toBe(true);
    expect(result.error).toBeNull();
  });

  it('is invalid when fixed shares sum to less than expense', () => {
    const people = [makePerson('a', 'Alice'), makePerson('b', 'Bob')];
    const shares = [makeShare('a', 4000, 'fixed'), makeShare('b', 4000, 'fixed')];
    const result = validateSplit(10000, people, shares, 'fixed');

    expect(result.isValid).toBe(false);
    expect(result.error).toContain('remaining');
  });

  it('is invalid when fixed shares sum to more than expense', () => {
    const people = [makePerson('a', 'Alice'), makePerson('b', 'Bob')];
    const shares = [makeShare('a', 6000, 'fixed'), makeShare('b', 6000, 'fixed')];
    const result = validateSplit(10000, people, shares, 'fixed');

    expect(result.isValid).toBe(false);
    expect(result.error).toContain('over');
  });

  it('computes correct personOwes amounts in fixed mode', () => {
    const people = [makePerson('a', 'Alice'), makePerson('b', 'Bob')];
    const shares = [makeShare('a', 3000, 'fixed'), makeShare('b', 7000, 'fixed')];
    const result = validateSplit(10000, people, shares, 'fixed');

    expect(result.personOwes[0]).toEqual({ personId: 'a', personName: 'Alice', amount: 3000 });
    expect(result.personOwes[1]).toEqual({ personId: 'b', personName: 'Bob', amount: 7000 });
  });
});
