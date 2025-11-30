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
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import AppAuthInput from '../components/appAuthInput';
import AppButton from '../components/appButton';
// Importe a função do serviço que criamos acima
import { forgotPassword } from '../services/authService';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Erro', 'Por favor, informe seu email.');
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email);
      
      Alert.alert(
        'Email Enviado',
        'Se o email estiver cadastrado em nossa base, você receberá um link com as instruções para redefinir sua senha.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Erro ao solicitar redefinição:', error);
      // Por segurança, geralmente mostramos a mesma mensagem de sucesso ou um erro genérico
      Alert.alert('Atenção', 'Ocorreu um erro ao processar sua solicitação. Verifique sua conexão e tente novamente.');
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
          headerShadowVisible: false, // Remove a linha/sombra do header para ficar mais clean
        }}
      />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.iconContainer}>
          <Ionicons name="lock-open-outline" size={80} color={COLORS.primary} />
        </View>

        <Text style={styles.welcomeText}>Redefinir Senha</Text>
        <Text style={styles.subtitleText}>Informe o email associado à sua conta e enviaremos um link de recuperação.</Text>

        <View style={styles.formContainer}>
          <AppAuthInput
            label="Email"
            placeholder="exemplo@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: 20 }} />
        ) : (
          <AppButton title="Enviar Link de Recuperação" onPress={handleResetPassword} />
        )}

        <TouchableOpacity onPress={() => router.back()} style={styles.bottomLinkContainer}>
          <Text style={styles.bottomLink}>Lembrei minha senha, voltar para o login</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flexGrow: 1, alignItems: 'center', padding: 30, paddingTop: 10 },
  iconContainer: { marginBottom: 20 },
  welcomeText: { color: COLORS.textPrimary, fontSize: 28, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  subtitleText: { color: COLORS.textSecondary, fontSize: 16, marginBottom: 40, textAlign: 'center', lineHeight: 22 },
  formContainer: { width: '100%', marginBottom: 30 },
  bottomLinkContainer: { marginTop: 'auto', marginBottom: 20, paddingTop: 20 },
  bottomLink: { color: COLORS.primary, fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
});