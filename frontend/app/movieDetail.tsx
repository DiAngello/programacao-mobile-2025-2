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
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import {
  Movie,
  TMDbMovie,
  TMDbCredits,
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
  const [movie, setMovie] = useState<TMDbMovie | null>(null);
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
        let movieData: TMDbMovie | null = null;

        const currentMovieId = Array.isArray(movieId) ? movieId[0] : movieId;
        const currentImdbId = Array.isArray(imdbId) ? imdbId[0] : imdbId;

        if (currentMovieId) {
            movieData = (await getMovieTMDbDetails(currentMovieId)) as unknown as TMDbMovie;
        } else if (currentImdbId) {
            movieData = (await getMovieByIMDbId(currentImdbId)) as unknown as TMDbMovie;
        }

        if (movieData) {
          movieData.poster = movieData.poster || '';
          movieData.genres = movieData.genres || [];
          movieData.credits = movieData.credits || { cast: [], crew: [] };
          
          movieData.external_ids = movieData.external_ids || { imdb_id: undefined };

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

  const genres = movie.genres?.map((g) => g.name).join(', ') || 'N/A';
  
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
                <>
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
                  <AppButton title="Salvar Avaliação" onPress={saveReview} />
                </>
              ) : (
                <>
                  <Text style={styles.staticRating}>
                    {userRating} <Ionicons name="star" color={COLORS.accent} size={16} />
                    
                  </Text>
                  <Text style={styles.staticComment}>{userNotes}</Text>
                  <View style={{ height: 10 }} />
                  <AppButton title="Editar Avaliação" onPress={startEditingReview} />
                </>
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
  infoRow: { flexDirection: 'row', marginTop: 10 },
  infoText: { color: COLORS.textSecondary, marginLeft: 5 },
  synopsis: { color: COLORS.textSecondary, fontSize: 15, marginTop: 10 },
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
  reviewContainer: { marginTop: 20 },
  staticRating: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  staticComment: { color: COLORS.textSecondary, fontSize: 15 },
});