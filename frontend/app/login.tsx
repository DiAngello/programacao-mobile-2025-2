import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import AppAuthInput from '../components/appAuthInput'; 
import AppButton from '../components/appButton';       

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    console.log('Tentando login com:', email, password);
    router.replace('/home'); 
  };

  const handleForgotPassword = () => {
    router.push('/forgotPassword'); 
  };

  const handleGoogleLogin = () => {
    console.log('Login com Google');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.welcomeText}>Seja bem vindo!</Text>
        <Text style={styles.subtitleText}>Efetue seu login</Text>

        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
          <Ionicons name="logo-google" size={24} color={COLORS.textPrimary} style={styles.googleIcon} />
        </TouchableOpacity>

        <View style={styles.formContainer}>
          <AppAuthInput
            label="Email ou usuário"
            placeholder="Seu email ou usuário"
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

        <AppButton title="Acessar" onPress={handleLogin} />

        <TouchableOpacity onPress={handleForgotPassword}>
          <Text style={styles.forgotPasswordText}>Esqueceu sua senha?</Text>
          <Text style={styles.forgotPasswordLink}>Clique aqui</Text>
        </TouchableOpacity>

        <View style={styles.bottomLinkContainer}>
          <Text style={styles.bottomText}>Não tem conta?</Text>
          <TouchableOpacity onPress={() => router.push('/signup')}>
            <Text style={styles.bottomLink}> Faça seu cadastro</Text>
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
  googleIcon: { color: COLORS.textPrimary }, 
  formContainer: { width: '100%', marginBottom: 30 },
  forgotPasswordText: { color: COLORS.textSecondary, fontSize: 16, marginTop: 30, textAlign: 'center' },
  forgotPasswordLink: { color: COLORS.primary, fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginTop: 5 },
  bottomLinkContainer: { flexDirection: 'row', marginTop: 'auto', marginBottom: 20 },
  bottomText: { color: COLORS.textSecondary, fontSize: 16 },
  bottomLink: { color: COLORS.primary, fontSize: 16, fontWeight: 'bold' },
});
