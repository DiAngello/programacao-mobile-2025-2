'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserMovies', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      movie_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'Movies',
          key: 'imdb_id'
        },
        onDelete: 'CASCADE'
      },
      watched: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      on_wishlist: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      notes: {
        type: Sequelize.TEXT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    await queryInterface.addIndex('UserMovies', ['user_id', 'movie_id'], {
      unique: true,
      name: 'user_movie_unique_index'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('UserMovies');
  }
};