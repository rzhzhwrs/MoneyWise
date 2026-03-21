import { getDb } from '../client';
import type { Account, AccountType } from '../../types';

interface AccountRow {
  id: string;
  name: string;
  type: string;
  balance: number;
  credit_limit: number | null;
  currency: string;
  created_at: string;
  updated_at: string;
}

function rowToAccount(row: AccountRow): Account {
  return {
    id: row.id,
    name: row.name,
    type: row.type as AccountType,
    balance: row.balance,
    creditLimit: row.credit_limit,
    currency: row.currency,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAllAccounts(): Promise<Account[]> {
  const db = getDb();
  const rows = await db.getAllAsync<AccountRow>(
    'SELECT * FROM accounts ORDER BY created_at ASC',
  );
  return rows.map(rowToAccount);
}

export async function getAccountById(id: string): Promise<Account | null> {
  const db = getDb();
  const row = await db.getFirstAsync<AccountRow>(
    'SELECT * FROM accounts WHERE id = ?',
    id,
  );
  return row ? rowToAccount(row) : null;
}

export async function insertAccount(account: Account): Promise<void> {
  const db = getDb();
  await db.runAsync(
    `INSERT INTO accounts (id, name, type, balance, credit_limit, currency, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    account.id,
    account.name,
    account.type,
    account.balance,
    account.creditLimit,
    account.currency,
    account.createdAt,
    account.updatedAt,
  );
}

export async function updateAccount(account: Account): Promise<void> {
  const db = getDb();
  await db.runAsync(
    `UPDATE accounts SET name=?, type=?, balance=?, credit_limit=?, currency=?, updated_at=?
     WHERE id=?`,
    account.name,
    account.type,
    account.balance,
    account.creditLimit,
    account.currency,
    account.updatedAt,
    account.id,
  );
}

export async function deleteAccount(id: string): Promise<void> {
  const db = getDb();
  // Check for referenced expenses
  const ref = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM expenses WHERE account_id = ?',
    id,
  );
  if (ref && ref.count > 0) {
    throw new Error(
      `Cannot delete account — it is used by ${ref.count} expense(s).`,
    );
  }
  await db.runAsync('DELETE FROM accounts WHERE id = ?', id);
}
