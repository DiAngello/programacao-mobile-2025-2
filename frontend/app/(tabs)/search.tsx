  import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native'; 
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../../constants/colors';
import { Movie } from '../../types';
import { searchMovies, getTopSearches } from '../../services/movieService';
import PosterCard from '../../components/posterCard';

type SearchType = 'title' | 'actor' | 'director';

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [topSearches, setTopSearches] = useState<Movie[]>([]);
  const [results, setResults] = useState<Movie[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchType, setSearchType] = useState<SearchType>('title'); 

  useEffect(() => {
    const loadTopSearches = async () => {
      const movies = await getTopSearches();
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
    const handler = setTimeout(async () => {
      console.log(`[UI] Ativando busca para: "${query}"`);
      const movies = await searchMovies(query, searchType);
      setResults(movies);
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(handler);
  }, [query, searchType]); 

  const handleMoviePress = (movie: Movie) => {
    router.push(`/movieDetail?movieId=${movie.id}`);
  };

  const hasTyped = query.trim().length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
        <TextInput
          placeholder={`Buscar por ${searchType === 'title' ? 'título' : searchType === 'actor' ? 'ator' : 'diretor'}`}
          placeholderTextColor={COLORS.textSecondary}
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {/* Botões de Filtro */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
            style={[styles.filterButton, searchType === 'title' && styles.activeFilter]} 
            onPress={() => setSearchType('title')}>
            <Text style={styles.filterText}>Título</Text>
        </TouchableOpacity>
        <TouchableOpacity 
            style={[styles.filterButton, searchType === 'actor' && styles.activeFilter]} 
            onPress={() => setSearchType('actor')}>
            <Text style={styles.filterText}>Ator</Text>
        </TouchableOpacity>
        <TouchableOpacity 
            style={[styles.filterButton, searchType === 'director' && styles.activeFilter]} 
            onPress={() => setSearchType('director')}>
            <Text style={styles.filterText}>Diretor</Text>
        </TouchableOpacity>
      </View>

      {initialLoading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={hasTyped ? results : topSearches}
          keyExtractor={(item) => item.id}
          numColumns={3}
          renderItem={({ item }) => (
            <PosterCard movie={item} onPress={() => handleMoviePress(item)} />
          )}
          ListHeaderComponent={
            <Text style={styles.headerTitle}>
              {hasTyped ? 'Resultados' : 'Principais Buscas'}
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
  filterContainer: { flexDirection: 'row', justifyContent: 'center', marginVertical: 15, gap: 10 },
  filterButton: { backgroundColor: COLORS.surface, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  activeFilter: { backgroundColor: COLORS.primary },
  filterText: { color: COLORS.textPrimary, fontWeight: 'bold' },
  headerTitle: { color: COLORS.textPrimary, fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  listContent: { paddingHorizontal: 15 },
  row: { justifyContent: 'space-between' },
  emptyContainer: { flex: 1, paddingTop: 50, alignItems: 'center' },
  messageText: { color: COLORS.textSecondary, textAlign: 'center', fontSize: 16 },
});