import { seedDefaultData } from '../src/db/seed';
import type { SQLiteDatabase } from 'expo-sqlite';

// Mock expo-crypto so randomUUID works in Node
jest.mock('expo-crypto', () => ({
  randomUUID: () => 'test-uuid-1234',
}));

function makeMockDb(accountCount: number) {
  const db = {
    getFirstAsync: jest.fn().mockResolvedValue({ count: accountCount }),
    runAsync: jest.fn().mockResolvedValue(undefined),
  } as unknown as SQLiteDatabase;
  return db;
}

describe('seedDefaultData', () => {
  it('inserts a default account when no accounts exist', async () => {
    const db = makeMockDb(0);
    await seedDefaultData(db);

    expect(db.runAsync).toHaveBeenCalledTimes(1);
    const [sql, id, name, type, balance, creditLimit, currency] =
      (db.runAsync as jest.Mock).mock.calls[0];

    expect(sql).toContain('INSERT INTO accounts');
    expect(id).toBe('test-uuid-1234');
    expect(name).toBe('外部账户');
    expect(type).toBe('other');
    expect(balance).toBe(0);
    expect(creditLimit).toBeNull();
    expect(currency).toBe('CNY');
  });

  it('does nothing when accounts already exist', async () => {
    const db = makeMockDb(2);
    await seedDefaultData(db);

    expect(db.runAsync).not.toHaveBeenCalled();
  });

  it('checks the accounts table before inserting', async () => {
    const db = makeMockDb(0);
    await seedDefaultData(db);

    expect(db.getFirstAsync).toHaveBeenCalledWith(
      'SELECT COUNT(*) as count FROM accounts',
    );
  });
});
