import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, Image, 
  ScrollView, TouchableOpacity, ActivityIndicator, Alert 
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { Movie } from '../types';
// Importa os serviços corretos
import { 
  getMovieTMDbDetails, // Busca na API
  getLibraryEntry,
  getMovieByIMDbId,     // Busca no nosso BD
  upsertMovieToLibrary // Salva no nosso BD
} from '../services/movieService';
import AppTextInput from '../components/appTextInput';
import AppButton from '../components/appButton';
import StarRating from '../components/starRating';

type LibraryStatus = 'watched' | 'wishlist' | 'none';

export default function MovieDetailPage() {
  const router = useRouter();
  const { movieId, imdbId } = useLocalSearchParams<{ movieId?: string, imdbId?: string }>();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // Para os botões

  // 'watched', 'wishlist', ou 'none'
  const [libraryStatus, setLibraryStatus] = useState<LibraryStatus>('none');
  // TODO: Carregar/Salvar esta informação
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');

  // Carrega os dados do filme e o status da biblioteca
 useEffect(() => {
    const loadMovieData = async () => {
      setLoading(true);
      try {
        let movieData: Movie | null = null;

        // [CORREÇÃO]: Lógica para carregar por qualquer um dos IDs
        if (movieId) {
          // Se veio da Home, Busca, Categorias (com TMDb ID)
          console.log(`[movieDetail] Carregando por TMDb ID: ${movieId}`);
          movieData = await getMovieTMDbDetails(movieId);
        } else if (imdbId) {
          // Se veio do Perfil (com IMDb ID)
          console.log(`[movieDetail] Carregando por IMDb ID: ${imdbId}`);
          movieData = await getMovieByIMDbId(imdbId);
        } else {
          throw new Error("Nenhum ID de filme fornecido.");
        }
        
        setMovie(movieData);

        // Se o filme foi carregado E tem um ID do IMDb, busca na biblioteca
        const finalImdbId = movieData?.external_ids?.imdb_id || imdbId;        

        if (finalImdbId) { 
          console.log(`[movieDetail] Verificando status da biblioteca para: ${finalImdbId}`);
          // Busca no backend se esse filme já está salvo
          const libraryEntry = await getLibraryEntry(finalImdbId);
          if (libraryEntry !== null) {
            // SE ESTIVER, ATUALIZA O ESTADO!
            setLibraryStatus(libraryEntry.status); 
            console.log(`[movieDetail] Status encontrado: ${libraryEntry.status}`);
          } else {
            console.log(`[movieDetail] Filme não encontrado na biblioteca.`);
          }
        } else {
          console.warn(`[movieDetail] Não foi possível encontrar um IMDb ID para ${movieData?.title}. Os botões de status podem não funcionar.`);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do filme:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadMovieData();
  }, [movieId, imdbId]);

  // Ação de 'Já Assisti' ou 'Lista de Desejos'
  const handleLibraryAction = async (newStatus: 'watched' | 'wishlist') => {
    if (!movie || isSubmitting) return;

    // Se o usuário clicar no mesmo botão, desmarca (vira 'none')
    const finalStatus = (libraryStatus === newStatus) ? 'none' : newStatus;

    console.log(`[movieDetail] Botão clicado. Novo status: ${finalStatus}`);
    setIsSubmitting(true);
    try {
      await upsertMovieToLibrary(movie, finalStatus);
      setLibraryStatus(finalStatus); // Atualiza o estado da UI instantaneamente
    
    } catch (error) {
      console.error('[movieDetail] Falha ao salvar:', error);
      if (error instanceof Error) {
        Alert.alert("Erro ao Salvar", error.message);
      } else {
        Alert.alert("Erro ao Salvar", "Ocorreu um erro desconhecido.");
      }
    
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // TODO: Conectar esta função
  const handleSaveReview = () => {
    if (userRating === 0) {
      Alert.alert('Por favor, selecione uma nota antes de salvar.');
      return;
    }
    console.log(`Avaliação salva para "${movie?.title}": Nota ${userRating}/5, Comentário: ${userComment}`);
    Alert.alert('Sua avaliação foi salva!');
  };

  if (loading) {
    return <ActivityIndicator size="large" color={COLORS.primary} style={styles.centered} />;
  }

  
 if (!movie) {
    return (
      <SafeAreaView style={styles.centered}>
        <Stack.Screen options={{ title: 'Erro' }} />
        <Text style={styles.errorText}>Filme não encontrado.</Text>
      </SafeAreaView>
    );
  }
  // Define o estado dos botões
  const isWishlisted = libraryStatus === 'wishlist';
  const isWatched = libraryStatus === 'watched';

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: movie.title || 'Detalhes' }} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: movie.poster }} style={styles.poster} />
        <View style={styles.content}>
          <Text style={styles.title}>{movie.title}</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="star" color={COLORS.accent} size={18} />
              <Text style={styles.infoText}>{movie.rating}</Text>
            </View>
            {/* TODO: Adicionar Ano, Duração, etc. */}
          </View>

          {movie.synopsis && (
            <>
              <Text style={styles.sectionTitle}>Sinopse</Text>
              <Text style={styles.synopsis}>{movie.synopsis}</Text>
            </>
          )}

          <View style={styles.buttonContainer}>
             <TouchableOpacity 
                style={[styles.actionButton, isWishlisted ? styles.wishlistButtonPressed : styles.wishlistButton]}
                onPress={() => handleLibraryAction('wishlist')}
                disabled={isSubmitting}
             >
                <Ionicons name={isWishlisted ? "bookmark" : "bookmark-outline"} size={22} color={isWishlisted ? COLORS.background : COLORS.textPrimary} />
                <Text style={[styles.actionButtonText, isWishlisted && { color: COLORS.background }]}>
                  {isWishlisted ? "Na Lista" : "Lista"}
                </Text>
             </TouchableOpacity>
             
             <TouchableOpacity
                style={[styles.actionButton, isWatched ? styles.watchedButtonPressed : styles.watchedButton]}
                onPress={() => handleLibraryAction('watched')}
                disabled={isSubmitting}
             >
                <Ionicons name={isWatched ? "checkmark-circle" : "checkmark-circle-outline"} size={22} color={isWatched ? COLORS.background : COLORS.textPrimary} />
                <Text style={[styles.actionButtonText, isWatched && { color: COLORS.background }]}>
                  {isWatched ? "Assistido" : "Assisti"}
                </Text>
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
  wishlistButtonPressed: { backgroundColor: COLORS.accent, marginRight: 10 }, // Botão "Lista" pressionado
  watchedButton: { backgroundColor: COLORS.surface, marginLeft: 10 },
  watchedButtonPressed: { backgroundColor: COLORS.primary, marginLeft: 10 }, // Botão "Assisti" pressionado
  actionButtonText: { color: COLORS.textPrimary, fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  reviewContainer: { marginTop: 30, paddingTop: 20, borderTopWidth: 1, borderTopColor: COLORS.border },
});