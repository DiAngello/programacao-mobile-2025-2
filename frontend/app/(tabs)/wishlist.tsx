import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, Image, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { Movie } from '../../types';
import { getWishlistMovies } from '../../services/movieService';

export default function WishlistPage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [originalMovies, setOriginalMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const loadWishlist = async () => {
      setLoading(true);
      const movies = await getWishlistMovies();
      setOriginalMovies(movies);
      setFilteredMovies(movies);
      setLoading(false);
    };
    loadWishlist();
  }, []);

  useEffect(() => {
    if (searchText === '') {
      setFilteredMovies(originalMovies);
    } else {
      const filtered = originalMovies.filter(movie =>
        movie.title.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredMovies(filtered);
    }
  }, [searchText, originalMovies]);

  const handleRemove = (movieId: string) => {
    console.log(`Remover filme ${movieId} da lista de desejos.`);
  };

  const handleMoviePress = (movie: Movie) => {
    router.push(`/movieDetail?movieId=${movie.id}`);
  };

  const renderItem = ({ item }: { item: Movie }) => (
    <TouchableOpacity onPress={() => handleMoviePress(item)} style={styles.movieItem}>
      <Image source={{ uri: item.poster }} style={styles.poster} />
      <View style={styles.details}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" color={COLORS.accent} size={16} />
          <Text style={styles.rating}>Nota: {item.rating}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => handleRemove(item.id)} style={styles.deleteButton}>
        <Ionicons name="trash-outline" size={24} color={COLORS.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lista de Desejos</Text>
      </View>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
        <TextInput
          placeholder="Pesquisar na sua lista de desejos..."
          placeholderTextColor={COLORS.textSecondary}
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredMovies}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {searchText ? 'Nenhum filme encontrado.' : 'Sua lista de desejos está vazia.'}
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  headerTitle: { color: COLORS.textPrimary, fontSize: 28, fontWeight: 'bold', alignSelf: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 10, marginHorizontal: 20, marginBottom: 20, paddingHorizontal: 15 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 50, color: COLORS.textPrimary, fontSize: 16 },
  listContent: { paddingHorizontal: 20 },
  movieItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, backgroundColor: COLORS.surface, borderRadius: 10, padding: 10 },
  poster: { width: 80, height: 120, borderRadius: 8 },
  details: { flex: 1, marginLeft: 15, alignSelf: 'center' },
  title: { color: COLORS.textPrimary, fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center' },
  rating: { color: COLORS.textSecondary, fontSize: 14, marginLeft: 5 },
  deleteButton: { padding: 10 },
  emptyText: { color: COLORS.textSecondary, textAlign: 'center', marginTop: 50, fontSize: 16, paddingHorizontal: 20 },
});
