import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { formatDisplayDate, todayString } from '../../utils/date';

interface Props {
  value: string; // "YYYY-MM-DD"
  onChange: (date: string) => void;
}

export function DatePicker({ value, onChange }: Props) {
  const isToday = value === todayString();

  const shift = (days: number) => {
    const d = new Date(value + 'T00:00:00');
    d.setDate(d.getDate() + days);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    onChange(`${y}-${m}-${day}`);
  };

  return (
    <View style={styles.row}>
      <TouchableOpacity style={styles.arrow} onPress={() => shift(-1)}>
        <Text style={styles.arrowText}>‹</Text>
      </TouchableOpacity>
      <View style={styles.center}>
        <Text style={styles.date}>{formatDisplayDate(value)}</Text>
        {isToday ? <Text style={styles.today}>今天</Text> : null}
      </View>
      <TouchableOpacity style={styles.arrow} onPress={() => shift(1)} disabled={isToday}>
        <Text style={[styles.arrowText, isToday && styles.disabled]}>›</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    overflow: 'hidden',
  },
  arrow: { paddingHorizontal: 16, paddingVertical: 12 },
  arrowText: { fontSize: 24, color: '#3B82F6', fontWeight: '600' },
  disabled: { color: '#D1D5DB' },
  center: { flex: 1, alignItems: 'center' },
  date: { fontSize: 15, fontWeight: '600', color: '#111827' },
  today: { fontSize: 11, color: '#6B7280', marginTop: 1 },
});
