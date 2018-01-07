"use strict"

module.exports = {
  up: (queryInterface, Sequelize) => {
    return [
      queryInterface.createTable("Records", {
        id: {
          allowNull: false,
          type: Sequelize.STRING,
          primaryKey: true,
        },
        doc: {
          allowNull: true,
          type: Sequelize.STRING,
          references: {
            model: "Docs",
            key: "id",
          },
        },
        owner: {
          allowNull: false,
          type: Sequelize.STRING,
          references: {
            model: "Users",
            key: "id",
          },
        },
        permission: {
          allowNull: false,
          type: Sequelize.ENUM("PUBLIC", "PRIVATE"),
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
    return [queryInterface.dropTable("Records")]
  },
}
