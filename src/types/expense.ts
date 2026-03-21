export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'accommodation'
  | 'entertainment'
  | 'shopping'
  | 'health'
  | 'utilities'
  | 'other';

export interface Expense {
  id: string;
  date: string;               // "YYYY-MM-DD"
  amount: number;             // cents
  category: ExpenseCategory;
  accountId: string;
  description: string | null;
  isSplit: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Person {
  id: string;
  expenseId: string;
  name: string;
  sortOrder: number;
}

export type ShareMode = 'percentage' | 'fixed';

export interface ExpenseShare {
  id: string;
  expenseId: string;
  personId: string;
  value: number;              // % (0–100) or cents
  shareMode: ShareMode;
}

export interface PersonOwes {
  personId: string;
  personName: string;
  amount: number;             // cents
}

export interface SplitSummary {
  personOwes: PersonOwes[];
  isValid: boolean;
  error: string | null;
}
