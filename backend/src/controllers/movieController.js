const axios = require('axios');

const tmdbApi = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  params: {
    api_key: process.env.TMDB_API_KEY,
    language: 'pt-BR' // Traz resultados em português
  }
});

/**
 * Controlador que gerencia a descoberta de filmes (Populares, Gêneros) na API TMDb.
 */
class TmdbController {

  /**
   * Busca os filmes mais populares no TMDb.
   * Rota: GET /api/movies/popular
   */
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
   * Busca filmes no TMDb por um termo de pesquisa.
   * Rota: GET /api/movies/search_tmdb?q=...
   */
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
   * Busca detalhes de um filme específico no TMDb (incluindo o imdb_id).
   * Rota: GET /api/movies/details/:tmdb_id
   */
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
   * Busca a lista oficial de gêneros (categorias) do TMDb.
   * Rota: GET /api/movies/genres
   */
  async getGenres(req, res) {
    try {
      // Busca no endpoint '/genre/movie/list'
      const response = await tmdbApi.get('/genre/movie/list');
      return res.json(response.data.genres); 
    } catch (error) {
      return res.status(502).json({ error: 'Erro ao buscar gêneros no TMDb.' });
    }
  }

  /**
   * Busca filmes populares filtrados por um ID de gênero.
   * Rota: GET /api/movies/discover?genreId=28
   */
  async discoverByGenre(req, res) {
    const { genreId } = req.query;
    if (!genreId) {
      return res.status(400).json({ error: 'O parâmetro genreId é obrigatório.' });
    }
    
    try {
      // Busca no endpoint '/discover/movie' filtrando por 'with_genres'
      const response = await tmdbApi.get('/discover/movie', {
        params: {
          with_genres: genreId,
          sort_by: 'popularity.desc'
        }
      });
      return res.json(response.data.results);
    } catch (error) {
      return res.status(502).json({ error: 'Erro ao descobrir filmes por gênero.' });
    }
  }
}

module.exports = new TmdbController();