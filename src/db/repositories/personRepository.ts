import { getDb } from '../client';
import type { Person } from '../../types';

export async function getPeopleForExpense(expenseId: string): Promise<Person[]> {
  const db = getDb();
  const rows = await db.getAllAsync<Person>(
    'SELECT id, expense_id as expenseId, name, sort_order as sortOrder FROM people WHERE expense_id = ? ORDER BY sort_order ASC',
    expenseId,
  );
  return rows;
}

export async function insertPerson(person: Person): Promise<void> {
  const db = getDb();
  await db.runAsync(
    'INSERT INTO people (id, expense_id, name, sort_order) VALUES (?, ?, ?, ?)',
    person.id,
    person.expenseId,
    person.name,
    person.sortOrder,
  );
}

export async function updatePerson(person: Person): Promise<void> {
  const db = getDb();
  await db.runAsync(
    'UPDATE people SET name=?, sort_order=? WHERE id=?',
    person.name,
    person.sortOrder,
    person.id,
  );
}

export async function deletePerson(id: string): Promise<void> {
  const db = getDb();
  await db.runAsync('DELETE FROM people WHERE id = ?', id);
}

export async function deletePeopleForExpense(expenseId: string): Promise<void> {
  const db = getDb();
  await db.runAsync('DELETE FROM people WHERE expense_id = ?', expenseId);
}
