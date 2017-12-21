"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return [
      queryInterface.createTable("Users", {
        id: {
          type: Sequelize.STRING,
          primaryKey: true
        },
        displayName: {
          type: Sequelize.STRING,
          allowNull: false
        },
        password: {
          // checksum
          allowNull: false,
          type: Sequelize.STRING
        },
        createdAt: {
          type: Sequelize.DATE
        },
        updatedAt: {
          type: Sequelize.DATE
        }
      })
    ];
  },

  down: (queryInterface, Sequelize) => {
    return [queryInterface.dropTable("Users")];
  }
};
