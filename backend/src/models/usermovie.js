'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserMovie extends Model {
    static associate(models) {
      UserMovie.belongsTo(models.User, { foreignKey: 'user_id' });
      UserMovie.belongsTo(models.Movie, { foreignKey: 'movie_id' });
    }
  }

  UserMovie.init(
  {
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    movie_id: { type: DataTypes.INTEGER, allowNull: false },
    watched: { type: DataTypes.BOOLEAN, defaultValue: false },
    on_wishlist: { type: DataTypes.BOOLEAN, defaultValue: false },
    rating: { type: DataTypes.FLOAT, allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    sequelize,
    modelName: 'UserMovie',
    tableName: 'UserMovies',
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'movie_id']
      }
    ]
  }
);


  return UserMovie;
};
