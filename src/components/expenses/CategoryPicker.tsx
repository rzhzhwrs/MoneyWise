import React from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import type { ExpenseCategory } from '../../types';

const CATEGORIES: { value: ExpenseCategory; label: string; emoji: string }[] = [
  { value: 'food',          label: '餐饮',     emoji: '🍜' },
  { value: 'transport',     label: '交通',     emoji: '🚇' },
  { value: 'accommodation', label: '住宿',     emoji: '🏨' },
  { value: 'entertainment', label: '娱乐',     emoji: '🎬' },
  { value: 'shopping',      label: '购物',     emoji: '🛍️' },
  { value: 'health',        label: '医疗',     emoji: '💊' },
  { value: 'utilities',     label: '生活缴费', emoji: '💡' },
  { value: 'other',         label: '其他',     emoji: '📌' },
];

interface Props {
  value: ExpenseCategory;
  onChange: (value: ExpenseCategory) => void;
}

export function CategoryPicker({ value, onChange }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {CATEGORIES.map((cat) => {
        const active = cat.value === value;
        return (
          <TouchableOpacity
            key={cat.value}
            style={[styles.chip, active && styles.activeChip]}
            onPress={() => onChange(cat.value)}
            activeOpacity={0.7}
          >
            <Text style={styles.emoji}>{cat.emoji}</Text>
            <Text style={[styles.label, active && styles.activeLabel]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: 16, gap: 8, paddingVertical: 4 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeChip: { backgroundColor: '#DBEAFE', borderColor: '#3B82F6' },
  emoji: { fontSize: 16 },
  label: { fontSize: 13, fontWeight: '500', color: '#374151' },
  activeLabel: { color: '#1D4ED8', fontWeight: '600' },
});
