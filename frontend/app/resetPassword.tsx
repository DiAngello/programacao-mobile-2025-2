import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import AppAuthInput from '../components/appAuthInput';
import AppButton from '../components/appButton';
import { resetPassword } from '../services/authService';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token: paramToken } = useLocalSearchParams();
  
  const initialToken = Array.isArray(paramToken) ? paramToken[0] : paramToken;
  
  const [token, setToken] = useState(initialToken ? String(initialToken) : '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!token.trim()) {
      Alert.alert('Erro', 'Link inválido (Token ausente). Tente clicar no link do email novamente.');
      return;
    }

    if (!newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Erro', 'A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, newPassword);
      
      Alert.alert(
        'Sucesso',
        'Sua senha foi redefinida com sucesso! Faça login com a nova senha.',
        [{ 
          text: 'Ir para Login', 
          onPress: () => {
            router.replace('/login');
          } 
        }]
      );
    } catch (error: any) {
      console.error('Erro ao redefinir senha:', error);
      const msg = error.response?.data?.error || 'Não foi possível redefinir a senha. Verifique o token e tente novamente.';
      Alert.alert('Erro', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: '', 
          headerLeft: () => ( 
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
              <Ionicons name="arrow-back" size={28} color={COLORS.textPrimary} />
            </TouchableOpacity>
          ),
          headerStyle: { backgroundColor: COLORS.background },
          headerShadowVisible: false,
        }}
      />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.iconContainer}>
          <Ionicons name="key-outline" size={80} color={COLORS.primary} />
        </View>

        <Text style={styles.welcomeText}>Criar Nova Senha</Text>

        <View style={styles.formContainer}>
          <AppAuthInput
            label="Nova Senha"
            placeholder="Mínimo 6 caracteres"
            secureTextEntry
            autoCapitalize="none"
            value={newPassword}
            onChangeText={setNewPassword}
          />

          <AppAuthInput
            label="Confirmar Nova Senha"
            placeholder="Repita a senha"
            secureTextEntry
            autoCapitalize="none"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: 20 }} />
        ) : (
          <AppButton title="Alterar Senha" onPress={handleReset} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flexGrow: 1, alignItems: 'center', padding: 30, paddingTop: 10 },
  iconContainer: { marginBottom: 20 },
  welcomeText: { color: COLORS.textPrimary, fontSize: 28, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  subtitleText: { color: COLORS.textSecondary, fontSize: 16, marginBottom: 30, textAlign: 'center' },
  formContainer: { width: '100%', marginBottom: 30 },
});