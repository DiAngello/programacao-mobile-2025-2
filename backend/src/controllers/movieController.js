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
      params: { append_to_response: 'external_ids,credits,videos' }
    });

    const movie = response.data;
    const imdb_id = movie.external_ids?.imdb_id || null;

    let relation = null;
    if (req.userId && imdb_id) {
      try {
        relation = await UserMovie.findOne({
          where: { user_id: req.userId, movie_id: imdb_id }
        });
      } catch (err) {
        console.warn('Erro ao buscar relação UserMovie:', err.message);
      }
    }

    return res.json({
      ...movie,
      watched: relation?.watched || false,
      on_wishlist: relation?.on_wishlist || false
    });

  } catch (error) {
    console.error('Erro getDetails:', error.response?.data || error.message);
    if (error.response?.status === 404) {
      return res.status(404).json({ error: 'Filme não encontrado no TMDb.' });
    }
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
  
 async searchByCategory(req, res) {
  const { genreId, query } = req.query;

  if (!genreId) {
    return res.status(400).json({ error: 'O parâmetro genreId é obrigatório.' });
  }

  try {
    let results = [];

    if (query && query.trim() !== '') {
      const response = await tmdbApi.get('/search/movie', {
        params: { query: query.trim(), language: 'pt-BR' }
      });

      const movies = Array.isArray(response.data.results) ? response.data.results : [];
      results = movies.filter(movie =>
        Array.isArray(movie.genre_ids) && movie.genre_ids.includes(Number(genreId))
      );
    }

    // Retorna array vazio se não houver resultados, nunca 404
    return res.json(results);

  } catch (err) {
    console.error('Erro searchByCategory:', err.response?.data || err.message);
    return res.status(502).json({ error: 'Erro ao buscar filmes na categoria.' });
  }
}


}

module.exports = new TmdbController();