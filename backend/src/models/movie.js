'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  // Define a classe 'Movie' que herda de Model
  class Movie extends Model {
    /**
     * Define as associações (relações) do model.
     */
    static associate(models) {
      // Relação 1:N -> Um Filme pode ter muitas entradas UserMovie
      Movie.hasMany(models.UserMovie, {
        foreignKey: 'movie_id',
        as: 'userEntries'
      });
      // Relação N:N -> Um Filme pertence a muitos Usuários (através de UserMovie)
      Movie.belongsToMany(models.User, {
        through: models.UserMovie,
        foreignKey: 'movie_id',
        otherKey: 'user_id',
        as: 'users'
      });
    }
  }
  // Inicializa o model com a definição das colunas da tabela 'Movies'
  Movie.init({
    // Define 'imdb_id' como chave primária (string)
    imdb_id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    // Define a coluna 'title' (obrigatória)
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Define as colunas restantes (poster, ano, gêneros, etc.)
    poster_url: DataTypes.STRING,
    year: DataTypes.INTEGER,
    genres: DataTypes.STRING, 
    actors: DataTypes.TEXT,
    director: DataTypes.STRING,     
    publicRating: DataTypes.STRING
  }, {
    sequelize, // Passa a instância da conexão
    modelName: 'Movie', // Define o nome do model
  });
  // Retorna a classe Movie
  return Movie;
};