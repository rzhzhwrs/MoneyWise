# MoneyWise — iOS App Implementation Plan (v2)

## Context
Building a React Native + Expo iOS app from scratch on Windows (no local Mac/Xcode).
Core concept: **one expense = one record**. Split bill is an optional feature on any expense — no separate bills section.
Accounts (cash, card, etc.) are managed globally and selected when logging an expense.

**Distribution:** Personal/TestFlight initially, App Store quality code.
**No backend** — fully local via SQLite.

---

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | React Native + Expo (managed, TypeScript strict) |
| Navigation | Expo Router (file-based) |
| Storage | `expo-sqlite` (WAL mode, FK constraints, migrations) |
| State | Zustand (optimistic updates for split shares) |
| Styling | NativeWind v4 (Tailwind for RN) |
| UUID | `expo-crypto` `randomUUID()` |
| Build | Expo EAS Build (cloud Mac, no local Xcode needed) |
| Dev preview | Expo Go on real iPhone |
| Testing | Jest (Expo preset) — pure utility functions |

---

## Data Models

### TypeScript Types

```typescript
// src/types/account.ts
type AccountType = 'cash' | 'debit' | 'credit' | 'other';

interface Account {
  id: string;
  name: string;               // e.g. "招行信用卡", "Cash"
  type: AccountType;
  balance: number;            // cents (current balance or credit used)
  creditLimit: number | null; // cents, only for credit accounts
  currency: string;           // ISO 4217, e.g. "USD", "CNY"
  createdAt: string;
  updatedAt: string;
}

// src/types/expense.ts
type ExpenseCategory = 'food' | 'transport' | 'accommodation' | 'entertainment' | 'shopping' | 'health' | 'utilities' | 'other';

interface Expense {
  id: string;
  date: string;               // "YYYY-MM-DD"
  amount: number;             // cents (total, source of truth)
  category: ExpenseCategory;
  accountId: string;          // FK → accounts
  description: string | null;
  isSplit: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Person {
  id: string;
  expenseId: string;          // scoped per expense (not global)
  name: string;
  sortOrder: number;
}

type ShareMode = 'percentage' | 'fixed';

interface ExpenseShare {
  id: string;
  expenseId: string;
  personId: string;
  value: number;              // % (0–100, REAL) or cents (INTEGER used as REAL)
  shareMode: ShareMode;       // same mode for all shares on one expense
}

// Derived — never persisted
interface PersonOwes {
  personId: string;
  personName: string;
  amount: number;             // cents
}

interface SplitSummary {
  personOwes: PersonOwes[];
  isValid: boolean;
  error: string | null;       // e.g. "Shares sum to 85% — 15% unassigned"
}
```

### SQLite Schema

```sql
-- 001_initial

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE schema_version (version INTEGER NOT NULL);
INSERT INTO schema_version VALUES (0);

CREATE TABLE accounts (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  type         TEXT NOT NULL DEFAULT 'cash',  -- cash|debit|credit|other
  balance      INTEGER NOT NULL DEFAULT 0,    -- cents
  credit_limit INTEGER,                       -- cents, nullable
  currency     TEXT NOT NULL DEFAULT 'USD',
  created_at   TEXT NOT NULL,
  updated_at   TEXT NOT NULL
);

CREATE TABLE expenses (
  id          TEXT PRIMARY KEY,
  date        TEXT NOT NULL,               -- "YYYY-MM-DD"
  amount      INTEGER NOT NULL,            -- cents
  category    TEXT NOT NULL,
  account_id  TEXT NOT NULL REFERENCES accounts(id),
  description TEXT,
  is_split    INTEGER NOT NULL DEFAULT 0,  -- 0|1 (SQLite has no bool)
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

CREATE TABLE people (
  id          TEXT PRIMARY KEY,
  expense_id  TEXT NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE expense_shares (
  id          TEXT PRIMARY KEY,
  expense_id  TEXT NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  person_id   TEXT NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  value       REAL NOT NULL DEFAULT 0,    -- % or cents
  share_mode  TEXT NOT NULL DEFAULT 'percentage',
  UNIQUE(expense_id, person_id)
);

-- 002_indexes

CREATE INDEX idx_expenses_date       ON expenses(date DESC);
CREATE INDEX idx_expenses_account    ON expenses(account_id);
CREATE INDEX idx_people_expense      ON people(expense_id, sort_order);
CREATE INDEX idx_shares_expense      ON expense_shares(expense_id);
CREATE INDEX idx_shares_person       ON expense_shares(person_id);
```

---

## Folder Structure

