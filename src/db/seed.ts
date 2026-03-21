import type { SQLiteDatabase } from 'expo-sqlite';
import { randomUUID } from 'expo-crypto';
import { nowISO } from '../utils/date';

/** Insert a default account on first launch if no accounts exist. */
export async function seedDefaultData(db: SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM accounts',
  );
  if (row && row.count > 0) return;

  const now = nowISO();
  await db.runAsync(
    `INSERT INTO accounts (id, name, type, balance, credit_limit, currency, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    randomUUID(),
    '外部账户',
    'other',
    0,
    null,
    'CNY',
    now,
    now,
  );
}
