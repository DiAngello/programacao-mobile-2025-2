import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, ActivityIndicator, TouchableOpacity, SafeAreaView } from 'react-native'; 
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../../constants/colors';
import { Movie } from '../../types';
// [CORREÇÃO 1]: Importa 'getPopular' e remove 'getTopSearches'
import { searchMovies, getPopular } from '../../services/movieService'; 
import PosterCard from '../../components/posterCard';

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [topSearches, setTopSearches] = useState<Movie[]>([]);
  const [results, setResults] = useState<Movie[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  
  // O filtro por 'type' foi removido, pois o backend não o suporta.

  useEffect(() => {
    const loadTopSearches = async () => {
      // [CORREÇÃO 2]: Chama 'getPopular()'
      const movies = await getPopular(); 
      setTopSearches(movies);
      setInitialLoading(false);
    };
    loadTopSearches();
  }, []);

  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    // Debounce: espera 500ms após o usuário parar de digitar
    const handler = setTimeout(async () => {
      console.log(`[UI] Ativando busca para: "${query}"`);
      // [CORREÇÃO 3]: Chama 'searchMovies' apenas com a 'query'
      const movies = await searchMovies(query); 
      setResults(movies);
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(handler);
  }, [query]); // Remove 'searchType' das dependências

  const handleMoviePress = (movie: Movie) => {
    // O 'id' do TMDb (number) precisa ser string para a URL
    router.push(`/movieDetail?movieId=${movie.id.toString()}`);
  };

  const hasTyped = query.trim().length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
        <TextInput
          placeholder="Buscar por título..." // Placeholder simplificado
          placeholderTextColor={COLORS.textSecondary}
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {/* [CORREÇÃO 4]: Botões de filtro removidos */}
      
      {initialLoading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={hasTyped ? results : topSearches}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          renderItem={({ item }) => (
            <PosterCard movie={item} onPress={() => handleMoviePress(item)} />
          )}
          ListHeaderComponent={
            <Text style={styles.headerTitle}>
              {hasTyped ? 'Resultados' : 'Populares'}
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              {isSearching ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : hasTyped ? (
                <Text style={styles.messageText}>Nenhum resultado encontrado.</Text>
              ) : null}
            </View>
          }
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  searchBar: { backgroundColor: COLORS.surface, borderRadius: 5, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', marginHorizontal: 15, marginTop: 15 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, color: COLORS.textPrimary, fontSize: 16, height: 50 },
  headerTitle: { color: COLORS.textPrimary, fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  listContent: { paddingHorizontal: 15 },
  row: { justifyContent: 'space-between' },
  emptyContainer: { flex: 1, paddingTop: 50, alignItems: 'center' },
  messageText: { color: COLORS.textSecondary, textAlign: 'center', fontSize: 16 },
  // Estilos de filtro removidos
});