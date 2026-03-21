import type { SQLiteDatabase } from 'expo-sqlite';

export async function up(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_expenses_date    ON expenses(date DESC);
    CREATE INDEX IF NOT EXISTS idx_expenses_account ON expenses(account_id);
    CREATE INDEX IF NOT EXISTS idx_people_expense   ON people(expense_id, sort_order);
    CREATE INDEX IF NOT EXISTS idx_shares_expense   ON expense_shares(expense_id);
    CREATE INDEX IF NOT EXISTS idx_shares_person    ON expense_shares(person_id);
  `);
}
