const { Router } = require('express');
const libraryController = require('../controllers/libraryController');
const authMiddleware = require('../middleware/auth');

const router = Router();
router.use(authMiddleware);

router.get('/search', libraryController.searchLibrary);
router.get('/stats', libraryController.getStats);
router.get('/wishlist', libraryController.getWishlist);
router.get('/watched', libraryController.getWatched);
router.get('/:imdb_id', libraryController.getLibraryEntry);
router.delete('/:imdb_id', libraryController.deleteMovie);
router.post('/upsert', libraryController.upsertMovie.bind(libraryController));

module.exports = router;
