export type AccountType = 'cash' | 'debit' | 'credit' | 'other';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;            // cents
  creditLimit: number | null; // cents, only for credit accounts
  currency: string;           // ISO 4217
  createdAt: string;
  updatedAt: string;
}
