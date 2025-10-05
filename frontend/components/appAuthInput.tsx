import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { COLORS } from '../constants/colors';

interface AppAuthInputProps extends TextInputProps {
  label: string;
}

const AppAuthInput: React.FC<AppAuthInputProps> = ({ label, ...rest }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor={COLORS.textSecondary}
        {...rest}
      />
      <View style={styles.underline} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 25, 
    width: '100%',
  },
  label: {
    color: COLORS.textPrimary,
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  input: {
    color: COLORS.textPrimary,
    fontSize: 18,
    paddingVertical: 10,
  },
  underline: {
    height: 1,
    backgroundColor: COLORS.textSecondary,
    marginTop: -2, 
  },
});

export default AppAuthInput;
