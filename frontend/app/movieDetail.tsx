import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking, // IMPORTANTE: Importar Linking para abrir URLs
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import {
  Movie,
  TMDbMovie,
  CrewMember,
  CastMember,
} from '../types';
import {
  getMovieTMDbDetails,
  getLibraryEntry,
  getMovieByIMDbId,
  upsertMovieToLibrary,
  removeMovieFromLibrary
} from '../services/movieService';

import AppTextInput from '../components/appTextInput';
import AppButton from '../components/appButton';
import StarRating from '../components/starRating';

export default function MovieDetailPage() {
  const { movieId, imdbId } = useLocalSearchParams();
  // 'any' permite acessar propriedades dinâmicas como trailer_url
  const [movie, setMovie] = useState<any | null>(null); 
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userNotes, setUserNotes] = useState('');
  const [isReviewSaved, setIsReviewSaved] = useState(false);
  const [isEditingReview, setIsEditingReview] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        let movieData: any | null = null;

        const currentMovieId = Array.isArray(movieId) ? movieId[0] : movieId;
        const currentImdbId = Array.isArray(imdbId) ? imdbId[0] : imdbId;

        if (currentMovieId) {
            movieData = await getMovieTMDbDetails(currentMovieId);
        } else if (currentImdbId) {
            movieData = await getMovieByIMDbId(currentImdbId);
        }

        if (movieData) {
          movieData.poster = movieData.poster || '';
          movieData.genres = movieData.genres || [];
          movieData.credits = movieData.credits || { cast: [], crew: [] };
          movieData.external_ids = movieData.external_ids || { imdb_id: undefined };

          // === CORREÇÃO: Buscar trailer fresco se o filme salvo não tiver ===
          if (!movieData.trailer_url && movieData.id) {
            try {
              // Tenta buscar detalhes frescos no TMDb usando o ID
              const freshData = await getMovieTMDbDetails(String(movieData.id));
              if (freshData?.trailer_url) {
                movieData.trailer_url = freshData.trailer_url;
              }
            } catch (err) {
              console.log('Não foi possível recuperar o trailer fresco:', err);
            }
          }
          // ================================================================

          setMovie(movieData);

          const idToCheck = movieData.external_ids?.imdb_id || currentImdbId || '';
          
          if (idToCheck) {
            const lib = await getLibraryEntry(idToCheck);
            if (lib) {
              setIsWishlisted(lib.on_wishlist);
              setIsWatched(lib.watched);
              setUserRating(lib.rating || 0);
              setUserNotes(lib.notes || '');
              setIsReviewSaved(!!lib.rating || !!lib.notes);
            } else {
              setIsWishlisted(false);
              setIsWatched(false);
              setIsReviewSaved(false);
            }
          }
        }
      } catch (error) {
        console.error('Erro ao carregar filme ou biblioteca:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [movieId, imdbId]);

  const handleLibraryAction = async (action: 'wishlist' | 'watched') => {
    if (!movie) return;
    setIsSubmitting(true);

    try {
      const imdb = movie.external_ids?.imdb_id;
      if (!imdb) return;

      if ((action === 'wishlist' && isWishlisted) || (action === 'watched' && isWatched)) {
        await removeMovieFromLibrary(imdb);
        setIsWishlisted(false);
        setIsWatched(false);
        return;
      }

      await upsertMovieToLibrary(
        movie,
        action,
        action === 'watched' ? userRating : undefined,
        action === 'watched' ? userNotes : undefined
      );

      setIsWishlisted(action === 'wishlist');
      setIsWatched(action === 'watched');
    } catch (error) {
      console.error('Erro ao atualizar biblioteca:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveReview = async () => {
    if (isSubmitting) return; // Previne múltiplos cliques manualmente
    if (!movie) return;
    if (userRating === 0) {
      Alert.alert('Selecione uma nota.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await upsertMovieToLibrary(
        movie as unknown as Movie,
        'watched',
        userRating,
        userNotes
      );
      setUserRating(response.rating || 0);
      setUserNotes(response.notes || '');
      setIsReviewSaved(true);
      setIsEditingReview(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditingReview = () => {
    setIsEditingReview(true);
  };

  // --- LÓGICA DO BOTÃO ---
  // Apenas abre o link oficial (se existir)
  const openTrailer = () => {
    if (movie?.trailer_url) {
      Linking.openURL(movie.trailer_url);
    } else {
      Alert.alert('Ops', 'Trailer não disponível para este filme.');
    }
  };

  if (loading) {
    return (
      <ActivityIndicator
        style={styles.centered}
        size="large"
        color={COLORS.primary}
      />
    );
  }

  if (!movie) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>Filme não encontrado.</Text>
      </SafeAreaView>
    );
  }

  const genres = movie.genres?.map((g: any) => g.name).join(', ') || 'N/A';
  
  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : 'N/A';
    
  const director =
    (movie.credits?.crew as CrewMember[])
      ?.find((c) => c.job === 'Director')
      ?.name || 'N/A';
      
  const actors =
    (movie.credits?.cast as CastMember[])
      ?.slice(0, 5)
      .map((c) => c.name)
      .join(', ') || 'N/A';

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: movie.title }} />
      <ScrollView>
        <Image source={{ uri: movie.poster }} style={styles.poster} />
        <View style={styles.content}>
          <Text style={styles.title}>{movie.title}</Text>
          <Text style={styles.subInfo}>
            {releaseYear} • {genres}
          </Text>
          <Text style={styles.subInfo}>Diretor: {director}</Text>
          <Text style={styles.subInfo}>Elenco: {actors}</Text>

          {movie.rating && (
            <View style={styles.infoRow}>
              <Ionicons name="star" size={18} color={COLORS.accent} />
              <Text style={styles.infoText}>{movie.rating}</Text>
            </View>
          )}

          {/* BOTÃO DO TRAILER - SÓ APARECE SE TIVER LINK (Recuperado via API ou Banco) */}
          {movie.trailer_url && (
            <TouchableOpacity style={styles.trailerButton} onPress={openTrailer}>
              <Ionicons name="logo-youtube" size={24} color={COLORS.textPrimary} />
              <Text style={styles.trailerButtonText}>Assistir Trailer</Text>
            </TouchableOpacity>
          )}

          {movie.synopsis && (
            <Text style={styles.synopsis}>{movie.synopsis}</Text>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                isWishlisted ? styles.activeWishlist : styles.wishlist,
              ]}
              onPress={() => handleLibraryAction('wishlist')}
              disabled={isSubmitting}
            >
              <Ionicons
                name={isWishlisted ? 'bookmark' : 'bookmark-outline'}
                size={22}
                color={isWishlisted ? COLORS.background : COLORS.textPrimary}
              />
              <Text
                style={[
                  styles.actionButtonText,
                  isWishlisted && { color: COLORS.background },
                ]}
              >
                {isWishlisted ? 'Na Lista' : 'Lista'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                isWatched ? styles.activeWatched : styles.watched,
              ]}
              onPress={() => handleLibraryAction('watched')}
              disabled={isSubmitting}
            >
              <Ionicons
                name={isWatched ? 'checkmark-circle' : 'checkmark-circle-outline'}
                size={22}
                color={isWatched ? COLORS.background : COLORS.textPrimary}
              />
              <Text
                style={[
                  styles.actionButtonText,
                  isWatched && { color: COLORS.background },
                ]}
              >
                {isWatched ? 'Assistido' : 'Assistir'}
              </Text>
            </TouchableOpacity>
          </View>

          {isWatched && (
            <View style={styles.reviewContainer}>
              {!isReviewSaved || isEditingReview ? (
                <View>
                  <StarRating
                    rating={userRating}
                    onRatingChange={setUserRating}
                    disabled={false}
                  />
                  <AppTextInput
                    multiline
                    label="Comentário"
                    value={userNotes}
                    onChangeText={setUserNotes}
                    editable={!isReviewSaved || isEditingReview}
                  />
                  <View style={{ height: 10 }} />
                  <AppButton 
                    title={isSubmitting ? "Salvando..." : "Salvar Avaliação"} 
                    onPress={saveReview}
                  />
                </View>
              ) : (
                <View>
                  <Text style={styles.staticRating}>
                    Sua nota: {userRating} <Ionicons name="star" color={COLORS.accent} size={16} />
                  </Text>
                  {userNotes ? (
                    <Text style={styles.staticComment}>{userNotes}</Text>
                  ) : (
                    <Text style={styles.staticComment}>Sem comentários.</Text>
                  )}
                  <View style={{ height: 15 }} />
                  <AppButton title="Editar Avaliação" onPress={startEditingReview} />
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: 'red' },
  poster: { width: '100%', height: 400 },
  content: { padding: 20, marginTop: -20 },
  title: { color: COLORS.textPrimary, fontSize: 28, fontWeight: 'bold' },
  subInfo: { color: COLORS.textSecondary, marginTop: 5 },
  infoRow: { flexDirection: 'row', marginTop: 10, alignItems: 'center' },
  infoText: { color: COLORS.textSecondary, marginLeft: 5 },
  synopsis: { color: COLORS.textSecondary, fontSize: 15, marginTop: 15, lineHeight: 22 },
  
  // Estilo do botão do Trailer (Atualizado para combinar com a Home)
  trailerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 148, 158, 0.4)', // Mesmo estilo da Home
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 15,
    alignSelf: 'flex-start',
  },
  trailerButtonText: {
    color: COLORS.textPrimary, // Cor do texto padrão
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },

  buttonContainer: { flexDirection: 'row', marginTop: 30 },
  actionButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wishlist: { backgroundColor: COLORS.surface, marginRight: 10 },
  activeWishlist: { backgroundColor: COLORS.accent, marginRight: 10 },
  watched: { backgroundColor: COLORS.surface, marginLeft: 10 },
  activeWatched: { backgroundColor: COLORS.primary, marginLeft: 10 },
  actionButtonText: { marginLeft: 10, fontSize: 16 },
  reviewContainer: { marginTop: 20, paddingBottom: 40 },
  staticRating: { fontSize: 18, fontWeight: 'bold', marginBottom: 5, color: COLORS.textPrimary },
  staticComment: { color: COLORS.textSecondary, fontSize: 15, fontStyle: 'italic' },
});