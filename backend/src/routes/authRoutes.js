const { Router } = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const { body } = require('express-validator');

// Cria uma nova instância do Router.
const router = Router();

// Rota POST para registrar (com validação de corpo).
router.post(
  '/register',
  [
    // Valida 'username', 'email' e 'password'.
    body('username').notEmpty().withMessage('Nome de usuário é obrigatório.'),
    body('email').isEmail().withMessage('Email inválido.'),
    body('password').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres.')
  ],
  authController.register // Chama a função 'register' do controller.
);

// Rota POST para login (com validação de corpo).
router.post(
  '/login',
  [
    // Valida 'email' e 'password'.
    body('email').notEmpty().withMessage('Email ou usuário é obrigatório.'),
    body('password').notEmpty().withMessage('Senha é obrigatória.')
  ],
  authController.login // Chama a função 'login' do controller.
);

// Rota GET para buscar o perfil (protegida pelo authMiddleware).
router.get('/me', authMiddleware, authController.getProfile);
// Rota PUT para atualizar o perfil (protegida pelo authMiddleware).
router.put('/me', authMiddleware, authController.updateProfile);

module.exports = router;