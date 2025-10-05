import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { Movie } from '../types';
import { getMovieById } from '../services/movieService';
import AppTextInput from '../components/appTextInput';
import AppButton from '../components/appButton';
import StarRating from '../components/starRating';

export default function MovieDetailPage() {
  const { movieId } = useLocalSearchParams<{ movieId: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [isWatched, setIsWatched] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');

  useEffect(() => {
    if (movieId) {
      const loadMovieData = async () => {
        setLoading(true);
        const movieData = await getMovieById(movieId);
        setMovie(movieData);
        setLoading(false);
      };
      loadMovieData();
    }
  }, [movieId]);

  const handleMarkAsWatched = () => {
    setIsWatched(true);
    console.log(`Filme "${movie?.title}" marcado como assistido.`);
  };

  const handleSaveReview = () => {
    if (userRating === 0) {
      alert('Por favor, selecione uma nota antes de salvar.');
      return;
    }
    console.log(`Avaliação salva para "${movie?.title}": Nota ${userRating}/5, Comentário: ${userComment}`);
    alert('Sua avaliação foi salva!');
  };

  if (loading) {
    return <ActivityIndicator size="large" color={COLORS.primary} style={styles.centered} />;
  }

  if (!movie) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>Filme não encontrado.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: movie?.title }} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: movie.poster }} style={styles.poster} />
        <View style={styles.content}>
          <Text style={styles.title}>{movie.title}</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="star" color={COLORS.accent} size={18} />
              <Text style={styles.infoText}>{movie.rating}</Text>
            </View>
            {}
          </View>

          {movie.synopsis && (
            <>
              <Text style={styles.sectionTitle}>Sinopse</Text>
              <Text style={styles.synopsis}>{movie.synopsis}</Text>
            </>
          )}

          <View style={styles.buttonContainer}>
             <TouchableOpacity style={[styles.actionButton, styles.wishlistButton]}>
                <Ionicons name="bookmark-outline" size={22} color={COLORS.textPrimary} />
                <Text style={styles.actionButtonText}>Lista de Desejos</Text>
             </TouchableOpacity>
             <TouchableOpacity
                style={[styles.actionButton, isWatched ? styles.watchedButtonPressed : styles.watchedButton]}
                onPress={handleMarkAsWatched}>
                <Ionicons name="checkmark-circle-outline" size={22} color={isWatched ? COLORS.background : COLORS.textPrimary} />
                <Text style={[styles.actionButtonText, isWatched && { color: COLORS.background }]}>Já Assisti</Text>
             </TouchableOpacity>
          </View>

          {isWatched && (
            <View style={styles.reviewContainer}>
              <Text style={styles.sectionTitle}>Sua Avaliação</Text>
              <StarRating rating={userRating} onRatingChange={setUserRating} />
              <View style={{ height: 20 }} />
              <AppTextInput
                label="Deixe seu comentário (opcional)"
                placeholder="O que você achou do filme?"
                value={userComment}
                onChangeText={setUserComment}
                multiline
              />
              <AppButton title="Salvar Avaliação" onPress={handleSaveReview} />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  errorText: { color: 'red', fontSize: 18 },
  poster: { width: '100%', height: 400, resizeMode: 'cover' },
  content: { padding: 20, marginTop: -30, borderTopLeftRadius: 30, borderTopRightRadius: 30, backgroundColor: COLORS.background },
  title: { color: COLORS.textPrimary, fontSize: 28, fontWeight: 'bold' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, flexWrap: 'wrap' },
  infoItem: { flexDirection: 'row', alignItems: 'center', marginRight: 20, marginBottom: 10 },
  infoText: { color: COLORS.textSecondary, marginLeft: 5 },
  sectionTitle: { color: COLORS.textPrimary, fontSize: 20, fontWeight: 'bold', marginTop: 25, marginBottom: 10 },
  synopsis: { color: COLORS.textSecondary, fontSize: 15, lineHeight: 22 },
  buttonContainer: { flexDirection: 'row', marginTop: 30, justifyContent: 'space-between' },
  actionButton: { flex: 1, flexDirection: 'row', padding: 15, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  wishlistButton: { backgroundColor: COLORS.surface, marginRight: 10 },
  watchedButton: { backgroundColor: COLORS.primary, marginLeft: 10 },
  actionButtonText: { color: COLORS.textPrimary, fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  watchedButtonPressed: { backgroundColor: COLORS.accent, marginLeft: 10 },
  reviewContainer: { marginTop: 30, paddingTop: 20, borderTopWidth: 1, borderTopColor: COLORS.border },
});