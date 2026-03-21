import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { Expense, Account } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { Badge } from '../ui/Badge';

const CATEGORY_LABELS: Record<string, string> = {
  food: 'Food',
  transport: 'Transport',
  accommodation: 'Stay',
  entertainment: 'Fun',
  shopping: 'Shopping',
  health: 'Health',
  utilities: 'Utilities',
  other: 'Other',
};

const CATEGORY_EMOJI: Record<string, string> = {
  food: '🍜',
  transport: '🚇',
  accommodation: '🏨',
  entertainment: '🎬',
  shopping: '🛍️',
  health: '💊',
  utilities: '💡',
  other: '📌',
};

interface Props {
  expense: Expense;
  account: Account | undefined;
  onPress: () => void;
}

export function ExpenseCard({ expense, account, onPress }: Props) {
  const currency = account?.currency ?? 'USD';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.row}>
        <View style={styles.left}>
          <Text style={styles.emoji}>
            {CATEGORY_EMOJI[expense.category] ?? '📌'}
          </Text>
          <View style={styles.info}>
            <Text style={styles.category}>
              {CATEGORY_LABELS[expense.category] ?? expense.category}
            </Text>
            {expense.description ? (
              <Text style={styles.description} numberOfLines={1}>
                {expense.description}
              </Text>
            ) : null}
            <View style={styles.tags}>
              {account ? (
                <Badge label={account.name} variant="gray" />
              ) : null}
              {expense.isSplit ? <Badge label="Split" variant="blue" /> : null}
            </View>
          </View>
        </View>
        <Text style={styles.amount}>
          {formatCurrency(expense.amount, currency)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  left: { flex: 1, flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  emoji: { fontSize: 28 },
  info: { flex: 1, gap: 4 },
  category: { fontSize: 15, fontWeight: '600', color: '#111827' },
  description: { fontSize: 13, color: '#6B7280' },
  tags: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  amount: { fontSize: 17, fontWeight: '700', color: '#111827' },
});
