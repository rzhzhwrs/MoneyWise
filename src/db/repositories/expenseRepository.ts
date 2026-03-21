import { getDb } from '../client';
import type { Expense, ExpenseCategory } from '../../types';

interface ExpenseRow {
  id: string;
  date: string;
  amount: number;
  category: string;
  account_id: string;
  description: string | null;
  is_split: number;
  created_at: string;
  updated_at: string;
}

function rowToExpense(row: ExpenseRow): Expense {
  return {
    id: row.id,
    date: row.date,
    amount: row.amount,
    category: row.category as ExpenseCategory,
    accountId: row.account_id,
    description: row.description,
    isSplit: row.is_split === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAllExpenses(): Promise<Expense[]> {
  const db = getDb();
  const rows = await db.getAllAsync<ExpenseRow>(
    'SELECT * FROM expenses ORDER BY date DESC, created_at DESC',
  );
  return rows.map(rowToExpense);
}

export async function getExpenseById(id: string): Promise<Expense | null> {
  const db = getDb();
  const row = await db.getFirstAsync<ExpenseRow>(
    'SELECT * FROM expenses WHERE id = ?',
    id,
  );
  return row ? rowToExpense(row) : null;
}

export async function insertExpense(expense: Expense): Promise<void> {
  const db = getDb();
  await db.runAsync(
    `INSERT INTO expenses (id, date, amount, category, account_id, description, is_split, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    expense.id,
    expense.date,
    expense.amount,
    expense.category,
    expense.accountId,
    expense.description,
    expense.isSplit ? 1 : 0,
    expense.createdAt,
    expense.updatedAt,
  );
}

export async function updateExpense(expense: Expense): Promise<void> {
  const db = getDb();
  await db.runAsync(
    `UPDATE expenses SET date=?, amount=?, category=?, account_id=?, description=?, is_split=?, updated_at=?
     WHERE id=?`,
    expense.date,
    expense.amount,
    expense.category,
    expense.accountId,
    expense.description,
    expense.isSplit ? 1 : 0,
    expense.updatedAt,
    expense.id,
  );
}

export async function deleteExpense(id: string): Promise<void> {
  const db = getDb();
  await db.runAsync('DELETE FROM expenses WHERE id = ?', id);
}
