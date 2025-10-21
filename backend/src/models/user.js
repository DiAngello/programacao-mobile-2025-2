'use strict';
// Importa o Model base do Sequelize e o bcrypt para senhas.
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  // Define a classe 'User' que representa a tabela 'Users'.
  class User extends Model {
    /**
     * Define as associações (relações) do model.
     */
    static associate(models) {
      // Relação 1:N -> Um Usuário pode ter muitas entradas UserMovie (apelido 'library').
      User.hasMany(models.UserMovie, {
        foreignKey: 'user_id',
        as: 'library'
      });
      // Relação N:N -> Um Usuário pode ter muitos Filmes (através de UserMovie).
      User.belongsToMany(models.Movie, {
        through: models.UserMovie,
        foreignKey: 'user_id',
        otherKey: 'movie_id',
        as: 'movies'
      });
    }

    /**
     * Método de instância para verificar se a senha fornecida é correta.
     */
    async isValidPassword(password) {
      // Compara a senha (plaintext) com o hash salvo no banco.
      return bcrypt.compare(password, this.password_hash);
    }
  }
  // Inicializa o model com a definição das colunas da tabela.
  User.init({
    // Coluna 'username' (obrigatória).
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Coluna 'email' (obrigatória, única e validada).
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    // Coluna 'password_hash' (obrigatória).
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize, // Passa a conexão.
    modelName: 'User', // Nome do model.
    // Hooks: Ações automáticas antes de eventos do banco.
    hooks: {
      // Antes de CRIAR um usuário, criptografa a senha.
      beforeCreate: async (user) => {
        if (user.password_hash) {
          user.password_hash = await bcrypt.hash(user.password_hash, 10);
        }
      },
      // Antes de ATUALIZAR, criptografa a senha (apenas se ela mudou).
      beforeUpdate: async (user) => {
        if (user.changed('password_hash')) {
          user.password_hash = await bcrypt.hash(user.password_hash, 10);
        }
      }
    }
  });
  // Retorna a classe User.
  return User;
};