```
MoneyWise/
├── app/
│   ├── _layout.tsx                   # Root: DB init + SplashScreen guard
│   ├── (tabs)/
│   │   ├── _layout.tsx               # Bottom tab navigator (3 tabs)
│   │   ├── expenses/
│   │   │   ├── index.tsx             # Expense list (grouped by date)
│   │   │   └── [id].tsx              # Create / Edit expense (+ optional split)
│   │   ├── accounts/
│   │   │   ├── index.tsx             # Accounts list
│   │   │   └── [id].tsx              # Create / Edit account
│   │   └── insights/
│   │       └── index.tsx             # Insights dashboard (placeholder → full feature later)
│
├── src/
│   ├── db/
│   │   ├── client.ts                 # SQLite singleton
│   │   ├── migrations/
│   │   │   ├── index.ts              # Migration runner
│   │   │   ├── 001_initial.ts
│   │   │   └── 002_indexes.ts
│   │   └── repositories/
│   │       ├── accountRepository.ts
│   │       ├── expenseRepository.ts
│   │       ├── personRepository.ts
│   │       └── shareRepository.ts
│   │
│   ├── stores/
│   │   ├── accountStore.ts           # CRUD for accounts list
│   │   ├── expenseStore.ts           # Expense list
│   │   └── activeExpenseStore.ts     # Working state for open expense + split
│   │
│   ├── types/
│   │   ├── account.ts
│   │   ├── expense.ts
│   │   └── index.ts
│   │
│   ├── hooks/
│   │   ├── useAccounts.ts
│   │   ├── useExpenses.ts
│   │   └── useSplitCalculations.ts   # Pure derived: PersonOwes[] + validation
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── TextInput.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── SegmentedControl.tsx  # Percentage | Fixed Amount toggle
│   │   │   ├── EmptyState.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── expenses/
│   │   │   ├── ExpenseCard.tsx       # Row in the list (amount, category, account, split badge)
│   │   │   ├── CategoryPicker.tsx
│   │   │   ├── AccountPicker.tsx     # Bottom sheet picker for account selection
│   │   │   └── DatePicker.tsx
│   │   └── split/
│   │       ├── SplitToggle.tsx       # The on/off toggle + collapse animation
│   │       ├── PersonRow.tsx         # Name + share value input
│   │       ├── ValidationBanner.tsx  # "15% unassigned" / "¥3.00 remaining"
│   │       ├── SplitSummaryCard.tsx  # Each person's final amount
│   │       └── EqualSplitButton.tsx  # "Split Equally" quick action
│   │
│   └── utils/
│       ├── currency.ts               # formatCurrency(cents, currency): string
│       ├── date.ts
│       ├── splitCalculator.ts        # Pure math — PersonOwes[] (unit-tested)
│       └── validation.ts             # Validates shares sum (unit-tested)
│
└── __tests__/
    ├── splitCalculator.test.ts
    └── validation.test.ts
```

---

## Screen List

| Screen | File | Purpose |
|---|---|---|
| Expense List | `(tabs)/expenses/index.tsx` | All expenses grouped by date, daily totals, FAB to add |
| **Expense Form** | `(tabs)/expenses/[id].tsx` | **Core screen** — create/edit expense + optional split |
| Accounts List | `(tabs)/accounts/index.tsx` | All accounts with balance, FAB to add |
| Account Form | `(tabs)/accounts/[id].tsx` | Create / edit account |
| **Insights** | `(tabs)/insights/index.tsx` | Spending analytics + account balances (Phase 2) |

### Insights Tab (scalability note)
Scaffold the tab now so the nav structure is stable. Full implementation is Phase 2.
Planned sections:
- **Spending summary** — total by period (week / month / year), breakdown by category
- **Account status** — each account's current balance, credit used vs limit
- Data is derived entirely from the existing `expenses` + `accounts` tables — no new schema needed

---

## Expense Form Screen (Core UI)

This single screen handles both simple expense logging and split bills.

```
<ExpenseFormScreen>
  │
  ├── <DatePicker>                      — defaults to today
  ├── Amount input                      — numeric, large font, currency symbol
  ├── <CategoryPicker>                  — horizontal scroll of category chips
  ├── <AccountPicker>                   — bottom sheet: select from accounts list
  ├── Description input                 — optional, multiline
  │
  ├── ─────────── Split Bill ───────────
  ├── <SplitToggle>                     — on/off; expands section below when on
  │
  │   [when split is ON]
  │   ├── <SegmentedControl>            — "Percentage | Fixed Amount"
  │   ├── People list + "Add Person" button
  │   │   └── <PersonRow> × N
  │   │       ├── Name input (editable)
  │   │       └── Share value input (% or amount)
  │   ├── <EqualSplitButton>            — resets to equal shares
  │   ├── <ValidationBanner>            — green ✓ when valid, amber/red when not
  │   └── <SplitSummaryCard>            — "Alice owes ¥32.50 · Bob owes ¥32.50"
  │
  └── [Save] button                     — disabled if split is on and invalid
```

