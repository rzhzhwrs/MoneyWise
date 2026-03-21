import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Pressable,
} from 'react-native';
import type { Account } from '../../types';
import { Badge } from '../ui/Badge';

interface Props {
  accounts: Account[];
  selectedId: string;
  onSelect: (accountId: string) => void;
}

const TYPE_VARIANT: Record<string, 'blue' | 'green' | 'amber' | 'gray'> = {
  cash:   'green',
  debit:  'blue',
  credit: 'amber',
  other:  'gray',
};

export function AccountPicker({ accounts, selectedId, onSelect }: Props) {
  const [open, setOpen] = React.useState(false);
  const selected = accounts.find((a) => a.id === selectedId);

  return (
    <>
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
      >
        <View style={styles.triggerLeft}>
          <Text style={styles.triggerLabel}>Account</Text>
          <Text style={styles.triggerValue}>
            {selected ? selected.name : 'Select account'}
          </Text>
        </View>
        {selected ? (
          <Badge label={selected.type} variant={TYPE_VARIANT[selected.type] ?? 'gray'} />
        ) : null}
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>

      <Modal visible={open} animationType="slide" transparent>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        <SafeAreaView style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Select Account</Text>
          <FlatList
            data={accounts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.accountRow, item.id === selectedId && styles.selectedRow]}
                onPress={() => { onSelect(item.id); setOpen(false); }}
                activeOpacity={0.7}
              >
                <View style={styles.accountInfo}>
                  <Text style={styles.accountName}>{item.name}</Text>
                  <Text style={styles.accountCurrency}>{item.currency}</Text>
                </View>
                <Badge label={item.type} variant={TYPE_VARIANT[item.type] ?? 'gray'} />
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.list}
          />
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  triggerLeft: { flex: 1 },
  triggerLabel: { fontSize: 12, color: '#9CA3AF', fontWeight: '500' },
  triggerValue: { fontSize: 16, color: '#111827', fontWeight: '500', marginTop: 2 },
  chevron: { fontSize: 22, color: '#9CA3AF' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
    paddingBottom: 20,
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#E5E7EB', alignSelf: 'center', marginTop: 12, marginBottom: 8,
  },
  sheetTitle: { fontSize: 17, fontWeight: '700', color: '#111827', paddingHorizontal: 20, paddingBottom: 12 },
  list: { paddingHorizontal: 16, gap: 4 },
  accountRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: 10, backgroundColor: '#F9FAFB',
  },
  selectedRow: { backgroundColor: '#DBEAFE' },
  accountInfo: { flex: 1 },
  accountName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  accountCurrency: { fontSize: 13, color: '#6B7280', marginTop: 2 },
});
