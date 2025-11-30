import api from './api';
import { Movie, Category, Genre } from '../types';
import { isAxiosError } from 'axios';

const GENRES = {
  ACTION: '28',
  COMEDY: '35',
  SCIFI: '878',
  ANIMATION: '16',
  DRAMA: '18'
};

const mapTMDbMovie = (apiMovie: any): Movie => {
  return {
    ...apiMovie,
    poster: apiMovie.poster_path ? `https://image.tmdb.org/t/p/w500${apiMovie.poster_path}` : '',
    synopsis: apiMovie.overview,
    rating: apiMovie.vote_average?.toFixed(1) || 'N/A'
  };
};

const mapLibraryMovie = (dbMovie: any): Movie => {
  return {
    ...dbMovie,
    poster: dbMovie.poster_url?.startsWith('http')
      ? dbMovie.poster_url
      : `https://image.tmdb.org/t/p/w500${dbMovie.poster_url}`,
    synopsis: dbMovie.synopsis || 'Sem sinopse',
    rating: dbMovie.public_rating?.toString()
      || dbMovie.vote_average?.toFixed?.(1)
      || 'N/A'

  };
};

export const getHomeData = async (): Promise<{ featured: Movie; categories: Category[] }> => {
  try {
    const [wishlist, watched, popular, action, scifi, comedy, animation] = await Promise.all([
      api.get('/library/wishlist'),
      api.get('/library/watched'),
      api.get('/movies/popular'),
      api.get('/movies/discover', { params: { genreId: GENRES.ACTION } }),
      api.get('/movies/discover', { params: { genreId: GENRES.SCIFI } }),
      api.get('/movies/discover', { params: { genreId: GENRES.COMEDY } }),
      api.get('/movies/discover', { params: { genreId: GENRES.ANIMATION } }),
    ]);

    const wishlistMovies = wishlist.data.map(mapLibraryMovie);
    const watchedMovies = watched.data.map(mapLibraryMovie);
    const popularMovies = popular.data.map(mapTMDbMovie);
    
    const actionMovies = action.data.map(mapTMDbMovie);
    const scifiMovies = scifi.data.map(mapTMDbMovie);
    const comedyMovies = comedy.data.map(mapTMDbMovie);
    const animationMovies = animation.data.map(mapTMDbMovie);

    const featured = popularMovies[0] || ({} as Movie);

    const categories: Category[] = [
      { id: 'wishlist', title: 'Minha Lista', movies: wishlistMovies },
      { id: 'watched', title: 'Assistidos', movies: watchedMovies },
      { id: 'populares', title: 'Populares', movies: popularMovies },
      { id: 'action', title: 'Ação e Aventura', movies: actionMovies },
      { id: 'scifi', title: 'Ficção Científica', movies: scifiMovies },
      { id: 'animation', title: 'Animação', movies: animationMovies },
      { id: 'comedy', title: 'Comédia', movies: comedyMovies },
    ];

    return {
      featured,
      categories
    };
  } catch (error) {
    console.error("Erro ao carregar home:", error);
    return { featured: {} as Movie, categories: [] };
  }
};

export const searchMovies = async (query: string): Promise<Movie[]> => {
  if (!query) return [];
  try {
    const response = await api.get('/movies/search_tmdb', { params: { query } });
    return response.data.map(mapTMDbMovie);
  } catch {
    return [];
  }
};

export const getMovieTMDbDetails = async (tmdbId: string): Promise<any | null> => {
  try {
    const response = await api.get(`/movies/details/${tmdbId}`);
    const data = response.data;

    const videos = data.videos?.results || [];
    const trailer = videos.find((v: any) => v.site === 'YouTube' && v.type === 'Trailer') 
                 || videos.find((v: any) => v.site === 'YouTube'); 

    return {
      ...data,
      poster: data.poster_path
        ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
        : '',
      synopsis: data.overview,
      rating: data.vote_average?.toFixed(1) || 'N/A',
      // Adicionamos o link do trailer aqui
      trailer_url: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null
    };
  } catch {
    return null;
  }
};

export const getGenres = async (): Promise<Genre[]> => {
  try {
    const response = await api.get('/movies/genres');
    return response.data;
  } catch {
    return [];
  }
};

export const getMoviesByCategory = async (genreId: string): Promise<Movie[]> => {
  try {
    const response = await api.get('/movies/discover', {
      params: { genreId }
    });
    return response.data.map(mapTMDbMovie);
  } catch (err) {
    console.error('Erro ao buscar filmes por categoria:', err);
    return [];
  }
};  

export const getMovieByIMDbId = async (imdbId: string): Promise<Movie | null> => {
  try {
    const response = await api.get(`/movies/imdb/${imdbId}`);
    return response.data;
  } catch {
    return null;
  }
};

export const getPopular = async (): Promise<Movie[]> => {
  try {
    const response = await api.get('/movies/popular');
    return response.data.map(mapTMDbMovie);
  } catch {
    return [];
  }
};

export const getWatchedMovies = async (): Promise<Movie[]> => {
  try {
    const response = await api.get('/library/watched');
    return response.data.map(mapLibraryMovie);
  } catch {
    return [];
  }
};

export const getWishlistMovies = async (): Promise<Movie[]> => {
  try {
    const response = await api.get('/library/wishlist');
    return response.data.map(mapLibraryMovie);
  } catch {
    return [];
  }
};

export async function upsertMovieToLibrary(
  movie: any,
  action: 'wishlist' | 'watched',
  rating?: number,
  notes?: string
) {
  try {
    const imdb = movie?.external_ids?.imdb_id;
    if (!imdb) throw new Error('IMDB ID ausente.');

    const payload = {
      imdb_id: imdb,
      status: action, 
      rating: action === 'watched' ? rating || 0 : undefined,
      notes: action === 'watched' ? notes || '' : undefined,
      title: movie.title || '',
      poster_url: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '',
      genres: movie.genres?.map((g: any) => g.name).join(', ') || '',
      actors: movie.credits?.cast?.slice(0, 5).map((a: any) => a.name).join(', ') || '',
      director: movie.credits?.crew?.find((c: any) => c.job === 'Director')?.name || '',
      public_rating: movie.vote_average ? Number(movie.vote_average.toFixed(1)) : undefined
    };

    console.log('Payload enviado:', JSON.stringify(payload, null, 2));

    const response = await api.post('/library/upsert', payload);
    return response.data;
  } catch (error: any) {
    if (error.isAxiosError) {
      console.log('Erro ao salvar filme:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
    } else {
      console.error(error);
    }
    throw error;
  }
}

export const removeMovieFromLibrary = async (imdbId: string) => {
  const response = await api.delete(`/library/${imdbId}`);
  return response.data;
};

export const getLibraryEntry = async (imdbId: string) => {
  try {
    const response = await api.get(`/library/${imdbId}`);
    return response.data;
  } catch {
    return null;
  }
};

export const searchMoviesByCategory = async (genreId: string, query: string): Promise<Movie[]> => {
  try {
    if (!query) return getMoviesByCategory(genreId);

    const response = await api.get('/movies/search_by_category', {
      params: { genreId, query }
    });
    return response.data.map(mapTMDbMovie);
  } catch (err) {
    console.error('Erro ao buscar filmes na categoria:', err);
    return [];
  }
};