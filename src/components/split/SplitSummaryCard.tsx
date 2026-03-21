import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { PersonOwes } from '../../types';
import { formatCurrency } from '../../utils/currency';

interface Props {
  personOwes: PersonOwes[];
  currency: string;
}

export function SplitSummaryCard({ personOwes, currency }: Props) {
  if (personOwes.length === 0) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Split Summary</Text>
      {personOwes.map((po) => (
        <View key={po.personId} style={styles.row}>
          <Text style={styles.name}>{po.personName}</Text>
          <Text style={styles.amount}>
            {formatCurrency(po.amount, currency)}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F0F9FF',
    borderRadius: 10,
    padding: 14,
    gap: 8,
  },
  title: { fontSize: 13, fontWeight: '600', color: '#0369A1', marginBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 15, color: '#0C4A6E' },
  amount: { fontSize: 15, fontWeight: '700', color: '#0C4A6E' },
});
