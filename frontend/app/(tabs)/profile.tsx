import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import AppButton from '../../components/appButton';

export default function ProfilePage() {
  const router = useRouter();

  const user = {
    name: 'Usuário',
    email: 'user@email.com',
    watchedCount: 2,
    wishlistCount:  2,
  };

  const handleEditProfile = () => {
    router.push('/editProfile');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Perfil</Text>

      <View style={styles.profileInfoContainer}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={60} color={COLORS.surface} />
        </View>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        <View style={styles.buttonContainer}>
          <AppButton title="Editar Perfil" onPress={handleEditProfile} />
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user.watchedCount.toString().padStart(2, '0')}</Text>
          <Text style={styles.statLabel}>Assistidos</Text>
        </View>
        <View style={styles.statSeparator} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user.wishlistCount.toString().padStart(2, '0')}</Text>
          <Text style={styles.statLabel}>Lista de Desejos</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center', 
    padding: 20,
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 20,
  },
  profileInfoContainer: {
    alignItems: 'center',
    marginBottom: 40,
    width: '100%', 
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.textSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  userName: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  userEmail: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginTop: 5,
  },
  buttonContainer: {
    width: '90%', 
    marginTop: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    paddingVertical: 25,
    paddingHorizontal: 20,
    width: '90%',
    alignSelf: 'center',
  },
  statItem: {
     flex: 1, 
    alignItems: 'center',
  },
  statNumber: {
    color: COLORS.textPrimary,
    fontSize: 32,
    fontWeight: 'bold',
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 5,
  },
  statSeparator: {
    width: 1,
    height: '100%',
    backgroundColor: COLORS.border,
  },
});