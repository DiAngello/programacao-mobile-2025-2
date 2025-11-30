import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { COLORS } from '../../constants/colors';
import { Movie } from '../../types';
import { getMoviesByCategory, searchMoviesByCategory } from '../../services/movieService';
import PosterCard from '../../components/posterCard';

export default function CategoryResultsPage() {
  const router = useRouter();
  
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadMovies = async (query = '') => {
    setLoading(true);

    try {
      let results: Movie[] = [];

      if (query.trim().length > 0) {
        results = await searchMoviesByCategory(id!, query);
      } else {
        results = await getMoviesByCategory(id!);
      }

      setMovies(results);
    } catch (err) {
      console.error('Erro ao carregar filmes da categoria:', err);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadMovies();
  }, [id]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (id) loadMovies(searchQuery);
    }, 500); // debounce
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: name || 'Categoria' }} />
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar nesta categoria..."
        placeholderTextColor={COLORS.textSecondary}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.centered} />
      ) : (
        <FlatList
          data={movies}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          renderItem={({ item }) => (
            <PosterCard 
              movie={item} 
              onPress={() => {
                router.push({
                  pathname: '/movieDetail', 
                  params: { movieId: item.id } 
                });
              }} 
            />
          )}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhum filme encontrado.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchInput: { margin: 15, padding: 10, backgroundColor: COLORS.surface, borderRadius: 8, color: COLORS.textPrimary },
  listContent: { paddingHorizontal: 15, paddingTop: 20 },
  row: { justifyContent: 'space-between' },
  emptyText: { color: COLORS.textSecondary, textAlign: 'center', marginTop: 50 },
});
