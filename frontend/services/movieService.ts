import api from './api';
import { Movie, Category, Genre } from "../types";
import { isAxiosError } from 'axios';

// --- HELPER 1: Para filmes da API (TMDb) ---
const mapTMDbMovie = (apiMovie: any): Movie => {
  return {
    ...apiMovie,
    poster: `https://image.tmdb.org/t/p/w500${apiMovie.poster_path}`,
    synopsis: apiMovie.overview,
    rating: apiMovie.vote_average?.toFixed(1) || 'N/A',
  };
};

// --- [NOVO] HELPER 2: Para filmes da Biblioteca (BD) ---
const mapLibraryMovie = (dbMovie: any): Movie => {
  if (!dbMovie.poster_url) {
    console.warn(`[mapLibraryMovie] Filme "${dbMovie.title}" (ID: ${dbMovie.imdb_id}) está sem poster_url no banco!`);
  }
  return {
    ...dbMovie, 
    poster: `https://image.tmdb.org/t/p/w500${dbMovie.poster_url}`,
    synopsis: dbMovie.overview || 'Sem sinopse',
    rating: dbMovie.publicRating?.toString() || 'N/A',
  };
};

// --- FUNÇÕES DE API ATUALIZADAS ---

export const getHomeData = async (): Promise<{ featured: Movie; categories: Category[] }> => {
  try {
    const [
      wishlistResponse, 
      watchedResponse,  
      popularResponse,  
    ] = await Promise.all([
      api.get('/library/wishlist'),
      api.get('/library/watched'),
      api.get('/movies/popular') 
    ]);

    const wishlistMovies: Movie[] = wishlistResponse.data.map(mapLibraryMovie);
    const watchedMovies: Movie[] = watchedResponse.data.map(mapLibraryMovie);
    const popularMovies: Movie[] = popularResponse.data.map(mapTMDbMovie);
    
    const featuredMovie = popularMovies[0] || {} as Movie;

    const data = {
      featured: featuredMovie,
      categories: [
       { id: 'populares', title: 'Populares', movies: popularMovies },
        { id: 'wishlist', title: 'Minha Lista', movies: wishlistMovies },
        { id: 'watched', title: 'Assistidos', movies: watchedMovies },
      ],
    };
    return data;
  } catch (error) {
    console.error('Erro ao buscar dados da Home:', error);
    return { featured: {} as Movie, categories: [] };
  }
};

export const searchMovies = async (query: string): Promise<Movie[]> => {
  if (!query) return [];
  try {
    const response = await api.get('/movies/search_tmdb', { params: { query } });
    return response.data.map(mapTMDbMovie);
  } catch (error) {
    console.error('Erro ao buscar (TMDb):', error);
    return [];
  }
};

export const getMovieTMDbDetails = async (tmdbId: string): Promise<Movie | null> => {
  try {
    const response = await api.get(`/movies/details/${tmdbId}`);
    return mapTMDbMovie(response.data);
  } catch (error)
  {
    console.error('Erro ao buscar detalhes (TMDb):', error);
    return null;
  }
};

export const getGenres = async (): Promise<Genre[]> => {
  try {
    const response = await api.get('/movies/genres');
    return response.data; 
  } catch (error) {
    console.error('Erro ao buscar gêneros:', error);
    return [];
  }
};

export const getMoviesByCategory = async (genreId: string): Promise<Movie[]> => {
  try {
    const response = await api.get('/movies/discover', { params: { genreId } });
    return response.data.map(mapTMDbMovie);
  } catch (error) {
    console.error(`Erro ao buscar por gênero ${genreId}:`, error);
    return [];
  }
};

export const getMovieByIMDbId = async (imdbId: string): Promise<Movie | null> => {
  if (!imdbId) return null;
  try {
    // Chama a nova rota do backend (que vamos criar)
    const response = await api.get(`/movies/imdb/${imdbId}`);
    // O backend já vai mapear os dados para nós
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar por IMDb ID ${imdbId}:`, error);
    return null;
  }
};

export const getPopular = async (): Promise<Movie[]> => {
  try {
    const response = await api.get('/movies/popular');
    return response.data.map(mapTMDbMovie);
  } catch (error) {
    console.error('Erro ao buscar populares:', error);
    return [];
  }
};

export const getWatchedMovies = async (): Promise<Movie[]> => {
  try {
    const response = await api.get('/library/watched');
    return response.data.map(mapLibraryMovie);
  } catch (error) {
    console.error('Erro ao buscar filmes assistidos:', error);
    return [];
  }
};

export const getWishlistMovies = async (): Promise<Movie[]> => {
  try {
    const response = await api.get('/library/wishlist');
    return response.data.map(mapLibraryMovie);
  } catch (error) {
    console.error('Erro ao buscar wishlist:', error);
    return [];
  }
};

// --- Funções da Biblioteca Pessoal (Upsert/Delete) ---

// [CORREÇÃO]: A função 'upsertMovieToLibrary' estava duplicada e quebrada.
// Esta é a versão correta e unificada.
export const upsertMovieToLibrary = async (movie: Movie, status: 'wishlist' | 'watched' | 'none') => {
  
  console.log('[movieService] Tentando salvar:', movie.title, 'como', status);

  // 1. Valida se temos o ID do IMDb
  const imdbId = movie.external_ids?.imdb_id;
  if (!imdbId) {
    const errorMsg = 'ID IMDb não encontrado para este filme.';
    console.error('❌ [movieService] ERRO FATAL:', errorMsg, movie);
    throw new Error(errorMsg);
  }

  try {
    // 2. Prepara o payload para o backend
    const payload = {
      imdb_id: imdbId,
      tmdb_id: movie.id, 
      title: movie.title,
      poster_url: movie.poster_path, // Salva o 'path' (ex: /path.jpg)
      status: status,
      publicRating: movie.vote_average?.toFixed(1) || null
    };
    
    console.log('[movieService] Enviando este payload para POST /api/library:', payload);
    
    // 3. Envia para a API
    const response = await api.post('/library', payload);
    return response.data;

  } catch (error) {
    console.error('❌ [movieService] Erro ao adicionar na biblioteca:', error);
    // 4. Repassa o erro do backend para a UI
    if (isAxiosError(error) && error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw error; // Lança o erro genérico
  }
};

export const removeMovieFromLibrary = async (imdbId: string) => {
    try {
      const response = await api.delete(`/library/${imdbId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao remover da biblioteca:', error);
      throw error;
    }
  };
  
  export const getLibraryEntry = async (imdbId: string) => {
    if (!imdbId) return null;
    try {
      const response = await api.get(`/library/${imdbId}`);
      return response.data; 
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
        return null; // Não encontrado
      }
      console.error('Erro ao checar biblioteca:', error);
      return null; // Outros erros
    }
  };