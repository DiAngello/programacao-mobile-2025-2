import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import AppAuthInput from '../components/appAuthInput';
import AppButton from '../components/appButton';

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = () => {
    console.log('Tentando cadastrar com:', name, email, password);
    alert('Cadastro realizado com sucesso! Faça seu login.');
    router.replace('/login');
  };

  const handleGoogleRegister = () => {
    console.log('Cadastro com Google');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.welcomeText}>Seja bem vindo!</Text>
        <Text style={styles.subtitleText}>Crie sua conta</Text>

        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleRegister}>
          <Ionicons name="logo-google" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <View style={styles.formContainer}>
          <AppAuthInput
            label="Nome"
            placeholder="Seu nome completo"
            autoCapitalize="words"
            value={name}
            onChangeText={setName}
          />
          <AppAuthInput
            label="Email"
            placeholder="Seu email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <AppAuthInput
            label="Senha"
            placeholder="Sua senha"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <AppButton title="Avançar" onPress={handleRegister} />

        <View style={styles.bottomLinkContainer}>
          <Text style={styles.bottomText}>Já tem conta?</Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={styles.bottomLink}> Faça seu login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  welcomeText: { color: COLORS.textPrimary, fontSize: 32, fontWeight: 'bold', marginBottom: 5 },
  subtitleText: { color: COLORS.textSecondary, fontSize: 20, marginBottom: 40 },
  googleButton: { backgroundColor: COLORS.surface, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
  formContainer: { width: '100%', marginBottom: 30 },
  bottomLinkContainer: { flexDirection: 'row', marginTop: 'auto', paddingTop: 20, marginBottom: 20 },
  bottomText: { color: COLORS.textSecondary, fontSize: 16 },
  bottomLink: { color: COLORS.primary, fontSize: 16, fontWeight: 'bold' },
});