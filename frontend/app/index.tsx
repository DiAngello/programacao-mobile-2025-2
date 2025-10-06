import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <Ionicons name="film-outline" size={80} color={COLORS.primary} />
      <Text style={styles.title}>Bem-vindo ao Filmoteca!</Text>
      <Text style={styles.subtitle}>Sua coleção de filmes, organizada.</Text>
      <Link href="/login" asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Começar</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background, padding: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: COLORS.textPrimary, marginTop: 24, textAlign: 'center' },
  subtitle: { fontSize: 16, color: COLORS.textSecondary, textAlign: 'center', marginTop: 8, marginBottom: 40 },
  button: { backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 30, width: '100%', alignItems: 'center' },
  buttonText: { color: COLORS.textPrimary, fontSize: 18, fontWeight: 'bold' },
});