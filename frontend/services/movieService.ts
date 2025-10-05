import { Movie } from "../types";

export interface Category {
  id: string;
  title: string;
  movies: Movie[];
}

const mockMovies: Movie[] = [
  { id: '1', title: 'Titanic', rating: '7.9', poster: 'https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg', synopsis: 'Um romance épico que floresce no fatídico RMS Titanic.' },
  { id: '5', title: 'Oppenheimer', rating: '8.3', poster: 'https://www.themoviedb.org/t/p/w600_and_h900_bestv2/1OsQJEoSXBjduuCvDOlRhoEUaHu.jpg', synopsis: 'A história do físico americano J. Robert Oppenheimer e seu papel no Projeto Manhattan.' },
  { id: '4', title: 'Barbie', rating: '6.8', poster: 'https://www.themoviedb.org/t/p/w600_and_h900_bestv2/6WXUFcFSKpyhtkalnhJvd09iKUY.jpg', synopsis: 'Viver na Terra da Barbie é ser um ser perfeito em um lugar perfeito. A menos que você tenha uma crise existencial completa. Ou que você seja um Ken.' },
  { id: '2', title: 'O Protetor: Capítulo Final', rating: '6.8', poster: 'https://www.themoviedb.org/t/p/w600_and_h900_bestv2/hoUy4y7JULoSyWryStY9XKpB3XY.jpg', synopsis: 'Robert McCall se sente em casa no sul da Itália, mas descobre que seus amigos estão sob o controle do crime local. À medida que os eventos se tornam mortais, McCall sabe que deve tornar-se o protetor de seus amigos enfrentando a máfia.' },
  { id: '3', title: 'A Freira 2', rating: '5.6', poster: 'https://www.themoviedb.org/t/p/w600_and_h900_bestv2/omV2IW2OlFTSw6Hih13hz6lFdvP.jpg', synopsis: 'França, 1956. Um padre é assassinado. Um mal está se espalhando. A irmã Irene, mais uma vez, fica cara a cara com a força demoníaca Valak, a Freira.' },
];

const simulateApiCall = <T>(data: T, delay = 500): Promise<T> => {
  return new Promise(resolve => setTimeout(() => resolve(data), delay));
};

export const getHomeData = async (): Promise<{ featured: Movie; categories: Category[] }> => {
  console.log("Buscando dados da Home...");
  const data = {
    featured: mockMovies[1], 
    categories: [
      { id: '1', title: 'Populares', movies: mockMovies },
      { id: '2', title: 'Em Alta', movies: [...mockMovies].reverse() },
    ],
  };
  return simulateApiCall(data);
};

export const getTopSearches = async (): Promise<Movie[]> => {
    console.log("Buscando Top Buscas...");
    return simulateApiCall(mockMovies.slice(0, 9));
};

export const searchMovies = async (query: string): Promise<Movie[]> => {
    if (!query) return [];
    
    console.log(`Buscando por: "${query}"`);
    const filtered = mockMovies.filter(movie =>
        movie.title.toLowerCase().includes(query.toLowerCase())
    );
    console.log(`Encontrados ${filtered.length} resultados.`);
    return simulateApiCall(filtered);
};

export const getWatchedMovies = async (): Promise<Movie[]> => {
    console.log("Buscando filmes assistidos...");
    const watched = mockMovies.filter(m => m.id === '1' || m.id === '4');
    return simulateApiCall(watched);
};

export const getWishlistMovies = async (): Promise<Movie[]> => {
    console.log("Buscando filmes da lista de desejos...");
    const wishlist = mockMovies.filter(m => m.id === '2' || m.id === '3');
    return simulateApiCall(wishlist);
};

export const getMovieById = async (id: string): Promise<Movie | null> => {
    console.log(`Buscando filme com ID: ${id}`);
    
    const movie = mockMovies.find(m => m.id === id);

    if (movie) {
        return simulateApiCall(movie);
    }

    return simulateApiCall(null);
};