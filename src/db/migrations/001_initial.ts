import type { SQLiteDatabase } from 'expo-sqlite';

export async function up(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS accounts (
      id           TEXT PRIMARY KEY,
      name         TEXT NOT NULL,
      type         TEXT NOT NULL DEFAULT 'cash',
      balance      INTEGER NOT NULL DEFAULT 0,
      credit_limit INTEGER,
      currency     TEXT NOT NULL DEFAULT 'USD',
      created_at   TEXT NOT NULL,
      updated_at   TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id          TEXT PRIMARY KEY,
      date        TEXT NOT NULL,
      amount      INTEGER NOT NULL,
      category    TEXT NOT NULL,
      account_id  TEXT NOT NULL REFERENCES accounts(id),
      description TEXT,
      is_split    INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT NOT NULL,
      updated_at  TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS people (
      id          TEXT PRIMARY KEY,
      expense_id  TEXT NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
      name        TEXT NOT NULL,
      sort_order  INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS expense_shares (
      id          TEXT PRIMARY KEY,
      expense_id  TEXT NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
      person_id   TEXT NOT NULL REFERENCES people(id) ON DELETE CASCADE,
      value       REAL NOT NULL DEFAULT 0,
      share_mode  TEXT NOT NULL DEFAULT 'percentage',
      UNIQUE(expense_id, person_id)
    );
  `);
}
