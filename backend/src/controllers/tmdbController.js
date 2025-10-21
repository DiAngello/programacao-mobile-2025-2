const axios = require('axios');

// Cria uma instância 'axios' pré-configurada para a API TMDb
const tmdbApi = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  params: {
    api_key: process.env.TMDB_API_KEY,
    language: 'pt-BR' // Traz resultados em português
  }
});

/**
 * Controlador para buscar dados de descoberta de filmes (Populares, Gêneros) na TMDb.
 */
class TmdbController {

  /**
   * Busca os filmes atualmente populares no TMDb.
   */
  // Rota: GET /api/movies/popular
  async getPopular(req, res) {
    try {
      // Busca o endpoint '/movie/popular'
      const response = await tmdbApi.get('/movie/popular');
      return res.json(response.data.results);
    } catch (error) {
      return res.status(502).json({ error: 'Erro ao buscar populares no TMDb.' });
    }
  }

  /**
   * Procura filmes no TMDb com base em um termo de pesquisa (query).
   */
  // Rota: GET /api/movies/search_tmdb?q=...
  async search(req, res) {
    const { q } = req.query;
    try {
      // Busca no endpoint '/search/movie' usando a query 'q'
      const response = await tmdbApi.get('/search/movie', {
        params: { query: q }
      });
      return res.json(response.data.results);
    } catch (error) {
      return res.status(502).json({ error: 'Erro ao buscar no TMDb.' });
    }
  }

  /**
   * Busca os detalhes completos de um filme, incluindo o 'imdb_id' (via external_ids).
   */
  // Rota: GET /api/movies/details/:tmdb_id
  async getDetails(req, res) {
    const { tmdb_id } = req.params;
    try {
      // Busca o filme e solicita 'external_ids' (para obter o imdb_id)
      const response = await tmdbApi.get(`/movie/${tmdb_id}`, {
        params: { append_to_response: 'external_ids' }
      });
      return res.json(response.data);
    } catch (error) {
      return res.status(502).json({ error: 'Erro ao buscar detalhes no TMDb.' });
    }
  }

  /**
   * Obtém a lista oficial de todos os gêneros (categorias) da TMDb.
   */
  // Rota: GET /api/movies/genres
  async getGenres(req, res) {
    try {
      // Busca no endpoint '/genre/movie/list'
      const response = await tmdbApi.get('/genre/movie/list');
      // A resposta vem em { genres: [...] }
      return res.json(response.data.genres); 
    } catch (error) {
      return res.status(502).json({ error: 'Erro ao buscar gêneros no TMDb.' });
    }
  }

  /**
   * Descobre filmes populares filtrados por um ID de gênero específico.
   */
  // Rota: GET /api/movies/discover?genreId=28
  async discoverByGenre(req, res) {
    const { genreId } = req.query;
    // Valida se o ID do gênero foi enviado
    if (!genreId) {
      return res.status(400).json({ error: 'O parâmetro genreId é obrigatório.' });
    }
    
    try {
      // Busca no endpoint '/discover/movie' filtrando por 'with_genres'
      const response = await tmdbApi.get('/discover/movie', {
        params: {
          with_genres: genreId,
          sort_by: 'popularity.desc' // Opcional: ordenar por popularidade
        }
      });
      return res.json(response.data.results);
    } catch (error) {
      return res.status(502).json({ error: 'Erro ao descobrir filmes por gênero.' });
    }
  }
}

// Exporta uma instância do controlador para ser usada nas rotas
module.exports = new TmdbController();