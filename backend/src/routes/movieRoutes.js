const { Router } = require('express');
const movieController = require('../controllers/movieController'); // OMDb
const tmdbController = require('../controllers/tmdbController'); // TMDb
const authMiddleware = require('../middleware/auth');

// Cria uma nova instância do Router
const router = Router();
// Aplica o middleware de autenticação em TODAS as rotas deste arquivo
router.use(authMiddleware);

// Rota GET para buscar filmes populares (TMDb)
router.get('/popular', tmdbController.getPopular);

// Rota GET para buscar a lista de gêneros/categorias (TMDb)
router.get('/genres', tmdbController.getGenres);

// Rota GET para descobrir filmes por ID de gênero (TMDb)
router.get('/discover', tmdbController.discoverByGenre);

// Rota GET para pesquisar filmes (TMDb)
router.get('/search_tmdb', tmdbController.search);

// Rota GET para buscar detalhes de um filme por ID (TMDb)
router.get('/details/:tmdb_id', tmdbController.getDetails);

// Rota GET para pesquisar filmes (OMDb)
router.get('/search', movieController.search);

// Rota GET para buscar detalhes por IMDb ID (OMDb)
router.get('/:imdb_id', movieController.getDetails);

// Exporta o router configurado
module.exports = router;