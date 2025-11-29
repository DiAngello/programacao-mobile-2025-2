const axios = require('axios');

const tmdbApi = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  params: {
    api_key: process.env.TMDB_API_KEY,
    language: 'pt-BR' 
  }
});

/**
 * Controlador que gerencia a descoberta de filmes (Populares, Gêneros) na API TMDb.
 */
class TmdbController {

  async getPopular(req, res) {
    try {
      const response = await tmdbApi.get('/movie/popular');
      return res.json(response.data.results);
    } catch (error) {
      return res.status(502).json({ error: 'Erro ao buscar populares no TMDb.' });
    }
  }

  async search(req, res) {
    const { q } = req.query;
    try {
      const response = await tmdbApi.get('/search/movie', {
        params: { query: q }
      });
      return res.json(response.data.results);
    } catch (error) {
      return res.status(502).json({ error: 'Erro ao buscar no TMDb.' });
    }
  }

  async getDetails(req, res) {
  const { tmdb_id } = req.params;

  try {
    const response = await tmdbApi.get(`/movie/${tmdb_id}`, {
      params: { append_to_response: 'external_ids' }
    });

    const movie = response.data;
    const imdb_id = movie.external_ids.imdb_id;

    let relation = null;
    if (req.userId && imdb_id) {
      relation = await UserMovie.findOne({
        where: {
          user_id: req.userId,
          movie_id: imdb_id
        }
      });
    }

    return res.json({
      ...movie,
      watched: relation?.watched || false,
      on_wishlist: relation?.on_wishlist || false
    });

  } catch (error) {
    return res.status(502).json({ error: 'Erro ao buscar detalhes no TMDb.' });
  }
}

  async getGenres(req, res) {
    try {
      const response = await tmdbApi.get('/genre/movie/list');
      return res.json(response.data.genres); 
    } catch (error) {
      return res.status(502).json({ error: 'Erro ao buscar gêneros no TMDb.' });
    }
  }

  async discoverByGenre(req, res) {
    const { genreId } = req.query;
    if (!genreId) {
      return res.status(400).json({ error: 'O parâmetro genreId é obrigatório.' });
    }
    
    try {
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