import { create } from 'zustand';
import { randomUUID } from 'expo-crypto';
import type { Account, AccountType } from '../types';
import {
  getAllAccounts,
  insertAccount,
  updateAccount,
  deleteAccount,
} from '../db/repositories/accountRepository';
import { nowISO } from '../utils/date';

interface AccountStore {
  accounts: Account[];
  isLoading: boolean;
  error: string | null;

  load: () => Promise<void>;
  add: (data: {
    name: string;
    type: AccountType;
    balance: number;
    creditLimit: number | null;
    currency: string;
  }) => Promise<Account>;
  update: (account: Account) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useAccountStore = create<AccountStore>((set, get) => ({
  accounts: [],
  isLoading: false,
  error: null,

  load: async () => {
    set({ isLoading: true, error: null });
    try {
      const accounts = await getAllAccounts();
      set({ accounts, isLoading: false });
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },

  add: async (data) => {
    const now = nowISO();
    const account: Account = {
      id: randomUUID(),
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    await insertAccount(account);
    set((state) => ({ accounts: [...state.accounts, account] }));
    return account;
  },

  update: async (account) => {
    const updated = { ...account, updatedAt: nowISO() };
    await updateAccount(updated);
    set((state) => ({
      accounts: state.accounts.map((a) => (a.id === updated.id ? updated : a)),
    }));
  },

  remove: async (id) => {
    await deleteAccount(id);
    set((state) => ({
      accounts: state.accounts.filter((a) => a.id !== id),
    }));
  },
}));
