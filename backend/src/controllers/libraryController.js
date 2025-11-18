const { User, Movie, UserMovie } = require('../models');
const { Op } = require('sequelize');

class LibraryController {

  /**
   * Adiciona ou atualiza um filme na biblioteca do usuário.
   * Rota: POST /api/library
   */
  async upsertMovie(req, res) {
    const userId = req.userId; 
    const { imdb_id, tmdb_id, title, poster_url, status } = req.body;

    console.log(`[Library] Usuário ${userId} está salvando ${imdb_id} como ${status}`);

    if (!imdb_id || !status) {
      return res.status(400).json({ error: 'imdb_id e status são obrigatórios.' });
    }

    try {
      await Movie.findOrCreate({
        where: { imdb_id: imdb_id },
        defaults: {
          imdb_id: imdb_id,
          tmdb_id: tmdb_id,
          title: title,
          poster_url: poster_url, 
        }
      });
      await UserMovie.upsert({
        user_id: userId,
        movie_id: imdb_id, 
        status: status,
        watched: status === 'watched',
        on_wishlist: status === 'wishlist',
      });

      console.log(`[Library] Sucesso ao salvar ${imdb_id} para usuário ${userId}.`);
      return res.status(200).json({ success: true, status: status });

    } catch (error) {
      console.error('❌ [Library] Erro no upsertMovie:', error.message);
      return res.status(500).json({ error: 'Erro ao salvar filme na biblioteca.', details: error.message });
    }
  }

  /**
   * Pega um item específico da biblioteca (para saber o status).
   * Rota: GET /api/library/:imdb_id
   */
  async getLibraryEntry(req, res) {
    const userId = req.userId;
    const { imdb_id } = req.params;

    try {
      const entry = await UserMovie.findOne({
        where: {
          user_id: userId,
          movie_id: imdb_id,
        }
      });

      if (!entry) {
        return res.status(404).json({ error: 'Filme não encontrado na biblioteca.' });
      }

      return res.json(entry);
    } catch (error) {
      console.error('❌ [Library] Erro no getLibraryEntry:', error.message);
      return res.status(500).json({ error: 'Erro ao buscar filme.', details: error.message });
    }
  }

  /**
   * Retorna todos os filmes "assistidos" do usuário.
   * Rota: GET /api/library/watched
   */
  async getWatched(req, res) {
    const userId = req.userId;
    try {
      const movies = await UserMovie.findAll({
        where: { user_id: userId, watched: true },
        include: [{
          model: Movie,
          attributes: ['imdb_id', 'title', 'poster_url', 'publicRating']
        }]
      });
      const mappedMovies = movies.map(m => {
        const movie = m.Movie.toJSON();
        movie.id = movie.imdb_id; // Garante que 'id' exista
        return movie;
      });
      return res.json(mappedMovies);
    } catch (error) {
      console.error('❌ [Library] Erro no getWatched:', error.message);
      return res.status(500).json({ error: 'Erro ao buscar assistidos.', details: error.message });
    }
  }

  /**
   * Retorna todos os filmes da "lista de desejos" do usuário.
   * Rota: GET /api/library/wishlist
   */
  async getWishlist(req, res) {
    const userId = req.userId;
    try {
      const movies = await UserMovie.findAll({
        where: { user_id: userId, on_wishlist: true },
        include: [{
          model: Movie,
          attributes: ['imdb_id', 'title', 'poster_url', 'publicRating']
        }]
      });
      const mappedMovies = movies.map(m => {
        const movie = m.Movie.toJSON();
        movie.id = movie.imdb_id; // Garante que 'id' exista
        return movie;
      });
      return res.json(mappedMovies);
    } catch (error) {
      console.error('❌ [Library] Erro no getWishlist:', error.message);
      return res.status(500).json({ error: 'Erro ao buscar wishlist.', details: error.message });
    }
  }

  /**
   * Remove um filme da biblioteca do usuário.
   * Rota: DELETE /api/library/:imdb_id
   */
  async deleteMovie(req, res) {
    const userId = req.userId;
    const { imdb_id } = req.params;
    try {
      await UserMovie.destroy({
        where: {
          user_id: userId,
          movie_id: imdb_id
        }
      });
      return res.status(200).json({ success: true, message: 'Filme removido.' });
    } catch (error) {
      console.error('❌ [Library] Erro no deleteMovie:', error.message);
      return res.status(500).json({ error: 'Erro ao remover filme.', details: error.message });
    }
  }
  async searchLibrary(req, res) {
    const userId = req.userId;
    const { q } = req.query; // Pega o termo de busca da query URL

    if (!q) {
      return res.json([]); // Retorna vazio se a busca for vazia
    }

    try {
      const movies = await UserMovie.findAll({
        where: { user_id: userId },
        include: [{
          model: Movie,
          // Filtra os filmes incluídos pelo título
          where: {
            title: {
              [Op.iLike]: `%${q}%` // 'iLike' é case-insensitive (só PostgreSQL)
            }
          },
          attributes: ['imdb_id', 'title', 'poster_url', 'publicRating']
        }]
      });
      
      // Mapeia os resultados para o formato correto
      const mappedMovies = movies.map(m => {
        if (!m.Movie) return null;
        const movie = m.Movie.toJSON();
        movie.id = movie.imdb_id;
        return movie;
      }).filter(Boolean);

      return res.json(mappedMovies);

    } catch (error) {
      console.error('❌ [Library] Erro no searchLibrary:', error.message);
      return res.status(500).json({ error: 'Erro ao buscar na biblioteca.', details: error.message });
    }
  }
  
  /**
   * [IMPLEMENTADO] Retorna estatísticas (contagem) do usuário.
   * Rota: GET /api/library/stats
   */
  async getStats(req, res) {
    const userId = req.userId;
    try {
      // Conta os dois em paralelo
      const [watchedCount, wishlistCount] = await Promise.all([
        UserMovie.count({ where: { user_id: userId, watched: true } }),
        UserMovie.count({ where: { user_id: userId, on_wishlist: true } })
      ]);

      return res.json({
        watched: watchedCount,
        wishlist: wishlistCount
      });

    } catch (error) {
      console.error('❌ [Library] Erro no getStats:', error.message);
      return res.status(500).json({ error: 'Erro ao buscar estatísticas.', details: error.message });
    }
  }
}

module.exports = new LibraryController();