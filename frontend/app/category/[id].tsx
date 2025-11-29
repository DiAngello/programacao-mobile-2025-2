import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { COLORS } from '../../constants/colors';
import { Movie } from '../../types';
import { getMoviesByCategory } from '../../services/movieService';
import PosterCard from '../../components/posterCard';

export default function CategoryResultsPage() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams<{ id: string, name: string }>(); 
  
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carrega se o ID (da rota) estiver presente
    if (id) {
      const loadMovies = async () => {
        setLoading(true);
        const results = await getMoviesByCategory(id);
        setMovies(results);
        setLoading(false);
      };
      loadMovies();
    }
  }, [id]);

  const handleMoviePress = (movie: Movie) => {
    // A API do TMDb retorna 'id' (TMDb ID)
    router.push(`/movieDetail?movieId=${movie.id}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Usa o 'name' (da query) para o título */}
      <Stack.Screen options={{ title: name || 'Categoria' }} /> 
      
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.centered} />
      ) : (
        <FlatList
          data={movies}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          renderItem={({ item }) => (
            <PosterCard movie={item} onPress={() => handleMoviePress(item)} />
          )}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhum filme encontrado nesta categoria.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingHorizontal: 15, paddingTop: 20 },
  row: { justifyContent: 'space-between' },
  emptyText: { color: COLORS.textSecondary, textAlign: 'center', marginTop: 50, fontSize: 16 },
});