import React from 'react';
import { SafeAreaView, StyleSheet, ScrollView, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import AppTextInput from '../components/appTextInput';
import AppButton from '../components/appButton';

export default function EditProfilePage() {
  const router = useRouter();

  const handleSaveChanges = () => {
    console.log("Salvando alterações...");
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {}
        <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
                <Ionicons name="person" size={60} color={COLORS.surface} />
            </View>
        </View>

        <AppTextInput 
            label="Nome" 
            placeholder="Seu nome" 
            defaultValue="Andressa" 
        />
        <AppTextInput 
            label="Email" 
            placeholder="seuemail@exemplo.com" 
            keyboardType="email-address"
            defaultValue="andressa@email.com"
        />
        <AppTextInput 
            label="Nova Senha" 
            placeholder="Deixe em branco para não alterar" 
            secureTextEntry 
        />

        <View style={styles.buttonContainer}>
          <AppButton title="Salvar Alterações" onPress={handleSaveChanges} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.textSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    marginTop: 20,
  },
});