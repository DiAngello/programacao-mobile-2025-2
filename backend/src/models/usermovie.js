'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  // Define a classe 'UserMovie' (tabela de junção).
  class UserMovie extends Model {
    /**
     * Define as associações (relações) desta tabela.
     */
    static associate(models) {
      // Esta tabela pertence a um Usuário.
      UserMovie.belongsTo(models.User, { foreignKey: 'user_id' });
      // Esta tabela pertence a um Filme.
      UserMovie.belongsTo(models.Movie, { foreignKey: 'movie_id' });
    }
  }
  // Inicializa o model com a definição das colunas.
  UserMovie.init({
    // Chave estrangeira para 'Users', obrigatória.
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      onDelete: 'CASCADE' // Deleta a entrada se o usuário for deletado.
    },
    // Chave estrangeira para 'Movies', obrigatória.
    movie_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'Movies',
        key: 'imdb_id'
      },
      onDelete: 'CASCADE' // Deleta a entrada se o filme for deletado.
    },
    // Coluna para status 'assistido' (booleano).
    watched: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    // Coluna para status 'lista de desejos' (booleano).
    on_wishlist: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    // Coluna para anotações pessoais (texto).
    notes: DataTypes.TEXT,
    // Coluna para nota (1-5), com validação.
    rating: { 
      type: DataTypes.INTEGER,
      validate: {
        min: 1,
        max: 5
      }
    }
  }, {
    sequelize, // Passa a conexão.
    modelName: 'UserMovie', // Nome do model.
    // Garante que a combinação 'user_id' e 'movie_id' seja única.
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'movie_id']
      }
    ]
  });
  // Retorna a classe UserMovie.
  return UserMovie;
};