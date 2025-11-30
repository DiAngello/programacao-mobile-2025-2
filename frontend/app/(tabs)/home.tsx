import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, ActivityIndicator, ImageBackground, TouchableOpacity, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/colors';
import { Movie, Category } from '../../types';
import { getHomeData, getMovieTMDbDetails } from '../../services/movieService';
import MovieRow from '../../components/movieRow';
import { useFocusEffect } from '@react-navigation/native';


export default function HomePage() {
  const router = useRouter();
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        setLoading(true);
        const data = await getHomeData();
        setFeaturedMovie(data.featured);
        setCategories(data.categories);
        setLoading(false);
      };

      loadData();
    }, [])
  );

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

  const openHeroTrailer = async () => {
    if (!featuredMovie) return;

    let url = (featuredMovie as any).trailer_url;

    if (!url && (featuredMovie.id || featuredMovie.tmdb_id)) {
      try {
        const id = featuredMovie.id || featuredMovie.tmdb_id;
        const details = await getMovieTMDbDetails(String(id));
        
        if (details?.trailer_url) {
          url = details.trailer_url;
          setFeaturedMovie(prev => prev ? ({ ...prev, trailer_url: url } as any) : prev);
        }
      } catch (error) {
        console.log('Erro ao buscar trailer do hero:', error);
      }
    }

    if (url) {
      Linking.openURL(url);
    } else {
      Alert.alert('Indisponível', 'Trailer não encontrado na API.');
    }
  };

  const renderHeroHeader = () => {
    if (!featuredMovie) return null;

    // A API do TMDb usa 'poster_path' e 'overview'
    return (
      <View style={styles.heroContainer}>
        <ImageBackground 
          source={{ uri: `https://image.tmdb.org/t/p/w500${featuredMovie.poster_path}` }} 
          style={styles.heroImage}
          resizeMode="cover" 
        >
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)', COLORS.background]} style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>{featuredMovie.title}</Text>
            {featuredMovie.overview && <Text style={styles.heroSynopsis} numberOfLines={2}>{featuredMovie.overview}</Text>}
            
            <View style={styles.heroButtonRow}>
              {/* Botão Assistir Trailer */}
              <TouchableOpacity style={styles.secondaryButton} onPress={openHeroTrailer}>
                <Ionicons name="play-circle-outline" size={24} color={COLORS.textPrimary} />
                <Text style={styles.secondaryButtonText}>Trailer</Text>
              </TouchableOpacity>

              {/* Botão Saiba Mais */}
              <TouchableOpacity style={[styles.secondaryButton, { marginLeft: 10 }]} onPress={() => handleMoviePress(featuredMovie)}>
                <Ionicons name="information-circle-outline" size={24} color={COLORS.textPrimary} />
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
  heroOverlay: { width: '100%', height: '100%', justifyContent: 'flex-end', padding: 20 }, 
  heroTitle: { color: COLORS.textPrimary, fontSize: 36, fontWeight: 'bold', marginBottom: 8 },
  heroSynopsis: { color: COLORS.textSecondary, fontSize: 14, marginBottom: 20, width: '90%' },
  heroButtonRow: { flexDirection: 'row', alignItems: 'center' },
  secondaryButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(139, 148, 158, 0.4)', 
    paddingVertical: 10, 
    paddingHorizontal: 20, 
    borderRadius: 5 
  },
  secondaryButtonText: { color: COLORS.textPrimary, fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
});