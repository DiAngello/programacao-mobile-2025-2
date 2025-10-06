import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { COLORS } from '../../constants/colors';
import { Movie } from '../../types';
import { getMoviesByCategory } from '../../services/movieService';
import PosterCard from '../../components/posterCard';

export default function CategoryResultsPage() {
  const router = useRouter();
  const { name } = useLocalSearchParams<{ name: string }>(); 
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (name) {
      const loadMovies = async () => {
        setLoading(true);
        const results = await getMoviesByCategory(name);
        setMovies(results);
        setLoading(false);
      };
      loadMovies();
    }
  }, [name]);

  const handleMoviePress = (movie: Movie) => {
    router.push(`/movieDetail?movieId=${movie.id}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: name }} />
      
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} />
      ) : (
        <FlatList
          data={movies}
          keyExtractor={(item) => item.id}
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
  listContent: { paddingHorizontal: 15, paddingTop: 20 },
  row: { justifyContent: 'space-between' },
  emptyText: { color: COLORS.textSecondary, textAlign: 'center', marginTop: 50, fontSize: 16 },
});