import { create } from 'zustand';
import type { Expense } from '../types';
import {
  getAllExpenses,
  deleteExpense,
} from '../db/repositories/expenseRepository';
import { deletePeopleForExpense } from '../db/repositories/personRepository';
import { deleteSharesForExpense } from '../db/repositories/shareRepository';

interface ExpenseStore {
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;

  load: () => Promise<void>;
  reload: () => Promise<void>;
  remove: (id: string) => Promise<void>;
  /** Called by activeExpenseStore after a successful save */
  upsertLocal: (expense: Expense) => void;
}

export const useExpenseStore = create<ExpenseStore>((set, get) => ({
  expenses: [],
  isLoading: false,
  error: null,

  load: async () => {
    if (get().expenses.length > 0) return; // already loaded
    await get().reload();
  },

  reload: async () => {
    set({ isLoading: true, error: null });
    try {
      const expenses = await getAllExpenses();
      set({ expenses, isLoading: false });
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },

  remove: async (id) => {
    await deleteSharesForExpense(id);
    await deletePeopleForExpense(id);
    await deleteExpense(id);
    set((state) => ({
      expenses: state.expenses.filter((e) => e.id !== id),
    }));
  },

  upsertLocal: (expense) => {
    set((state) => {
      const exists = state.expenses.some((e) => e.id === expense.id);
      if (exists) {
        return {
          expenses: state.expenses.map((e) =>
            e.id === expense.id ? expense : e,
          ),
        };
      }
      // Insert and re-sort by date desc
      const next = [expense, ...state.expenses].sort((a, b) =>
        b.date.localeCompare(a.date),
      );
      return { expenses: next };
    });
  },
}));
