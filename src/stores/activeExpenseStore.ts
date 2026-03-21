import { create } from 'zustand';
import { randomUUID } from 'expo-crypto';
import type { Expense, Person, ExpenseShare, ShareMode } from '../types';
import {
  getExpenseById,
  insertExpense,
  updateExpense,
} from '../db/repositories/expenseRepository';
import {
  getPeopleForExpense,
  insertPerson,
  deletePeopleForExpense,
} from '../db/repositories/personRepository';
import {
  getSharesForExpense,
  upsertShare,
  deleteSharesForExpense,
} from '../db/repositories/shareRepository';
import { todayString, nowISO } from '../utils/date';
import { computeEqualShares } from '../utils/splitCalculator';

interface ActiveExpenseStore {
  expense: Expense | null;
  people: Person[];
  shares: ExpenseShare[];
  shareMode: ShareMode;
  isDirty: boolean;

  load: (id: string) => Promise<void>;
  initNew: (accountId?: string) => void;

  setField: (patch: Partial<Expense>) => void;

  addPerson: (name: string) => void;
  removePerson: (personId: string) => void;
  updateShare: (personId: string, value: number) => void;
  setShareMode: (mode: ShareMode) => void;
  equalizeShares: () => void;

  save: () => Promise<string>;
  deleteExpense: (id: string) => Promise<void>;
}

const blankExpense = (accountId: string = ''): Expense => ({
  id: randomUUID(),
  date: todayString(),
  amount: 0,
  category: 'other',
  accountId,
  description: null,
  isSplit: false,
  createdAt: nowISO(),
  updatedAt: nowISO(),
});

export const useActiveExpenseStore = create<ActiveExpenseStore>((set, get) => ({
  expense: null,
  people: [],
  shares: [],
  shareMode: 'percentage',
  isDirty: false,

  load: async (id) => {
    const expense = await getExpenseById(id);
    if (!expense) throw new Error(`Expense ${id} not found`);
    const people = await getPeopleForExpense(id);
    const shares = await getSharesForExpense(id);
    const shareMode: ShareMode =
      shares.length > 0 ? (shares[0].shareMode as ShareMode) : 'percentage';
    set({ expense, people, shares, shareMode, isDirty: false });
  },

  initNew: (accountId = '') => {
    set({
      expense: blankExpense(accountId),
      people: [],
      shares: [],
      shareMode: 'percentage',
      isDirty: false,
    });
  },

  setField: (patch) => {
    set((state) => ({
      expense: state.expense ? { ...state.expense, ...patch } : state.expense,
      isDirty: true,
    }));
  },

  addPerson: (name) => {
    set((state) => {
      const newPerson: Person = {
        id: randomUUID(),
        expenseId: state.expense?.id ?? '',
        name,
        sortOrder: state.people.length,
      };
      const newShare: ExpenseShare = {
        id: randomUUID(),
        expenseId: state.expense?.id ?? '',
        personId: newPerson.id,
        value: 0,
        shareMode: state.shareMode,
      };
      return {
        people: [...state.people, newPerson],
        shares: [...state.shares, newShare],
        isDirty: true,
      };
    });
  },

  removePerson: (personId) => {
    set((state) => ({
      people: state.people.filter((p) => p.id !== personId),
      shares: state.shares.filter((s) => s.personId !== personId),
      isDirty: true,
    }));
  },

  updateShare: (personId, value) => {
    set((state) => ({
      shares: state.shares.map((s) =>
        s.personId === personId ? { ...s, value } : s,
      ),
      isDirty: true,
    }));
  },

  setShareMode: (mode) => {
    set((state) => ({
      shareMode: mode,
      shares: state.shares.map((s) => ({ ...s, shareMode: mode, value: 0 })),
      isDirty: true,
    }));
  },

  equalizeShares: () => {
    set((state) => {
      const n = state.people.length;
      if (n === 0 || !state.expense) return state;
      const values = computeEqualShares(state.expense.amount, n, state.shareMode);
      const shares = state.people.map((person, i) => {
        const existing = state.shares.find((s) => s.personId === person.id);
        return existing
          ? { ...existing, value: values[i], shareMode: state.shareMode }
          : {
              id: randomUUID(),
              expenseId: state.expense!.id,
              personId: person.id,
              value: values[i],
              shareMode: state.shareMode,
            };
      });
      return { shares, isDirty: true };
    });
  },

  save: async () => {
    const { expense, people, shares, shareMode } = get();
    if (!expense) throw new Error('No active expense to save');

    const now = nowISO();
    const toSave: Expense = { ...expense, updatedAt: now };

    // If split is off, clear split data
    if (!toSave.isSplit) {
      await deleteSharesForExpense(toSave.id);
      await deletePeopleForExpense(toSave.id);
    }

    // Upsert expense
    const existing = await getExpenseById(toSave.id);
    if (existing) {
      await updateExpense(toSave);
    } else {
      await insertExpense(toSave);
    }

    // If split is on, persist people + shares
    if (toSave.isSplit) {
      // Clear and re-insert people/shares for simplicity
      await deleteSharesForExpense(toSave.id);
      await deletePeopleForExpense(toSave.id);

      for (const person of people) {
        await insertPerson({ ...person, expenseId: toSave.id });
      }
      for (const share of shares) {
        await upsertShare({
          ...share,
          expenseId: toSave.id,
          shareMode,
        });
      }
    }

    set({ expense: toSave, isDirty: false });
    return toSave.id;
  },

  deleteExpense: async (id) => {
    const { deleteSharesForExpense: delShares } = await import('../db/repositories/shareRepository');
    const { deletePeopleForExpense: delPeople } = await import('../db/repositories/personRepository');
    const { deleteExpense: delExp } = await import('../db/repositories/expenseRepository');
    await delShares(id);
    await delPeople(id);
    await delExp(id);
    set({ expense: null, people: [], shares: [], isDirty: false });
  },
}));
