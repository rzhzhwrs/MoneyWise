# MoneyWise

A personal expense tracker for iOS built with React Native + Expo. All data is stored locally — no backend, no account required.

**Author:** ZHAO Cloris

---

## Features

- Log expenses with category, account, date, and notes
- Split bills among multiple people (by percentage or fixed amount)
- Manage multiple accounts (cash, debit, credit card, etc.)
- Monthly spending insights with category breakdown
- Fully offline — SQLite local storage
- Chinese UI, CNY default currency

---

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | React Native + Expo (managed, TypeScript strict) |
| Navigation | Expo Router (file-based) |
| Storage | `expo-sqlite` (WAL mode, FK constraints, migrations) |
| State | Zustand |
| Styling | NativeWind v4 + Tailwind CSS v3 |
| UUID | `expo-crypto` `randomUUID()` |
| Build | Expo EAS Build (cloud, no local Xcode needed) |
| Testing | Jest + ts-jest |

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- [Expo Go](https://expo.dev/go) installed on your iPhone (App Store)

---

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/rzhzhwrs/MoneyWise.git
cd MoneyWise
```

### 2. Install dependencies

```bash
npm install
```

### 3. Install the tunnel package (required if your phone is not on the same network)

```bash
npx expo install @expo/ngrok
```

---

## Running the App

### On a real iPhone (via Expo Go)

**Same Wi-Fi network:**
```bash
npx expo start
```

**Different network (VM, remote machine, etc.):**
```bash
npx expo start --tunnel
```

Then:
1. Open the **Camera app** on your iPhone
2. Point it at the QR code in the terminal
3. Tap the banner to open in **Expo Go**
4. Wait ~60 seconds for the first bundle to load

> On first launch, a default account **外部账户** (CNY) is created automatically so you can start logging expenses immediately.

### Clearing the cache (if the app fails to load)

```bash
npx expo start --tunnel --clear
```

---

## Running Tests

```bash
npm test
```

Tests are pure unit tests (no React Native environment needed) covering:

| File | What it tests |
|---|---|
| `splitCalculator.test.ts` | Split math — percentage & fixed modes, equal split, remainder allocation |
| `validation.test.ts` | Share validation — over/under allocation error messages |
| `currency.test.ts` | `formatCurrency`, `parseCents`, `centsToDisplay` |
| `date.test.ts` | Date formatting, zh-CN locale output |
| `seed.test.ts` | Default account seed — inserts once, skips if accounts exist |

---

## Project Structure

```
MoneyWise/
├── app/                        # Expo Router screens
│   ├── _layout.tsx             # Root layout — DB init + splash guard
│   └── (tabs)/
│       ├── expenses/           # Expense list + form (with split)
│       ├── accounts/           # Account list + form
│       └── insights/           # Monthly spending summary
├── src/
│   ├── db/                     # SQLite client, migrations, repositories
│   ├── stores/                 # Zustand stores
│   ├── hooks/                  # useAccounts, useExpenses, useSplitCalculations
│   ├── components/             # UI + expense + split components
│   ├── types/                  # TypeScript interfaces
│   └── utils/                  # currency, date, splitCalculator, validation
└── __tests__/                  # Unit tests
```

---

## Building for TestFlight

Requires an [Expo EAS](https://expo.dev/eas) account (free tier available).

```bash
npm install -g eas-cli
eas login
eas build --platform ios
```

The build runs on Expo's cloud Mac — no local Xcode required.

---

## License

Private — all rights reserved.
