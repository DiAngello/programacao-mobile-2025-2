'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Movie extends Model {
    static associate(models) {
      Movie.hasMany(models.UserMovie, {
        foreignKey: 'movie_id',
        as: 'userEntries'
      });

      Movie.belongsToMany(models.User, {
        through: models.UserMovie,
        foreignKey: 'movie_id',
        otherKey: 'user_id',
        as: 'users'
      });
    }
  }

  Movie.init({
    id: {             
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  imdb_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true        
  },
  tmdb_id: DataTypes.STRING,
  title: DataTypes.STRING,
  poster_url: DataTypes.STRING,
  year: DataTypes.STRING,
  genres: DataTypes.ARRAY(DataTypes.STRING),
  actors: DataTypes.TEXT,
  director: DataTypes.STRING,
  public_rating: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Movie'
  });

  return Movie;
};
