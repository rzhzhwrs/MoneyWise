import { getDb } from '../client';
import type { ExpenseShare, ShareMode } from '../../types';

interface ShareRow {
  id: string;
  expense_id: string;
  person_id: string;
  value: number;
  share_mode: string;
}

function rowToShare(row: ShareRow): ExpenseShare {
  return {
    id: row.id,
    expenseId: row.expense_id,
    personId: row.person_id,
    value: row.value,
    shareMode: row.share_mode as ShareMode,
  };
}

export async function getSharesForExpense(expenseId: string): Promise<ExpenseShare[]> {
  const db = getDb();
  const rows = await db.getAllAsync<ShareRow>(
    'SELECT * FROM expense_shares WHERE expense_id = ?',
    expenseId,
  );
  return rows.map(rowToShare);
}

export async function upsertShare(share: ExpenseShare): Promise<void> {
  const db = getDb();
  await db.runAsync(
    `INSERT INTO expense_shares (id, expense_id, person_id, value, share_mode)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(expense_id, person_id) DO UPDATE SET value=excluded.value, share_mode=excluded.share_mode`,
    share.id,
    share.expenseId,
    share.personId,
    share.value,
    share.shareMode,
  );
}

export async function deleteSharesForExpense(expenseId: string): Promise<void> {
  const db = getDb();
  await db.runAsync('DELETE FROM expense_shares WHERE expense_id = ?', expenseId);
}
