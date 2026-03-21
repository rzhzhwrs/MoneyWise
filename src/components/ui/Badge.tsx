import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type BadgeVariant = 'blue' | 'green' | 'amber' | 'red' | 'gray';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const COLORS: Record<BadgeVariant, { bg: string; text: string }> = {
  blue:  { bg: '#DBEAFE', text: '#1D4ED8' },
  green: { bg: '#D1FAE5', text: '#065F46' },
  amber: { bg: '#FEF3C7', text: '#92400E' },
  red:   { bg: '#FEE2E2', text: '#991B1B' },
  gray:  { bg: '#F3F4F6', text: '#374151' },
};

export function Badge({ label, variant = 'blue' }: BadgeProps) {
  const { bg, text } = COLORS[variant];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 12, fontWeight: '600' },
});
