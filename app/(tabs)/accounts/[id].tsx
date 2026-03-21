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
  { label: '现金',   value: 'cash'   },
  { label: '借记卡', value: 'debit'  },
  { label: '信用卡', value: 'credit' },
  { label: '其他',   value: 'other'  },
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
    if (!name.trim()) { setNameError('请输入账户名称'); return; }
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
      Alert.alert('保存失败', String(e));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!existing) return;
    Alert.alert('删除账户', '此操作无法撤销。', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除', style: 'destructive',
        onPress: async () => {
          try {
            await remove(existing.id);
            router.back();
          } catch (e) {
            Alert.alert('无法删除', String(e));
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ 返回</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isNew ? '新建账户' : '编辑账户'}</Text>
        {!isNew ? (
          <TouchableOpacity onPress={handleDelete}>
            <Text style={styles.deleteText}>删除</Text>
          </TouchableOpacity>
        ) : <View style={{ width: 56 }} />}
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TextInput
            label="账户名称"
            value={name}
            onChangeText={setName}
            placeholder="如：现金、招行储蓄卡"
            error={nameError}
          />

          <View>
            <Text style={styles.label}>账户类型</Text>
            <SegmentedControl
              options={ACCOUNT_TYPES}
              value={type}
              onChange={setType}
            />
          </View>

          <TextInput
            label="当前余额"
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
              label="信用额度（可选）"
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
            label="货币（ISO 4217）"
            value={currency}
            onChangeText={setCurrency}
            placeholder="CNY"
            autoCapitalize="characters"
            maxLength={3}
          />

          <Button title="保存账户" onPress={handleSave} loading={saving} />
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
