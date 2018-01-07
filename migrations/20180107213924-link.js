"use strict"

module.exports = {
  up: (queryInterface, Sequelize) => {
    return [
      queryInterface.createTable("Links", {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          allowNull: false,
          primaryKey: true,
        },
        from: {
          allowNull: false,
          type: Sequelize.STRING(40),
        },
        to: {
          allowNull: false,
          type: Sequelize.STRING(40),
        },
        metadata: {
          allowNull: true,
          type: Sequelize.JSONB,
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
    return [queryInterface.dropTable("Links")]
  },
}
