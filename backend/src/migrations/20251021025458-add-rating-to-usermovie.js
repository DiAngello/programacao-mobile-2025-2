'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('UserMovies', 'rating', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('UserMovies', 'rating');
  }
};