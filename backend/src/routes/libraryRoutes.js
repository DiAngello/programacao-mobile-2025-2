const { Router } = require('express');
const libraryController = require('../controllers/libraryController');
const authMiddleware = require('../middleware/auth');

// Cria uma nova instância do Router
const router = Router();
// Aplica o middleware de autenticação em TODAS as rotas deste arquivo
router.use(authMiddleware);

// Rota GET para pesquisar na biblioteca 
router.get('/search', libraryController.searchLibrary);
// Rota GET para obter estatísticas (contagem) do usuário 
router.get('/stats', libraryController.getStats);
// Rota GET para obter a lista de desejos (ex: /api/library/wishlist)
router.get('/wishlist', libraryController.getWishlist);
// Rota GET para obter os filmes assistidos (ex: /api/library/watched)
router.get('/watched', libraryController.getWatched);
// Rota GET para obter um item específico (ex: /api/library/tt12345)
router.get('/:imdb_id', libraryController.getLibraryEntry);

// Rota POST para adicionar ou atualizar um filme 
router.post('/', libraryController.upsertMovie);
// Rota DELETE para remover um filme 
router.delete('/:imdb_id', libraryController.deleteMovie);

// Exporta o router configurado
module.exports = router;