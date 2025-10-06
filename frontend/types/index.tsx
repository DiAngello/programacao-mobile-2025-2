export interface Movie {
  id: string;
  title: string;
  rating: string;
  poster: string;
  year?: string;
  duration?: string;
  genres?: string[];
  synopsis?: string;
  director?: string;
  actors?: string[];
}
export interface Category {
  id: string;
  title: string;
  movies: Movie[];
} 