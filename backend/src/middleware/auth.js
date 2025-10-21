const jwt = require('jsonwebtoken');

/**
 * Middleware para verificar a autenticação (token JWT) do usuário.
 */
const authMiddleware = async (req, res, next) => {
  // Pega o header 'Authorization' (ex: "Bearer <token>")
  const authHeader = req.headers.authorization;

  // Verifica se o token existe e está formatado como "Bearer "
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido ou mal formatado.' });
  }

  // Extrai apenas o token, removendo a palavra "Bearer "
  const token = authHeader.split(' ')[1];

  try {
    // Decodifica e verifica o token usando o segredo (JWT_SECRET)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Log de depuração (opcional)
    console.log('[authMiddleware] Conteúdo do Token (decoded):', decoded);
    
    // Anexa o ID do usuário (vindo do token) ao objeto 'req'
    req.userId = decoded.id; 

    // Passa a requisição para a próxima função (o controller)
    return next();

  } catch (err) {
    // Captura erros se o token for inválido ou expirado
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
};

// Exporta o middleware
module.exports = authMiddleware;