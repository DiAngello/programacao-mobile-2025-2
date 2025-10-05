import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/colors';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
}

const AppButton: React.FC<AppButtonProps> = ({ title, onPress, loading }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} disabled={loading}>
      {loading ? <ActivityIndicator color={COLORS.textPrimary} /> : <Text style={styles.text}>{title}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    width: '100%',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  text: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AppButton;