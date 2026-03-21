import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';

interface Props {
  value: boolean;
  onChange: (v: boolean) => void;
}

export function SplitToggle({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      <View>
        <Text style={styles.label}>分账</Text>
        <Text style={styles.sub}>将这笔支出分摊给多人</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: '#E5E7EB', true: '#BFDBFE' }}
        thumbColor={value ? '#3B82F6' : '#9CA3AF'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  label: { fontSize: 16, fontWeight: '600', color: '#111827' },
  sub: { fontSize: 13, color: '#6B7280', marginTop: 2 },
});
