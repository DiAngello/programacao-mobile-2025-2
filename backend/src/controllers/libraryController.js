const { User, Movie, UserMovie } = require('../models');
const { Op } = require('sequelize');
const axios = require('axios');

// Define a URL base da API externa que vamos consultar
const OMDB_URL = 'http://www.omdbapi.com/';
// Pega a chave da API (guardada no .env) para autenticar na OMDb
const API_KEY = process.env.OMDB_API_KEY;

/**
 * Função auxiliar que busca os detalhes de um filme na API OMDb pelo IMDB ID.
 */
const fetchMovieDetails = async (imdb_id) => {
  try {
    // Faz a chamada HTTP (GET) para a OMDb com a chave e o ID
    const response = await axios.get(OMDB_URL, {
      params: { apiKey: API_KEY, i: imdb_id, plot: 'full' }
    });
    // Se a OMDb retornar 'False', o filme não foi encontrado
    if (response.data.Response === 'False') return null;
    
    // Retorna um objeto formatado com os dados que queremos salvar
    return {
      title: response.data.Title,
      poster_url: response.data.Poster,
      year: parseInt(response.data.Year, 10),
      genres: response.data.Genre,
      actors: response.data.Actors,
      director: response.data.Director,       
      publicRating: response.data.imdbRating 
    };
  } catch (error) {
    console.error("Erro ao buscar detalhes do filme na OMDb:", error.message);
    return null;
  }
};

/**
 * Controlador que gerencia todas as ações da biblioteca pessoal do usuário.
 */
class LibraryController {

  /**
   * Adiciona um filme à biblioteca do usuário (ou atualiza se já existir) e salva a nota/status.
   */
  async upsertMovie(req, res) {
    // Pega os dados enviados pelo app (React Native) e o ID do usuário (do token)
    const { imdb_id, watched, on_wishlist, notes, rating } = req.body;
    const user_id = req.userId;

    // Validação básica
    if (!imdb_id) {
      return res.status(400).json({ error: 'imdb_id é obrigatório.' });
    }

    try {
      // 1. Verifica se o filme já existe no nosso banco de dados local (cache)
      let movie = await Movie.findByPk(imdb_id);
      
      // 2. Se não existir, busca na OMDb (usando a função auxiliar)
      if (!movie) {
        const movieDetails = await fetchMovieDetails(imdb_id);
        if (!movieDetails) {
          return res.status(404).json({ error: 'Filme não encontrado na OMDb.' });
        }
        
        // 3. Cria o filme no nosso banco de dados local (tabela 'Movies')
        movie = await Movie.create({
          imdb_id: imdb_id,
          title: movieDetails.title,
          poster_url: movieDetails.poster_url,
          year: movieDetails.year,
          genres: movieDetails.genres,
          actors: movieDetails.actors,
          director: movieDetails.director,       
          publicRating: movieDetails.publicRating 
        });
      }

      // 4. Cria ou Encontra (findOrCreate) a *relação* entre o usuário e o filme
      const [userMovie, created] = await UserMovie.findOrCreate({
        where: { user_id: user_id, movie_id: movie.imdb_id },
        defaults: { watched, on_wishlist, notes, rating } // Dados a serem inseridos se 'created'
      });

      // 5. Se a relação já existia ('created' == false), apenas atualiza os dados
      if (!created) {
        await userMovie.update({ watched, on_wishlist, notes, rating });
      }

      // 6. Busca o resultado final (com os dados do filme incluídos) para retornar ao app
      const result = await UserMovie.findOne({
        where: { user_id: user_id, movie_id: movie.imdb_id },
        include: [Movie] // Faz o JOIN com a tabela 'Movies'
      });

      // Retorna 201 (Created) se foi novo, ou 200 (OK) se foi atualização
      return res.status(created ? 201 : 200).json(result);

    } catch (error) {
      console.error('Erro detalhado no upsertMovie:', error);
      return res.status(500).json({ error: 'Erro ao salvar filme na biblioteca.', details: error.message });
    }
  }

