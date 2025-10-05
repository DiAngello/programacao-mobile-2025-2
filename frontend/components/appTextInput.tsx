import React from 'react';
import { TextInput, StyleSheet, View, Text, TextInputProps } from 'react-native';
import { COLORS } from '../constants/colors';

interface AppTextInputProps extends TextInputProps {
  label: string;
}

const AppTextInput: React.FC<AppTextInputProps> = ({ label, ...props }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor={COLORS.textSecondary}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%', marginBottom: 20 },
  label: { color: COLORS.textSecondary, fontSize: 14, marginBottom: 8 },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});

export default AppTextInput;