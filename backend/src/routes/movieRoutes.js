const { Router } = require('express');
const movieController = require('../controllers/movieController'); 
const tmdbController = require('../controllers/tmdbController'); 
const authMiddleware = require('../middleware/auth');

const router = Router();
router.use(authMiddleware);

router.get('/popular', tmdbController.getPopular);
router.get('/genres', tmdbController.getGenres);
router.get('/discover', tmdbController.discoverByGenre);
router.get('/search_tmdb', tmdbController.search);
router.get('/search', movieController.search);
router.get('/search_by_category', movieController.searchByCategory); 

router.get('/details/:tmdb_id', tmdbController.getDetails);
router.get('/imdb/:imdb_id', tmdbController.getByImdbId);

router.get('/:tmdb_id', tmdbController.getDetails); 

module.exports = router;