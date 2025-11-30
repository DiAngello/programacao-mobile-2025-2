const { Router } = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const { body } = require('express-validator');

const router = Router();

router.post(
  '/register',
  [
    body('username').notEmpty().withMessage('Nome de usuário é obrigatório.'),
    body('email').isEmail().withMessage('Email inválido.'),
    body('password').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres.')
  ],
  authController.register 
);
router.post(
  '/login',
  [
    body('email').notEmpty().withMessage('Email ou usuário é obrigatório.'),
    body('password').notEmpty().withMessage('Senha é obrigatória.')
  ],
  authController.login 
);
router.post('/forgot_password', authController.forgotPassword);
router.post('/reset_password', authController.resetPassword);
router.get('/me', authMiddleware, authController.getProfile);
router.put('/me', authMiddleware, authController.updateProfile);

module.exports = router;