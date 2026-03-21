import React from 'react';
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useExpenses } from '../../../src/hooks/useExpenses';
import { useAccountStore } from '../../../src/stores/accountStore';
import { ExpenseCard } from '../../../src/components/expenses/ExpenseCard';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { LoadingSpinner } from '../../../src/components/ui/LoadingSpinner';
import { formatCurrency } from '../../../src/utils/currency';
import { formatShortDate } from '../../../src/utils/date';
import type { Expense } from '../../../src/types';

export default function ExpensesScreen() {
  const router = useRouter();
  const { expenses, groupedDates, grouped, isLoading } = useExpenses();
  const accounts = useAccountStore((s) => s.accounts);

  // Build sections for SectionList
  const sections = groupedDates.map((date) => ({
    title: date,
    data: grouped[date],
    total: grouped[date].reduce((sum, e) => sum + e.amount, 0),
  }));

  if (isLoading) return <LoadingSpinner />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>支出记录</Text>
      </View>

      {expenses.length === 0 ? (
        <EmptyState
          title="暂无支出记录"
          subtitle="点击 + 记录第一笔支出"
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }: { item: Expense }) => (
            <ExpenseCard
              expense={item}
              account={accounts.find((a) => a.id === item.accountId)}
              onPress={() => router.push(`/(tabs)/expenses/${item.id}`)}
            />
          )}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionDate}>{formatShortDate(section.title)}</Text>
              <Text style={styles.sectionTotal}>
                {formatCurrency(
                  section.total,
                  accounts.find(
                    (a) => a.id === section.data[0]?.accountId,
                  )?.currency ?? 'USD',
                )}
              </Text>
            </View>
          )}
          contentContainerStyle={styles.list}
          stickySectionHeadersEnabled={false}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(tabs)/expenses/new')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#111827' },
  list: { paddingBottom: 100 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 6,
  },
  sectionDate: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  sectionTotal: { fontSize: 14, fontWeight: '700', color: '#374151' },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: { color: '#fff', fontSize: 28, fontWeight: '300', lineHeight: 32 },
});
