"use strict"

module.exports = {
  up: (queryInterface, Sequelize) => {
    return [
      queryInterface.createTable("UserSessions", {
        id: {
          type: Sequelize.STRING,
          allowNull: false,
          primaryKey: true,
        },
        user: {
          allowNull: false,
          type: Sequelize.STRING,
          references: {
            model: "Users",
            key: "id",
          },
        },
        secret: {
          // checksum
          allowNull: false,
          type: Sequelize.STRING,
        },
        logoutToken: {
          // checksum
          allowNull: false,
          type: Sequelize.STRING,
        },
        ip: {
          allowNull: false,
          type: Sequelize.STRING,
        },
        authMethod: {
          allowNull: false,
          type: Sequelize.STRING,
          references: {
            model: "AuthMethods",
            key: "id",
          },
        },
        createdAt: {
          type: Sequelize.DATE,
        },
        updatedAt: {
          type: Sequelize.DATE,
        },
      }),
    ]
  },

  down: (queryInterface, Sequelize) => {
    return [queryInterface.dropTable("UserSessions")]
  },
}
