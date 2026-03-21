import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAccounts } from '../../../src/hooks/useAccounts';
import { Badge } from '../../../src/components/ui/Badge';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { LoadingSpinner } from '../../../src/components/ui/LoadingSpinner';
import { formatCurrency } from '../../../src/utils/currency';
import type { Account } from '../../../src/types';

const TYPE_VARIANT: Record<string, 'blue' | 'green' | 'amber' | 'gray'> = {
  cash:   'green',
  debit:  'blue',
  credit: 'amber',
  other:  'gray',
};

function AccountRow({ account, onPress }: { account: Account; onPress: () => void }) {
  const isCreditNegative = account.type === 'credit' && account.balance > 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardTop}>
        <View style={styles.cardLeft}>
          <Text style={styles.accountName}>{account.name}</Text>
          <Badge label={account.type} variant={TYPE_VARIANT[account.type] ?? 'gray'} />
        </View>
        <View style={styles.cardRight}>
          <Text style={[styles.balance, isCreditNegative && styles.debtBalance]}>
            {formatCurrency(account.balance, account.currency)}
          </Text>
          <Text style={styles.currency}>{account.currency}</Text>
        </View>
      </View>
      {account.type === 'credit' && account.creditLimit !== null && (
        <View style={styles.creditRow}>
          <Text style={styles.creditLabel}>
            额度：{formatCurrency(account.creditLimit, account.currency)}
          </Text>
          <Text style={styles.creditLabel}>
            可用：{formatCurrency(account.creditLimit - account.balance, account.currency)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function AccountsScreen() {
  const router = useRouter();
  const { accounts, isLoading } = useAccounts();

  if (isLoading) return <LoadingSpinner />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>账户</Text>
      </View>

      {accounts.length === 0 ? (
        <EmptyState
          title="暂无账户"
          subtitle="点击 + 添加第一个账户"
        />
      ) : (
        <FlatList
          data={accounts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AccountRow
              account={item}
              onPress={() => router.push(`/(tabs)/accounts/${item.id}`)}
            />
          )}
          contentContainerStyle={styles.list}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(tabs)/accounts/new')}
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
  list: { padding: 16, gap: 10, paddingBottom: 100 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    gap: 8,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardLeft: { gap: 6 },
  cardRight: { alignItems: 'flex-end' },
  accountName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  balance: { fontSize: 20, fontWeight: '700', color: '#111827' },
  debtBalance: { color: '#DC2626' },
  currency: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  creditRow: { flexDirection: 'row', justifyContent: 'space-between' },
  creditLabel: { fontSize: 12, color: '#6B7280' },
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
