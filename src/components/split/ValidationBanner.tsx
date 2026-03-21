import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  isValid: boolean;
  error: string | null;
}

export function ValidationBanner({ isValid, error }: Props) {
  if (isValid) {
    return (
      <View style={[styles.banner, styles.valid]}>
        <Text style={styles.validText}>✓ 分摊金额正确</Text>
      </View>
    );
  }

  return (
    <View style={[styles.banner, styles.invalid]}>
      <Text style={styles.invalidText}>{error ?? '分摊金额有误'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  valid: { backgroundColor: '#D1FAE5' },
  invalid: { backgroundColor: '#FEF3C7' },
  validText: { color: '#065F46', fontWeight: '600', fontSize: 13 },
  invalidText: { color: '#92400E', fontWeight: '500', fontSize: 13 },
});
