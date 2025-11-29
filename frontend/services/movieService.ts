import api from './api';
import { Movie, Category, Genre } from '../types';
import { isAxiosError } from 'axios';

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
    rating: dbMovie.publicRating?.toString() || 'N/A'
  };
};

export const getHomeData = async (): Promise<{ featured: Movie; categories: Category[] }> => {
  try {
    const [wishlist, watched, popular] = await Promise.all([
      api.get('/library/wishlist'),
      api.get('/library/watched'),
      api.get('/movies/popular')
    ]);

    const wishlistMovies = wishlist.data.map(mapLibraryMovie);
    const watchedMovies = watched.data.map(mapLibraryMovie);
    const popularMovies = popular.data.map(mapTMDbMovie);

    return {
      featured: popularMovies[0] || ({} as Movie),
      categories: [
        { id: 'populares', title: 'Populares', movies: popularMovies },
        { id: 'wishlist', title: 'Minha Lista', movies: wishlistMovies },
        { id: 'watched', title: 'Assistidos', movies: watchedMovies }
      ]
    };
  } catch {
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

export const getMovieTMDbDetails = async (tmdbId: string): Promise<Movie | null> => {
  try {
    const response = await api.get(`/movies/details/${tmdbId}`);
    return mapTMDbMovie(response.data);
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
    const response = await api.get('/movies/discover', { params: { genreId } });
    return response.data.map(mapTMDbMovie);
  } catch {
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
  status: 'wishlist' | 'watched',
  rating?: number,
  notes?: string
) {
  try {
    const imdb = movie?.external_ids?.imdb_id;
    if (!imdb) throw new Error('IMDB ID ausente.');

    const payload = {
      imdb_id: imdb,
      tmdb_id: movie.id?.toString(),
      title: movie.title,
      poster_url: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
      status,
      genres: movie.genres?.map((g: any) => g.name).join(', '),  
      actors: movie.credits?.cast?.slice(0,5).map((a: any) => a.name).join(', '),
      director: movie.credits?.crew?.find((c: any) => c.job === 'Director')?.name,
      rating,
      notes
    };

    const response = await api.post('/library/upsert', payload);
    return response.data; 
  } catch (error) {
    console.error('Erro ao salvar filme na biblioteca:', error);
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
