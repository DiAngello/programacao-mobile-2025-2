import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator 
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import AppAuthInput from '../components/appAuthInput';
import AppButton from '../components/appButton';
import * as authService from '../services/authService';

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    setLoading(true);
    setError(null);

    if (!name || !email || !password) {
      setError('Todos os campos são obrigatórios.');
      setLoading(false);
      return;
    }

    try {
   
      await authService.register(name, email, password);
      router.replace('/login');

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        console.error('Falha no cadastro:', err.message);
      } else {
        setError('Um erro desconhecido ocorreu.');
      }
    } finally {
      setLoading(false);
    }
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
            editable={!loading}
          />
          <AppAuthInput
            label="Email"
            placeholder="Seu email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            editable={!loading}
          />
          <AppAuthInput
            label="Senha"
            placeholder="Sua senha"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />
        </View>

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loading} />
        ) : (
          <AppButton title="Avançar" onPress={handleRegister} />
        )}

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
  errorText: {
    color: 'red', 
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center'
  },
  loading: {
    padding: 20
  }
});