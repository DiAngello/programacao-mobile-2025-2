import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, ScrollView, 
  ActivityIndicator, Alert, TouchableOpacity 
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router'; 
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { Movie } from '../../types';
import { getWatchedMovies, getWishlistMovies } from '../../services/movieService';
import * as authService from '../../services/authService';
import MovieRow from '../../components/movieRow';
import AppButton from '../../components/appButton';

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<authService.User | null>(null);
  const [watchedMovies, setWatchedMovies] = useState<Movie[]>([]);
  const [wishlistMovies, setWishlistMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        setLoading(true);
        const [storedUser, watched, wishlist] = await Promise.all([
          authService.getProfileFromStorage(),
          getWatchedMovies(),
          getWishlistMovies(),
        ]);
        setUser(storedUser);
        setWatchedMovies(watched);
        setWishlistMovies(wishlist);
        setLoading(false);
      };
      loadData();
    }, [])
  );

  const handleMoviePress = (movie: Movie) => {
     if (!movie.imdb_id) {
      Alert.alert("Erro", "Este filme está com dados incompletos e não pode ser aberto.");
      return;
    }
    router.push(`/movieDetail?imdbId=${movie.imdb_id}`);
  };

  const handleLogout = () => {
    authService.logout();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Perfil</Text>

        <View style={styles.profileInfoContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={60} color={COLORS.surface} />
          </View>
          <Text style={styles.userName}>{user?.username || 'Usuário'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'email@exemplo.com'}</Text>
          <View style={styles.buttonContainer}>
            <AppButton title="Editar Perfil" onPress={() => router.push('/editProfile')} />
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{watchedMovies.length.toString().padStart(2, '0')}</Text>
            <Text style={styles.statLabel}>Assistidos</Text>
          </View>
          <View style={styles.statSeparator} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{wishlistMovies.length.toString().padStart(2, '0')}</Text>
            <Text style={styles.statLabel}>Lista de Desejos</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }}/>
        ) : (
          <View style={styles.listsContainer}>
            <MovieRow 
              category={{ id: 'watched', title: 'Assistidos', movies: watchedMovies }} 
              onMoviePress={handleMoviePress} 
            />
            <MovieRow 
              category={{ id: 'wishlist', title: 'Minha Lista', movies: wishlistMovies }} 
              onMoviePress={handleMoviePress} 
            />
          </View>
        )}

        <View style={styles.logoutButton}>
          <TouchableOpacity style={styles.logoutTouchable} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color={COLORS.textSecondary} />
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 40 },
  headerTitle: { color: COLORS.textPrimary, fontSize: 28, fontWeight: 'bold', alignSelf: 'center', marginTop: 20, marginBottom: 20 },
  profileInfoContainer: { alignItems: 'center', paddingHorizontal: 20, marginBottom: 40 },
  avatar: { width: 120, height: 120, borderRadius: 60, backgroundColor: COLORS.textSecondary, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  userName: { color: COLORS.textPrimary, fontSize: 24, fontWeight: 'bold' },
  userEmail: { color: COLORS.textSecondary, fontSize: 16, marginTop: 5 },
  buttonContainer: { width: '90%', marginTop: 30 },
  statsContainer: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: 10, paddingVertical: 25, marginHorizontal: '5%', width: '90%', alignSelf: 'center' },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { color: COLORS.textPrimary, fontSize: 32, fontWeight: 'bold' },
  statLabel: { color: COLORS.textSecondary, fontSize: 14, marginTop: 5 },
  statSeparator: { width: 1, height: '100%', backgroundColor: COLORS.border },
  listsContainer: { marginTop: 20 },
  logoutButton: { marginTop: 40, alignItems: 'center' },
  logoutTouchable: { flexDirection: 'row', alignItems: 'center', padding: 10 },
  logoutText: { color: COLORS.textSecondary, fontSize: 16, marginLeft: 8, fontWeight: 'bold' },
});