  /**
   * Pesquisa filmes DENTRO da biblioteca pessoal do usuário usando filtros (título, gênero, etc.).
   */
  async searchLibrary(req, res) {
    // Pega os filtros da URL (query params: ?title=Batman&genre=Action)
    const { title, genre, actor, director } = req.query;
    const user_id = req.userId;
    
    // Objeto para construir a cláusula WHERE da busca
    const movieWhereClause = {};
    
    // Adiciona os filtros dinamicamente se eles existirem
    if (title) {
      movieWhereClause.title = { [Op.iLike]: `%${title}%` }; // iLike (case-insensitive)
    }
    if (genre) {
      movieWhereClause.genres = { [Op.iLike]: `%${genre}%` };
    }
    if (actor) {
      movieWhereClause.actors = { [Op.iLike]: `%${actor}%` };
    }
    if (director) {
      movieWhereClause.director = { [Op.iLike]: `%${director}%` };
    }

    try {
      // Busca todas as entradas do usuário
      const results = await UserMovie.findAll({
        where: { user_id: user_id }, 
        include: [{ // Fazendo JOIN com a tabela 'Movies'
          model: Movie,
          where: movieWhereClause, // Aplicando os filtros (title, genre, etc.)
          required: true // Força um INNER JOIN (só retorna se o filme bater o filtro)
        }],
        order: [['updatedAt', 'DESC']] // Ordena pelos mais recentes
      });
      
      return res.json(results);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao pesquisar na biblioteca.', details: error.message });
    }
  }

  /**
   * Retorna a contagem de filmes assistidos e na lista de desejos para a tela de perfil.
   */
  async getStats(req, res) {
    const user_id = req.userId;
    try {
      // Executa duas contagens no banco de dados em paralelo
      const [watchedCount, wishlistCount] = await Promise.all([
        UserMovie.count({ where: { user_id: user_id, watched: true } }),
        UserMovie.count({ where: { user_id: user_id, on_wishlist: true } })
      ]);
      
      // Retorna um JSON simples com os totais
      return res.json({
        watched: watchedCount,
        wishlist: wishlistCount
      });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar estatísticas.', details: error.message });
    }
  }
  
  /**
   * Busca e retorna todos os filmes que o usuário marcou como "Lista de Desejos".
   */
  async getWishlist(req, res) {
    try {
      const wishlist = await UserMovie.findAll({
        where: {
          user_id: req.userId,
          on_wishlist: true // Filtra apenas os que estão na wishlist
        },
        include: [Movie], // Inclui os detalhes do filme
        order: [['updatedAt', 'DESC']]
      });
      return res.json(wishlist);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar wishlist.', details: error.message });
    }
  }

  /**
   * Busca e retorna todos os filmes que o usuário marcou como "Assistidos".
   */
  async getWatched(req, res) {
    try {
      const watchedList = await UserMovie.findAll({
        where: {
          user_id: req.userId,
          watched: true // Filtra apenas os que foram assistidos
        },
        include: [Movie], // Inclui os detalhes do filme
        order: [['updatedAt', 'DESC']]
      });
      return res.json(watchedList);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar lista de assistidos.', details: error.message });
    }
  }

  /**
   * Busca um item específico da biblioteca do usuário (ex: para ver a nota/anotação).
   */
  async getLibraryEntry(req, res) {
    // Pega o ID do filme dos parâmetros da URL (ex: /api/library/tt12345)
    const { imdb_id } = req.params;
    try {
      const entry = await UserMovie.findOne({
        where: {
          user_id: req.userId,
          movie_id: imdb_id // Busca pela combinação do usuário e do filme
        },
        include: [Movie]
      });

      // Se não encontrar, retorna 404
      if (!entry) {
        return res.status(404).json({ error: 'Filme não encontrado na sua biblioteca.' });
      }
      return res.json(entry);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar entrada.', details: error.message });
    }
  }

  /**
   * Remove um filme da biblioteca pessoal do usuário.
   */
  async deleteMovie(req, res) {
    const { imdb_id } = req.params;
    try {
      // Deleta a *relação* (a linha em 'UserMovies')
      const deletedCount = await UserMovie.destroy({
        where: {
          user_id: req.userId,
          movie_id: imdb_id
        }
      });

      // Se 'deletedCount' for 0, o filme não estava na lista
      if (deletedCount === 0) {
        return res.status(404).json({ error: 'Filme não encontrado na sua biblioteca.' });
      }

      // Retorna 204 (No Content), que significa sucesso sem corpo de resposta
      return res.status(204).send(); 

    } catch (error) {
      return res.status(500).json({ error: 'Erro ao remover filme.', details: error.message });
    }
  }
}

// Exporta uma *instância* da classe, pronta para ser usada nas rotas
module.exports = new LibraryController();