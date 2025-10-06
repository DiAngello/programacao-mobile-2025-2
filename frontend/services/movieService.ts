import { Movie, Category  } from "../types";

const mockMovies: Movie[] = [
  { id: '1', title: 'Titanic', rating: '7.9', poster: 'https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg', synopsis: 'Um romance épico que floresce no fatídico RMS Titanic.', director: 'James Cameron', actors: ['Leonardo DiCaprio', 'Kate Winslet'], genres: ['Romance' ]},
  { id: '5', title: 'Oppenheimer', rating: '8.3', poster: 'https://www.themoviedb.org/t/p/w600_and_h900_bestv2/1OsQJEoSXBjduuCvDOlRhoEUaHu.jpg', synopsis: 'A história do físico americano J. Robert Oppenheimer e seu papel no Projeto Manhattan.', director: 'Christopher Nolan', actors: ['Cillian Murphy', 'Emily Blunt'], genres: ['Drama'] },
  { id: '4', title: 'Barbie', rating: '6.8', poster: 'https://www.themoviedb.org/t/p/w600_and_h900_bestv2/6WXUFcFSKpyhtkalnhJvd09iKUY.jpg', synopsis: 'Viver na Terra da Barbie é ser um ser perfeito em um lugar perfeito. A menos que você tenha uma crise existencial completa. Ou que você seja um Ken.', director: 'Greta Gerwig', actors: ['Margot Robbie', 'Ryan Gosling'], genres: ['Comédia'] },
  { id: '2', title: 'O Protetor: Capítulo Final', rating: '6.8', poster: 'https://www.themoviedb.org/t/p/w600_and_h900_bestv2/hoUy4y7JULoSyWryStY9XKpB3XY.jpg', synopsis: 'Robert McCall se sente em casa no sul da Itália, mas descobre que seus amigos estão sob o controle do crime local. À medida que os eventos se tornam mortais, McCall sabe que deve tornar-se o protetor de seus amigos enfrentando a máfia.', director: 'Antoine Fuqua', actors: ['Denzel Washington', 'Dakota Fanning'], genres: ['Ação'] },
  { id: '3', title: 'A Freira 2', rating: '5.6', poster: 'https://www.themoviedb.org/t/p/w600_and_h900_bestv2/omV2IW2OlFTSw6Hih13hz6lFdvP.jpg', synopsis: 'França, 1956. Um padre é assassinado. Um mal está se espalhando. A irmã Irene, mais uma vez, fica cara a cara com a força demoníaca Valak, a Freira.', director: 'Michael Chaves', actors: ['Taissa Farmiga', 'Jonas Bloquet'], genres: ['Terror'] },
];

const simulateApiCall = <T>(data: T, delay = 500): Promise<T> => {
  return new Promise(resolve => setTimeout(() => resolve(data), delay));
};

export const getHomeData = async (): Promise<{ featured: Movie; categories: Category[] }> => {
  const watchedMovies = mockMovies.filter(m => m.id === '1' || m.id === '4');
  const wishlistMovies = mockMovies.filter(m => m.id === '2' || m.id === '3');
  const data = {
    featured: mockMovies[1],
    categories: [
      { id: 'wishlist', title: 'Minha Lista', movies: wishlistMovies },
      { id: 'watched', title: 'Assistidos', movies: watchedMovies },
      { id: 'populares', title: 'Populares', movies: mockMovies },
    ],
  };
  return simulateApiCall(data);
};

export const searchMovies = async (query: string, type: 'title' | 'actor' | 'director'): Promise<Movie[]> => {
  if (!query) return [];
  const lowerQuery = query.toLowerCase();
  const filtered = mockMovies.filter(movie => {
      switch (type) {
          case 'actor': return movie.actors?.some(actor => actor.toLowerCase().includes(lowerQuery));
          case 'director': return movie.director?.toLowerCase().includes(lowerQuery);
          default: return movie.title.toLowerCase().includes(lowerQuery);
      }
  });
  return simulateApiCall(filtered);
};

export const getMovieById = async (id: string): Promise<Movie | null> => {
  const movie = mockMovies.find(m => m.id === id);
  return simulateApiCall(movie || null);
};

export const getMoviesByCategory = async (categoryName: string): Promise<Movie[]> => {
    console.log(`✅ [MOCK SERVICE] Buscando filmes da categoria: "${categoryName}"`);
    const lowerCategory = categoryName.toLowerCase();
    
    const filtered = mockMovies.filter(movie =>
        movie.genres?.some(genre => genre.toLowerCase() === lowerCategory)
    );
    return simulateApiCall(filtered);
};

export const getTopSearches = async (): Promise<Movie[]> => {
  return simulateApiCall(mockMovies.slice(0,5));
};
export const getWatchedMovies = async (): Promise<Movie[]> => {
  const watched = mockMovies.filter(m => m.id === '1' || m.id === '4');
  return simulateApiCall(watched);
};
export const getWishlistMovies = async (): Promise<Movie[]> => {
  const wishlist = mockMovies.filter(m => m.id === '2' || m.id === '3');
  return simulateApiCall(wishlist);
};