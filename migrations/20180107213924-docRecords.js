"use strict"

module.exports = {
  up: (queryInterface, Sequelize) => {
    return [
      queryInterface.createTable("DocRecords", {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          allowNull: false,
          primaryKey: true,
        },
        docId: {
          allowNull: false,
          type: Sequelize.STRING(40),
          references: {
            model: "Docs",
            key: "id",
          },
        },
        recordId: {
          allowNull: false,
          type: Sequelize.STRING,
          references: {
            model: "Records",
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
    return [queryInterface.dropTable("DocRecords")]
  },
}
