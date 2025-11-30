'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.UserMovie, {
        foreignKey: 'user_id',
        as: 'library'
      });

      User.belongsToMany(models.Movie, {
        through: models.UserMovie,
        foreignKey: 'user_id',
        otherKey: 'movie_id',
        as: 'movies'
      });
    }

    async isValidPassword(password) {
      return bcrypt.compare(password, this.password_hash);
    }
  }

  User.init({
    username: DataTypes.STRING,

    email: {
      type: DataTypes.STRING,
      unique: true
    },

    password_hash: DataTypes.STRING,

    password: {
      type: DataTypes.VIRTUAL,
      set(value) {
        this.setDataValue('password', value);
        const hash = bcrypt.hashSync(value, 10);
        this.setDataValue('password_hash', hash);
      }
    }

  }, {
    sequelize,
    modelName: 'User'
  });

  return User;
};
