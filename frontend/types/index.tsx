// --- TIPOS GERAIS ---

// Define o que é um Gênero (vindo da API)
export interface Genre {
  id: number;
  name: string;
}

// Define uma Categoria (que usamos na Home)
export interface Category {
  id: string;
  title: string;
  movies: Movie[]; // Uma categoria é uma fileira de filmes
}


// --- TIPO DE FILME (O MAIS IMPORTANTE) ---

// Esta interface combina os dados que vêm da
// API do TMDb E os dados do nosso banco de dados (biblioteca)

export interface Movie {
  // --- Dados Comuns (TMDb ID é o principal) ---
  id: number; // A API usa 'number', não 'string'
  title: string;

  // --- Dados da API (TMDb) ---
  // (São opcionais '?' pois nem sempre os temos)
  poster_path?: string;   // O poster vindo do TMDb (ex: /path.jpg)
  overview?: string;      // A sinopse vinda do TMDb
  vote_average?: number;  // A nota (ex: 7.9) vinda do TMDb
  external_ids?: {
    imdb_id: string | null; // O ID do IMDb
  };

  // --- Dados do Nosso Banco de Dados (Biblioteca) ---
  // (Opcionais, pois um filme da API não terá isso)
  imdb_id?: string;
  tmdb_id?: number; // O ID do TMDb, salvo no nosso BD
  status?: 'watched' | 'wishlist' | 'none';
  
  // --- Campos do seu Mock (Mantidos para compatibilidade) ---
  // (Opcionais, para onde podemos mapear os dados da API)
  poster?: string;  // A URL completa do poster (ex: https://...)
  synopsis?: string;
  rating?: string;  // A nota formatada como string (ex: "7.9")
  genres?: string[];
  director?: string;
  actors?: string[];
}