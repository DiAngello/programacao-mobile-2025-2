const { User } = require('../models');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const crypto = require('crypto'); // Adicionado para gerar tokens aleatórios

/**
 * Controlador que gerencia o registro, login, perfil e recuperação de senha dos usuários.
 */
class AuthController {
  async register(req, res) {
    const { username, email, password } = req.body;
    try {
      const user = await User.create({ 
        username, 
        email, 
        password
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
   * Inicia o processo de redefinição de senha (Esqueci minha senha).
   */
  async forgotPassword(req, res) {
    const { email } = req.body;

    try {
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.json({ message: 'Se o email estiver cadastrado, você receberá um link de redefinição.' });
      }

      const token = crypto.randomBytes(20).toString('hex');
      
      const now = new Date();
      now.setHours(now.getHours() + 1);

      await user.update({ 
        passwordResetToken: token, 
        passwordResetExpires: now 
      });

      // 4. Simulação de envio de email (Log no console do servidor)
      console.log(`
        ===================================================
        [RECUPERAÇÃO DE SENHA]
        Para: ${email}
        Token Gerado: ${token}
        Link para resetar: http://localhost:8081/resetPassword?token=${token}
        ===================================================
      `);

      return res.json({ message: 'Se o email estiver cadastrado, você receberá um link de redefinição.' });

    } catch (error) {
      console.error('Erro no forgotPassword:', error);
      return res.status(500).json({ error: 'Erro ao processar solicitação de recuperação de senha.' });
    }
  }

  async resetPassword(req, res) {
    const { token, newPassword } = req.body;

    try {
      const user = await User.findOne({
        where: {
          passwordResetToken: token,
          passwordResetExpires: { [Op.gt]: new Date() } 
        }
      });

      if (!user) {
        return res.status(400).json({ error: 'Token inválido ou expirado.' });
      }

      await user.update({
        password: newPassword,
        passwordResetToken: null,
        passwordResetExpires: null
      });

      return res.json({ message: 'Senha alterada com sucesso!' });

    } catch (error) {
      console.error('Erro no resetPassword:', error);
      return res.status(500).json({ error: 'Erro ao redefinir senha.' });
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
        // Nota: Certifique-se de que seu Model User tem hooks (beforeUpdate) 
        // para hashear essa senha antes de salvar, ou use a lógica de hash aqui.
        updateData.password = password; 
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