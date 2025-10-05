import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import AppAuthInput from '../components/appAuthInput';
import AppButton from '../components/appButton';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const handleResetPassword = () => {
    console.log('Solicitando redefinição de senha para:', email);
    alert('Se o email estiver cadastrado, você receberá um link de redefinição.');
    router.back(); 
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
        }}
      />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.welcomeText}>Redefinir Senha</Text>
        <Text style={styles.subtitleText}>Informe seu email para redefinir a senha</Text>

        <View style={styles.formContainer}>
          <AppAuthInput
            label="Email"
            placeholder="Seu email cadastrado"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <AppButton title="Redefinir Senha" onPress={handleResetPassword} />

        <TouchableOpacity onPress={() => router.back()} style={styles.bottomLinkContainer}>
          <Text style={styles.bottomLink}>Lembrei minha senha, voltar para o login</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  welcomeText: { color: COLORS.textPrimary, fontSize: 32, fontWeight: 'bold', marginBottom: 5 },
  subtitleText: { color: COLORS.textSecondary, fontSize: 20, marginBottom: 40, textAlign: 'center' },
  formContainer: { width: '100%', marginBottom: 30 },
  bottomLinkContainer: { marginTop: 'auto', marginBottom: 20 },
  bottomLink: { color: COLORS.primary, fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
});