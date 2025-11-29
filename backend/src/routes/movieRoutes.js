const { Router } = require('express');
const movieController = require('../controllers/movieController'); // OMDb
const tmdbController = require('../controllers/tmdbController'); // TMDb
const authMiddleware = require('../middleware/auth');

const router = Router();
router.use(authMiddleware);

router.get('/popular', tmdbController.getPopular);
router.get('/genres', tmdbController.getGenres);
router.get('/discover', tmdbController.discoverByGenre);
router.get('/search_tmdb', tmdbController.search);
router.get('/imdb/:imdb_id', tmdbController.getByImdbId);
router.get('/details/:tmdb_id', tmdbController.getDetails);
router.get('/search', movieController.search);
router.get('/:imdb_id', movieController.getDetails);

module.exports = router;