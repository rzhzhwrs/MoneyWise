import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import type { Person, ShareMode } from '../../types';

interface Props {
  person: Person;
  shareValue: number;
  shareMode: ShareMode;
  onNameChange: (name: string) => void;
  onShareBlur: (value: number) => void;
  onRemove: () => void;
}

export function PersonRow({
  person,
  shareValue,
  shareMode,
  onNameChange,
  onShareBlur,
  onRemove,
}: Props) {
  const [draft, setDraft] = useState(
    shareMode === 'percentage'
      ? shareValue.toString()
      : (shareValue / 100).toFixed(2),
  );

  const handleBlur = () => {
    const n = parseFloat(draft);
    if (!isNaN(n)) {
      onShareBlur(shareMode === 'percentage' ? n : Math.round(n * 100));
    }
  };

  return (
    <View style={styles.row}>
      <TouchableOpacity onPress={onRemove} style={styles.remove}>
        <Text style={styles.removeText}>−</Text>
      </TouchableOpacity>
      <TextInput
        style={styles.nameInput}
        value={person.name}
        onChangeText={onNameChange}
        placeholder="Name"
        placeholderTextColor="#9CA3AF"
      />
      <View style={styles.shareRow}>
        <TextInput
          style={styles.shareInput}
          value={draft}
          onChangeText={setDraft}
          onBlur={handleBlur}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor="#9CA3AF"
        />
        <Text style={styles.shareUnit}>
          {shareMode === 'percentage' ? '%' : ''}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  remove: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center',
  },
  removeText: { color: '#DC2626', fontSize: 18, lineHeight: 20 },
  nameInput: {
    flex: 1,
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 8,
    fontSize: 15, color: '#111827', backgroundColor: '#fff',
  },
  shareRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  shareInput: {
    width: 72,
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 8,
    fontSize: 15, color: '#111827', backgroundColor: '#fff',
    textAlign: 'right',
  },
  shareUnit: { fontSize: 14, color: '#6B7280', width: 14 },
});
