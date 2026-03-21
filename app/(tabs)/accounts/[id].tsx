import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAccountStore } from '../../../src/stores/accountStore';
import { TextInput } from '../../../src/components/ui/TextInput';
import { Button } from '../../../src/components/ui/Button';
import { SegmentedControl } from '../../../src/components/ui/SegmentedControl';
import { parseCents, centsToDisplay } from '../../../src/utils/currency';
import type { AccountType } from '../../../src/types';

const ACCOUNT_TYPES: { label: string; value: AccountType }[] = [
  { label: 'Cash',   value: 'cash'   },
  { label: 'Debit',  value: 'debit'  },
  { label: 'Credit', value: 'credit' },
  { label: 'Other',  value: 'other'  },
];

export default function AccountFormScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const isNew = id === 'new';

  const { accounts, add, update, remove } = useAccountStore();
  const existing = accounts.find((a) => a.id === id);

  const [name, setName] = useState(existing?.name ?? '');
  const [type, setType] = useState<AccountType>(existing?.type ?? 'cash');
  const [balanceText, setBalanceText] = useState(
    existing ? centsToDisplay(existing.balance) : '0.00',
  );
  const [creditLimitText, setCreditLimitText] = useState(
    existing?.creditLimit != null ? centsToDisplay(existing.creditLimit) : '',
  );
  const [currency, setCurrency] = useState(existing?.currency ?? 'USD');
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    if (!isNew && existing) {
      setName(existing.name);
      setType(existing.type);
      setBalanceText(centsToDisplay(existing.balance));
      setCreditLimitText(
        existing.creditLimit != null ? centsToDisplay(existing.creditLimit) : '',
      );
      setCurrency(existing.currency);
    }
  }, [id]);

  const handleSave = async () => {
    if (!name.trim()) { setNameError('Name is required'); return; }
    setNameError('');
    setSaving(true);
    try {
      const balance = parseCents(balanceText);
      const creditLimit = type === 'credit' && creditLimitText
        ? parseCents(creditLimitText)
        : null;

      if (isNew) {
        await add({ name: name.trim(), type, balance, creditLimit, currency: currency.toUpperCase().trim() });
      } else if (existing) {
        await update({ ...existing, name: name.trim(), type, balance, creditLimit, currency: currency.toUpperCase().trim() });
      }
      router.back();
    } catch (e) {
      Alert.alert('Save failed', String(e));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!existing) return;
    Alert.alert('Delete Account', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await remove(existing.id);
            router.back();
          } catch (e) {
            Alert.alert('Cannot delete', String(e));
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isNew ? 'New Account' : 'Edit Account'}</Text>
        {!isNew ? (
          <TouchableOpacity onPress={handleDelete}>
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        ) : <View style={{ width: 56 }} />}
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TextInput
            label="Account Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Cash, Chase Debit"
            error={nameError}
          />

          <View>
            <Text style={styles.label}>Account Type</Text>
            <SegmentedControl
              options={ACCOUNT_TYPES}
              value={type}
              onChange={setType}
            />
          </View>

          <TextInput
            label="Current Balance"
            value={balanceText}
            onChangeText={setBalanceText}
            onBlur={() => {
              const c = parseCents(balanceText);
              setBalanceText(centsToDisplay(c));
            }}
            keyboardType="decimal-pad"
            placeholder="0.00"
          />

          {type === 'credit' && (
            <TextInput
              label="Credit Limit (optional)"
              value={creditLimitText}
              onChangeText={setCreditLimitText}
              onBlur={() => {
                if (creditLimitText) {
                  const c = parseCents(creditLimitText);
                  setCreditLimitText(centsToDisplay(c));
                }
              }}
              keyboardType="decimal-pad"
              placeholder="0.00"
            />
          )}

          <TextInput
            label="Currency (ISO 4217)"
            value={currency}
            onChangeText={setCurrency}
            placeholder="USD"
            autoCapitalize="characters"
            maxLength={3}
          />

          <Button title="Save Account" onPress={handleSave} loading={saving} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  backBtn: { width: 56 },
  backText: { color: '#3B82F6', fontSize: 17 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  deleteText: { color: '#EF4444', fontSize: 15, fontWeight: '600' },
  content: { padding: 16, gap: 16 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 },
});
