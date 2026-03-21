import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface Props {
  onPress: () => void;
  disabled?: boolean;
}

export function EqualSplitButton({ onPress, disabled }: Props) {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, disabled && styles.disabledText]}>
        ⚖️ 平均分摊
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  disabled: { opacity: 0.4 },
  text: { color: '#1D4ED8', fontWeight: '600', fontSize: 14 },
  disabledText: { color: '#6B7280' },
});
