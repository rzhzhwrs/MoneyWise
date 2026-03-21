import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { useExpenseStore } from '../../../src/stores/expenseStore';
import { useAccountStore } from '../../../src/stores/accountStore';
import { formatCurrency } from '../../../src/utils/currency';
import { Card } from '../../../src/components/ui/Card';

const CATEGORY_EMOJI: Record<string, string> = {
  food: '🍜', transport: '🚇', accommodation: '🏨', entertainment: '🎬',
  shopping: '🛍️', health: '💊', utilities: '💡', other: '📌',
};

export default function InsightsScreen() {
  const expenses = useExpenseStore((s) => s.expenses);
  const accounts = useAccountStore((s) => s.accounts);

  // This month
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthExpenses = expenses.filter((e) => e.date.startsWith(thisMonth));
  const monthTotal = monthExpenses.reduce((s, e) => s + e.amount, 0);

  // By category (this month)
  const byCat = monthExpenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount;
    return acc;
  }, {});
  const sortedCats = Object.entries(byCat).sort((a, b) => b[1] - a[1]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>统计</Text>
        <Text style={styles.headerSub}>本月</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Monthly total */}
        <Card style={styles.totalCard}>
          <Text style={styles.totalLabel}>本月支出</Text>
          <Text style={styles.totalAmount}>
            {formatCurrency(monthTotal, accounts[0]?.currency ?? 'CNY')}
          </Text>
          <Text style={styles.totalSub}>{monthExpenses.length} 笔</Text>
        </Card>

        {/* Category breakdown */}
        {sortedCats.length > 0 && (
          <Card>
            <Text style={styles.sectionTitle}>按分类</Text>
            {sortedCats.map(([cat, amount]) => {
              const pct = monthTotal > 0 ? (amount / monthTotal) * 100 : 0;
              return (
                <View key={cat} style={styles.catRow}>
                  <Text style={styles.catEmoji}>{CATEGORY_EMOJI[cat] ?? '📌'}</Text>
                  <View style={styles.catInfo}>
                    <View style={styles.catLabelRow}>
                      <Text style={styles.catName}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</Text>
                      <Text style={styles.catAmount}>
                        {formatCurrency(amount, accounts[0]?.currency ?? 'CNY')}
                      </Text>
                    </View>
                    <View style={styles.barBg}>
                      <View style={[styles.barFill, { width: `${pct}%` }]} />
                    </View>
                  </View>
                </View>
              );
            })}
          </Card>
        )}

        {/* Account balances */}
        {accounts.length > 0 && (
          <Card>
            <Text style={styles.sectionTitle}>账户余额</Text>
            {accounts.map((acc) => (
              <View key={acc.id} style={styles.accRow}>
                <Text style={styles.accName}>{acc.name}</Text>
                <Text style={styles.accBalance}>
                  {formatCurrency(acc.balance, acc.currency)}
                </Text>
              </View>
            ))}
          </Card>
        )}

        {expenses.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>记录支出后，这里将显示统计数据。</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#111827' },
  headerSub: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  content: { padding: 16, gap: 14, paddingBottom: 40 },
  totalCard: { alignItems: 'center', backgroundColor: '#3B82F6' },
  totalLabel: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },
  totalAmount: { fontSize: 36, fontWeight: '800', color: '#fff', marginVertical: 4 },
  totalSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 12 },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  catEmoji: { fontSize: 22 },
  catInfo: { flex: 1, gap: 4 },
  catLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  catName: { fontSize: 14, color: '#374151' },
  catAmount: { fontSize: 14, fontWeight: '600', color: '#111827' },
  barBg: { height: 4, backgroundColor: '#F3F4F6', borderRadius: 2, overflow: 'hidden' },
  barFill: { height: 4, backgroundColor: '#3B82F6', borderRadius: 2 },
  accRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 6,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  accName: { fontSize: 15, color: '#374151' },
  accBalance: { fontSize: 15, fontWeight: '700', color: '#111827' },
  empty: { alignItems: 'center', paddingVertical: 32 },
  emptyText: { color: '#9CA3AF', fontSize: 14 },
});
