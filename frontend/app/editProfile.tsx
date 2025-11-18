import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, ScrollView, View, Text, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import AppTextInput from '../components/appTextInput';
import AppButton from '../components/appButton';
// Importa o serviço de autenticação
import * as authService from '../services/authService';

export default function EditProfilePage() {
  const router = useRouter();

  // Estados para o formulário
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Apenas para nova senha
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Carrega os dados do usuário ao abrir a tela
  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      const user = await authService.getProfileFromStorage();
      if (user) {
        setUsername(user.username);
        setEmail(user.email);
      }
      setLoading(false);
    };
    loadUserData();
  }, []);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      // Chama a API para atualizar o perfil
      // A API ignora a senha se for nula ou vazia
      await authService.updateProfile(username, email, password || undefined);
      
      Alert.alert("Sucesso", "Seu perfil foi atualizado.");
      router.back(); // Volta para a tela de perfil

    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Erro", error.message);
      } else {
        Alert.alert("Erro", "Não foi possível salvar as alterações.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
     return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
                <Ionicons name="person" size={60} color={COLORS.surface} />
            </View>
        </View>

        <AppTextInput 
            label="Nome" 
            placeholder="Seu nome" 
            value={username}
            onChangeText={setUsername}
            editable={!isSaving}
        />
        <AppTextInput 
            label="Email" 
            placeholder="seuemail@exemplo.com" 
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            editable={!isSaving}
        />
        <AppTextInput 
            label="Nova Senha" 
            placeholder="Deixe em branco para não alterar" 
            secureTextEntry 
            value={password}
            onChangeText={setPassword}
            editable={!isSaving}
        />

        <View style={styles.buttonContainer}>
          <AppButton 
            title={isSaving ? "Salvando..." : "Salvar Alterações"} 
            onPress={handleSaveChanges}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20 },
  avatarContainer: { alignItems: 'center', marginBottom: 30 },
  avatar: { width: 120, height: 120, borderRadius: 60, backgroundColor: COLORS.textSecondary, justifyContent: 'center', alignItems: 'center' },
  buttonContainer: { marginTop: 20 },
});