**UX rules:**
- Amount field is always the source of truth; split shares must reconcile to it
- Split section collapses with animation when toggled off; share data is preserved in state but not saved if toggled off on save
- `PersonRow` share input commits to store `onBlur` (optimistic), not on every keystroke
- `ValidationBanner`: percentage mode shows `Σ%` vs 100%; fixed mode shows `Σamount` vs `expense.amount`
- "Split Equally": `Math.floor(100/n)` per person, remainder to person[0] (percentage); `Math.floor(amount/n)` cents per person, remainder cents to person[0] (fixed)
- Save button is disabled if `isSplit && !isValid`

---

## State Management

```
SQLite (source of truth) ↔ repositories ↔ Zustand stores ↔ hooks ↔ components
```

**`activeExpenseStore`:**
```typescript
interface ActiveExpenseStore {
  expense: Expense | null;
  people: Person[];
  shares: ExpenseShare[];
  shareMode: ShareMode;
  isDirty: boolean;

  load: (id: string) => Promise<void>;       // load existing expense
  initNew: () => void;                        // fresh blank state

  // Expense field mutations
  setField: (patch: Partial<Expense>) => void;

  // Split mutations (optimistic — persist on save)
  addPerson: (name: string) => void;
  removePerson: (personId: string) => void;
  updateShare: (personId: string, value: number) => void;
  setShareMode: (mode: ShareMode) => void;
  equalizeShares: () => void;

  // Persist everything to SQLite
  save: () => Promise<string>;   // returns expense id
  delete: (id: string) => Promise<void>;
}
```

**`useSplitCalculations` hook** (pure derived, no async):
```typescript
// for each person:
// percentage: personOwes = expense.amount * (share.value / 100)
// fixed:      personOwes = share.value
```

---

## Account Feature

Accounts are simple CRUD managed via `accountStore`. Key fields:
- **Name** — free text (e.g. "招行信用卡", "支付宝", "Cash")
- **Type** — cash / debit / credit / other
- **Balance** — current balance in cents (manually maintained by user)
- **Credit limit** — cents, only shown/editable for credit type
- **Currency** — ISO 4217 (e.g. USD, CNY)

The `AccountPicker` in the expense form shows account name + currency + type badge. Default account can be set (last used).

---

## Critical Gotchas

1. **Cents everywhere** — `amount`, `balance`, `creditLimit` are integers in cents. Only `expense_shares.value` is `REAL` (for fractional percentages).
2. **DB init before render** — `_layout.tsx` awaits DB open + migrations before rendering. Use `SplashScreen.preventAutoHideAsync()` guard.
3. **`is_split` as INTEGER** — SQLite has no boolean. Store as `0`/`1`, map to TypeScript `boolean` in repository layer.
4. **NativeWind v4** — `withNativeWind` in `metro.config.js`, `"nativewind/preset"` in `tailwind.config.js`, `"nativewind/babel"` plugin in `babel.config.js`.
5. **KeyboardAvoidingView** — `behavior="padding"` + `ScrollView` on the expense form. Don't use FlatList inside KeyboardAvoidingView.
6. **Equal-split remainder** — floor division, give remainder to person[0]. ValidationBanner still shows ✓ green.
7. **Account deletion** — if an account is referenced by expenses, either block deletion or show a warning. Don't cascade-delete expenses silently.
8. **Split data on toggle-off** — when user turns split off and saves, delete `people` + `expense_shares` rows for that expense. Don't leave orphaned rows.

---

## Implementation Sequence

1. Scaffold: `npx create-expo-app MoneyWise --template blank-typescript`; install Expo Router, NativeWind, Zustand
2. DB client + migrations + migration runner
3. Repository layer (accountRepository, expenseRepository, personRepository, shareRepository)
4. `accountStore` + Accounts screens (CRUD) — simpler, validates DB/store pattern
5. `expenseStore` + Expense list screen
6. `activeExpenseStore` + Expense form (simple mode, no split yet)
7. Split section: `SplitToggle`, `PersonRow`, `useSplitCalculations`, `ValidationBanner`
8. `EqualSplitButton` + `SplitSummaryCard`
9. Polish: empty states, loading skeletons, error boundaries, haptic feedback on save

---

## Verification

- Unit tests: `splitCalculator.ts` and `validation.ts` (pure, no mocking)
- Manual testing via **Expo Go** on real iPhone (no build needed)
- Full iOS build via **EAS Build** → TestFlight
