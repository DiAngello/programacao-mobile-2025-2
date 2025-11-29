const axios = require('axios');

const tmdbApi = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  params: {
    api_key: process.env.TMDB_API_KEY,
    language: 'pt-BR'
  }
});

const fetchTMDbDetails = async (tmdb_id) => {
  const response = await tmdbApi.get(`/movie/${tmdb_id}`, {
    params: { append_to_response: 'external_ids,credits' } 
  });
  return mapMovieData(response.data);
};

const mapMovieData = (apiMovie) => {
  return {
    ...apiMovie,
    poster: `https://image.tmdb.org/t/p/w500${apiMovie.poster_path}`,
    synopsis: apiMovie.overview,
    rating: apiMovie.vote_average?.toFixed(1) || 'N/A',
  };
};
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
    const { query } = req.query; 
    try {
      const response = await tmdbApi.get('/search/movie', {
        params: { query }
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
      return res.json(response.data);
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
   async getByImdbId(req, res) {
    const { imdb_id } = req.params;

    try {
      const findResponse = await tmdbApi.get(`/find/${imdb_id}`, {
        params: { external_source: 'imdb_id' }
      });
      const foundMovie = findResponse.data.movie_results[0];
      if (!foundMovie || !foundMovie.id) {
        return res.status(404).json({ error: 'Filme não encontrado no TMDb (via find).' });
      }
      const movieDetails = await fetchTMDbDetails(foundMovie.id);
      return res.json(movieDetails);
    } catch (error) {
      return res.status(502).json({ error: 'Erro ao buscar filme por IMDb ID.' });
    }
  }
}

module.exports = new TmdbController();