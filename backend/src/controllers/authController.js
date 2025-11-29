const { User } = require('../models');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

/**
 * Controlador que gerencia o registro, login e perfil dos usuários.
 */
class AuthController {
  async register(req, res) {
    const { username, email, password } = req.body;
    try {
      const user = await User.create({ 
        username, 
        email, 
        password_hash: password
      });

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
      });

      user.password_hash = undefined;
      return res.status(201).json({ user, token });

    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ error: 'Email já cadastrado.' });
      }
      return res.status(500).json({ error: 'Erro ao registrar usuário.', details: error.message });
    }
  }

  /**
   * Autentica um usuário existente usando email/username e senha.
   */
  async login(req, res) {
    const { email, password } = req.body; 
    try {
      const user = await User.findOne({ 
        where: {
          [Op.or]: [
            { email: email },
            { username: email } 
          ]
        } 
      });
      if (!user) {
        return res.status(401).json({ error: 'Usuário ou email não encontrado.' });
      }
      if (!(await user.isValidPassword(password))) {
        return res.status(401).json({ error: 'Senha incorreta.' });
      }
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
      });
      user.password_hash = undefined;
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
      const user = await User.findByPk(req.userId, {
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
    const { username, email, password } = req.body;
    try {
      const user = await User.findByPk(req.userId);

      if (email && email !== user.email) {
        const emailExists = await User.findOne({ where: { email } });
        if (emailExists) {
          return res.status(400).json({ error: 'Email já está em uso.' });
        }
      }

      const updateData = { username, email };
      if (password) {
        updateData.password_hash = password; 
      }

      await user.update(updateData);
      user.password_hash = undefined;
      return res.json(user);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao atualizar perfil.', details: error.message });
    }
  }

}

module.exports = new AuthController();