// --- TIPOS GERAIS ---
export interface Genre {
  id: number;
  name: string;
}

export interface Category {
  id: string;
  title: string;
  movies: Movie[];
}

export interface Movie {
  id: number;
  title: string;
  poster_path?: string;
  overview?: string;
  vote_average?: number;
  external_ids?: {
    imdb_id: string | null;
  };
  imdb_id?: string;
  tmdb_id?: number;
  status?: 'watched' | 'wishlist' | 'none';
  crew?: string;
  credits?: string;
  poster?: string;
  synopsis?: string;
  rating?: string;
  genres?: string[];
  director?: string;
  actors?: string[];
  release_date?: number;
}

// --- TIPOS TMDB ---
export type CrewMember = { job: string; name: string };
export type CastMember = { name: string };

export type TMDbCredits = {
  cast: CastMember[];
  crew: CrewMember[];
};

export type TMDbMovie = {
  id: number;
  title: string;
  poster: string;
  synopsis: string;
  rating?: number;
  release_date?: string;
  genres?: { name: string }[];
  credits?: TMDbCredits;
  external_ids?: { imdb_id?: string };
};
