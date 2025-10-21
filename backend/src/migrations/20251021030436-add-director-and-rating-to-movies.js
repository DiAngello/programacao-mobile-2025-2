'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Movies', 'director', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Movies', 'publicRating', {
      type: Sequelize.STRING, 
      allowNull: true,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Movies', 'director');
    await queryInterface.removeColumn('Movies', 'publicRating');
  }
};