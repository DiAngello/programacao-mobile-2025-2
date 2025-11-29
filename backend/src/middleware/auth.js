const jwt = require('jsonwebtoken');

/**
 * Middleware para verificar a autenticação (token JWT) do usuário.
 */
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido ou mal formatado.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('[authMiddleware] Conteúdo do Token (decoded):', decoded);
    req.userId = decoded.id; 
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
};

module.exports = authMiddleware;