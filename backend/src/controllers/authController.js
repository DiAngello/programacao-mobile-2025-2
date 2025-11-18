const { User } = require('../models');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

/**
 * Controlador que gerencia o registro, login e perfil dos usuários.
 */
class AuthController {
  
  /**
   * Registra um novo usuário no banco de dados.
   */
  async register(req, res) {
    // Pega os dados (username, email, password) do corpo da requisição
    const { username, email, password } = req.body;
    try {
      // Cria um novo usuário no banco (o hook no Model User irá hashear a senha)
      const user = await User.create({ 
        username, 
        email, 
        password_hash: password
      });

      // Cria um token JWT assinado com o ID do novo usuário, válido por 7 dias
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
      });

      // Remove o hash da senha do objeto antes de enviá-lo como resposta
      user.password_hash = undefined;
      // Retorna 201 (Created) com os dados do usuário e o token
      return res.status(201).json({ user, token });

    } catch (error) {
      // Se o erro for de violação de chave única (ex: email duplicado)
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ error: 'Email já cadastrado.' });
      }
      // Para qualquer outro erro
      return res.status(500).json({ error: 'Erro ao registrar usuário.', details: error.message });
    }
  }

  /**
   * Autentica um usuário existente usando email/username e senha.
   */
  async login(req, res) {
    // Pega o email (que pode ser email ou username) e a senha
    const { email, password } = req.body; 
    try {
      // Procura um usuário onde o 'email' OU o 'username' correspondem ao enviado
      const user = await User.findOne({ 
        where: {
          [Op.or]: [
            { email: email },
            { username: email } // Permite login com username ou email
          ]
        } 
      });
      // Se nenhum usuário for encontrado
      if (!user) {
        return res.status(401).json({ error: 'Usuário ou email não encontrado.' });
      }
      // Verifica se a senha enviada é correta (usando a função 'isValidPassword' do Model)
      if (!(await user.isValidPassword(password))) {
        return res.status(401).json({ error: 'Senha incorreta.' });
      }
      // Se a senha estiver correta, gera um novo token JWT
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
      });
      // Remove o hash da senha da resposta
      user.password_hash = undefined;
      // Retorna 200 (OK) com os dados do usuário e o token
      return res.json({ user, token });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao fazer login.', details: error.message });
    }
  }

  /**
   * Busca e retorna os dados do perfil do usuário atualmente logado.
   */
  async getProfile(req, res) {
    try {
      // Busca o usuário pelo ID (req.userId) que foi injetado pelo authMiddleware
      const user = await User.findByPk(req.userId, {
        // Seleciona apenas os campos públicos
        attributes: ['id', 'username', 'email']
      });
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }
      return res.json(user);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar perfil.', details: error.message });
    }
  }

  /**
   * Atualiza as informações do perfil (username, email, senha) do usuário logado.
   */
  async updateProfile(req, res) {
    // Pega os dados a serem atualizados do corpo da requisição
    const { username, email, password } = req.body;
    try {
      // Busca o usuário logado
      const user = await User.findByPk(req.userId);

      // Se o email foi alterado, verifica se o novo email já está em uso
      if (email && email !== user.email) {
        const emailExists = await User.findOne({ where: { email } });
        if (emailExists) {
          return res.status(400).json({ error: 'Email já está em uso.' });
        }
      }

      // Prepara os dados para atualização
      const updateData = { username, email };
      // Se o campo 'password' foi enviado (para "Nova Senha"), adiciona ao update
      if (password) {
        updateData.password_hash = password; // O hook do Model irá hashear
      }

      // Salva as alterações no banco
      await user.update(updateData);
      // Remove o hash da senha da resposta
      user.password_hash = undefined;
      return res.json(user);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao atualizar perfil.', details: error.message });
    }
  }

}

// Exporta uma nova instância do controlador
module.exports = new AuthController();