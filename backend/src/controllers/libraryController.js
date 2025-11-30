const { User, Movie, UserMovie } = require('../models');
const { Op } = require('sequelize');

class LibraryController {

  createMovieIfNotExists = async ({ imdb_id, tmdb_id, title, poster_url, publicRating }) => {
    let movie = await Movie.findOne({ where: { imdb_id } });
    if (!movie) {
      movie = await Movie.create({ imdb_id, tmdb_id, title, poster_url, publicRating });
    }
    return movie;
  }

  saveMovieToLibrary = async (userId, movie, status) => {
    const watched = status === 'watched';
    const on_wishlist = status === 'wishlist';

    let entry = await UserMovie.findOne({
      where: { user_id: userId, movie_id: movie.id }
    });

    if (!entry) {
      entry = await UserMovie.create({
        user_id: userId,
        movie_id: movie.id,
        status,
        watched,
        on_wishlist
      });
    } else {
      entry.status = status;
      entry.watched = watched;
      entry.on_wishlist = on_wishlist;
      await entry.save();
    }

    return entry;
  }

  async upsertMovie(req, res) {
  const userId = req.userId;
  const { imdb_id, tmdb_id, title, poster_url, status, rating, notes } = req.body;

  if (!imdb_id || !status) {
    return res.status(400).json({ error: 'imdb_id e status são obrigatórios.' });
  }

  try {
    const [movie] = await Movie.findOrCreate({
      where: { imdb_id },
      defaults: { imdb_id, tmdb_id, title, poster_url }
    });

    const [entry] = await UserMovie.upsert(
      {
        user_id: userId,
        movie_id: movie.id,
        watched: status === 'watched',
        on_wishlist: status === 'wishlist',
        rating: rating || null,
        notes: notes || null,
      },
      { returning: true }
    );

    const updatedEntry = await UserMovie.findOne({
      where: { user_id: userId, movie_id: movie.id }
    });

    return res.json(updatedEntry);
  } catch (error) {
    console.error('❌ Erro no upsertMovie:', error);
    return res.status(500).json({ error: 'Erro ao salvar filme na biblioteca.', details: error.message });
  }
}

  getLibraryEntry = async (req, res) => {
    const userId = req.userId;
    const { imdb_id } = req.params;

    try {
      const movie = await Movie.findOne({ where: { imdb_id } });
      if (!movie) return res.status(404).json({ error: 'Filme não encontrado.' });

      const entry = await UserMovie.findOne({
        where: { user_id: userId, movie_id: movie.id }
      });

      if (!entry) return res.status(404).json({ error: 'Filme não encontrado na biblioteca.' });

      return res.json(entry);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar filme.', details: error.message });
    }
  }

  getWatched = async (req, res) => {
    const userId = req.userId;
    try {
      const movies = await UserMovie.findAll({
        where: { user_id: userId, watched: true },
        include: [{
          model: Movie,
          attributes: ['imdb_id', 'title', 'poster_url', 'publicRating']
        }],
        attributes: ['rating', 'notes'] // <-- adicionado
      });

      return res.json(
        movies.map(m => ({
          ...m.Movie.dataValues,
          rating: m.rating,
          notes: m.notes
        }))
      );
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar assistidos.', details: error.message });
    }
  }

  getWishlist = async (req, res) => {
    const userId = req.userId;
    try {
      const movies = await UserMovie.findAll({
        where: { user_id: userId, on_wishlist: true },
        include: [{
          model: Movie,
          attributes: ['imdb_id', 'title', 'poster_url', 'publicRating']
        }]
      });

      return res.json(movies.map(m => m.Movie));
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar wishlist.', details: error.message });
    }
  }

  deleteMovie = async (req, res) => {
    const userId = req.userId;
    const { imdb_id } = req.params;

    try {
      const movie = await Movie.findOne({ where: { imdb_id } });
      if (!movie) return res.status(200).json({ success: true });

      await UserMovie.destroy({
        where: { user_id: userId, movie_id: movie.id }
      });

      return res.status(200).json({ success: true, message: 'Filme removido.' });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao remover filme.', details: error.message });
    }
  }

  searchLibrary = async (req, res) => {
    const userId = req.userId;
    const { q } = req.query;

    if (!q) return res.json([]);

    try {
      const movies = await UserMovie.findAll({
        where: { user_id: userId },
        include: [{
          model: Movie,
          where: { title: { [Op.iLike]: `%${q}%` } },
          attributes: ['imdb_id', 'title', 'poster_url', 'publicRating']
        }]
      });

      return res.json(movies.map(m => m.Movie));
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar na biblioteca.', details: error.message });
    }
  }

  getStats = async (req, res) => {
    const userId = req.userId;
    try {
      const [watchedCount, wishlistCount] = await Promise.all([
        UserMovie.count({ where: { user_id: userId, watched: true } }),
        UserMovie.count({ where: { user_id: userId, on_wishlist: true } })
      ]);

      return res.json({ watched: watchedCount, wishlist: wishlistCount });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar estatísticas.', details: error.message });
    }
  }
}

module.exports = new LibraryController();
