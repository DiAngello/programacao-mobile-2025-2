'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Movies', 'genres', {
      type: Sequelize.STRING, 
      allowNull: true,
    });
    await queryInterface.addColumn('Movies', 'actors', {
      type: Sequelize.TEXT, 
      allowNull: true,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Movies', 'genres');
    await queryInterface.removeColumn('Movies', 'actors');
  }
};