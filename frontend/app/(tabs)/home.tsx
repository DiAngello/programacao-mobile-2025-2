import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, ActivityIndicator, ImageBackground, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/colors';
import { Movie, Category } from '../../types';
import { getHomeData } from '../../services/movieService';
import MovieRow from '../../components/movieRow';

export default function HomePage() {
  const router = useRouter();
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await getHomeData();
      setFeaturedMovie(data.featured);
      setCategories(data.categories);
      setLoading(false);
    };
    loadData();
  }, []); 

    const handleMoviePress = (movie: Movie) => {
  if (movie.tmdb_id) {
    router.push(`/movieDetail?movieId=${movie.tmdb_id}`);
    return;
  }
  if (movie.imdb_id) {
    router.push(`/movieDetail?imdbId=${movie.imdb_id}`);
    return;
  }
  if (movie.id) {
    router.push(`/movieDetail?movieId=${movie.id}`);
    return;
  }
  Alert.alert('Erro', 'Não foi possível localizar o filme.');
};


  const renderHeroHeader = () => {
    if (!featuredMovie) return null;

    // A API do TMDb usa 'poster_path' e 'overview'
    return (
      <View style={styles.heroContainer}>
        <ImageBackground 
          source={{ uri: `https://image.tmdb.org/t/p/w500${featuredMovie.poster_path}` }} 
          style={styles.heroImage}
        >
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)', COLORS.background]} style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>{featuredMovie.title}</Text>
            {featuredMovie.overview && <Text style={styles.heroSynopsis} numberOfLines={2}>{featuredMovie.overview}</Text>}
            <View style={styles.heroButtonRow}>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => handleMoviePress(featuredMovie)}>
                <Ionicons name="information-circle-outline" size={20} color={COLORS.textPrimary} />
                <Text style={styles.secondaryButtonText}>Saiba mais</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </ImageBackground>
      </View>
    );
  };
  
  if (loading) {
    return <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center' }} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MovieRow category={item} onMoviePress={handleMoviePress} />
        )}
        ListHeaderComponent={renderHeroHeader}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  heroContainer: { height: 450, marginBottom: 20 },
  heroImage: { width: '100%', height: '100%', justifyContent: 'flex-end' },
  heroOverlay: { width: '100%', height: '60%', justifyContent: 'flex-end', padding: 20 },
  heroTitle: { color: COLORS.textPrimary, fontSize: 36, fontWeight: 'bold' },
  heroSynopsis: { color: COLORS.textSecondary, fontSize: 14, marginVertical: 10, width: '80%' },
  heroButtonRow: { flexDirection: 'row', marginTop: 10 },
  primaryButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.textPrimary, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5 },
  primaryButtonText: { color: COLORS.background, fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  secondaryButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(139, 148, 158, 0.4)', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5, marginLeft: 15 },
  secondaryButtonText: { color: COLORS.textPrimary, fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
});