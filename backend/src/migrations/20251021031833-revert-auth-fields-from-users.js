'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'googleId');
    await queryInterface.removeColumn('Users', 'resetPasswordToken');
    await queryInterface.removeColumn('Users', 'resetPasswordExpires');

    await queryInterface.changeColumn('Users', 'password_hash', {
      type: Sequelize.STRING,
      allowNull: false, 
    });
  },
  async down(queryInterface, Sequelize) {
  }
};