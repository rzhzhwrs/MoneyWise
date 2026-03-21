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
import { useActiveExpenseStore } from '../../../src/stores/activeExpenseStore';
import { useExpenseStore } from '../../../src/stores/expenseStore';
import { useAccountStore } from '../../../src/stores/accountStore';
import { useSplitCalculations } from '../../../src/hooks/useSplitCalculations';
import { DatePicker } from '../../../src/components/expenses/DatePicker';
import { CategoryPicker } from '../../../src/components/expenses/CategoryPicker';
import { AccountPicker } from '../../../src/components/expenses/AccountPicker';
import { TextInput } from '../../../src/components/ui/TextInput';
import { Button } from '../../../src/components/ui/Button';
import { SegmentedControl } from '../../../src/components/ui/SegmentedControl';
import { SplitToggle } from '../../../src/components/split/SplitToggle';
import { PersonRow } from '../../../src/components/split/PersonRow';
import { ValidationBanner } from '../../../src/components/split/ValidationBanner';
import { SplitSummaryCard } from '../../../src/components/split/SplitSummaryCard';
import { EqualSplitButton } from '../../../src/components/split/EqualSplitButton';
import { parseCents, centsToDisplay } from '../../../src/utils/currency';
import type { ExpenseCategory } from '../../../src/types';

export default function ExpenseFormScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const isNew = id === 'new';

  const store = useActiveExpenseStore();
  const { upsertLocal } = useExpenseStore();
  const accounts = useAccountStore((s) => s.accounts);

  const [saving, setSaving] = useState(false);
  const [amountText, setAmountText] = useState('');

  useEffect(() => {
    if (isNew) {
      const defaultAccountId = accounts[0]?.id ?? '';
      store.initNew(defaultAccountId);
      setAmountText('');
    } else {
      store.load(id).catch((e) => {
        Alert.alert('Error', String(e));
        router.back();
      });
    }
  }, [id]);

  useEffect(() => {
    if (store.expense) {
      setAmountText(
        store.expense.amount > 0 ? centsToDisplay(store.expense.amount) : '',
      );
    }
  }, [store.expense?.id]);

  const split = useSplitCalculations(
    store.expense?.amount ?? 0,
    store.people,
    store.shares,
    store.shareMode,
  );

  const canSave =
    (store.expense?.amount ?? 0) > 0 &&
    store.expense?.accountId &&
    (!store.expense?.isSplit || split.isValid);

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const savedId = await store.save();
      if (store.expense) upsertLocal({ ...store.expense, id: savedId });
      router.back();
    } catch (e) {
      Alert.alert('Save failed', String(e));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!store.expense) return;
    Alert.alert('Delete Expense', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          await store.deleteExpense(store.expense!.id);
          useExpenseStore.getState().reload();
          router.back();
        },
      },
    ]);
  };

  const currency =
    accounts.find((a) => a.id === store.expense?.accountId)?.currency ?? 'USD';

  if (!store.expense) return null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isNew ? 'New Expense' : 'Edit Expense'}</Text>
        {!isNew ? (
          <TouchableOpacity onPress={handleDelete}>
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        ) : <View style={{ width: 56 }} />}
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Date */}
          <DatePicker
            value={store.expense.date}
            onChange={(d) => store.setField({ date: d })}
          />

          {/* Amount */}
          <View style={styles.amountRow}>
            <Text style={styles.currencySymbol}>{currency}</Text>
            <TextInput
              style={styles.amountInput}
              value={amountText}
              onChangeText={setAmountText}
              onBlur={() => {
                const cents = parseCents(amountText);
                store.setField({ amount: cents });
                setAmountText(cents > 0 ? centsToDisplay(cents) : '');
              }}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#D1D5DB"
            />
          </View>

          {/* Category */}
          <Text style={styles.sectionLabel}>Category</Text>
          <CategoryPicker
            value={store.expense.category as ExpenseCategory}
            onChange={(c) => store.setField({ category: c })}
          />

          {/* Account */}
          <View style={styles.field}>
            <AccountPicker
              accounts={accounts}
              selectedId={store.expense.accountId}
              onSelect={(id) => store.setField({ accountId: id })}
            />
          </View>

          {/* Description */}
          <View style={styles.field}>
            <TextInput
              label="Description (optional)"
              value={store.expense.description ?? ''}
              onChangeText={(t) => store.setField({ description: t || null })}
              placeholder="What was this for?"
              multiline
            />
          </View>

          {/* Split */}
          <View style={styles.divider} />
          <View style={styles.field}>
            <SplitToggle
              value={store.expense.isSplit}
              onChange={(v) => store.setField({ isSplit: v })}
            />
          </View>

          {store.expense.isSplit && (
            <View style={styles.splitSection}>
              <SegmentedControl
                options={[
                  { label: 'Percentage', value: 'percentage' },
                  { label: 'Fixed Amount', value: 'fixed' },
                ]}
                value={store.shareMode}
                onChange={store.setShareMode}
              />

              <View style={styles.peopleList}>
                {store.people.map((person) => {
                  const share = store.shares.find((s) => s.personId === person.id);
                  return (
                    <PersonRow
                      key={person.id}
                      person={person}
                      shareValue={share?.value ?? 0}
                      shareMode={store.shareMode}
                      onNameChange={(name) => {
                        // update person name in store
                        useActiveExpenseStore.setState((state) => ({
                          people: state.people.map((p) =>
                            p.id === person.id ? { ...p, name } : p,
                          ),
                          isDirty: true,
                        }));
                      }}
                      onShareBlur={(value) => store.updateShare(person.id, value)}
                      onRemove={() => store.removePerson(person.id)}
                    />
                  );
                })}
              </View>

              <TouchableOpacity
                style={styles.addPersonBtn}
                onPress={() => store.addPerson(`Person ${store.people.length + 1}`)}
                activeOpacity={0.7}
              >
                <Text style={styles.addPersonText}>+ Add Person</Text>
              </TouchableOpacity>

              <EqualSplitButton
                onPress={store.equalizeShares}
                disabled={store.people.length === 0}
              />

              {store.people.length > 0 && (
                <>
                  <ValidationBanner isValid={split.isValid} error={split.error} />
                  <SplitSummaryCard personOwes={split.personOwes} currency={currency} />
                </>
              )}
            </View>
          )}

          {/* Save */}
          <View style={styles.saveRow}>
            <Button
              title="Save Expense"
              onPress={handleSave}
              disabled={!canSave}
              loading={saving}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: { width: 56 },
  backText: { color: '#3B82F6', fontSize: 17 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  deleteText: { color: '#EF4444', fontSize: 15, fontWeight: '600' },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  currencySymbol: { fontSize: 24, color: '#9CA3AF', fontWeight: '600' },
  amountInput: {
    flex: 1,
    fontSize: 36,
    fontWeight: '700',
    color: '#111827',
    borderWidth: 0,
    padding: 0,
    margin: 0,
  },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: -8 },
  field: {},
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 4 },
  splitSection: { gap: 12 },
  peopleList: { gap: 8 },
  addPersonBtn: {
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  addPersonText: { color: '#3B82F6', fontWeight: '600', fontSize: 14 },
  saveRow: { marginTop: 8 },
});
