"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return [
      queryInterface.createTable(
        "Docs",
        {
          id: {
            type: Sequelize.STRING(40),
            allowNull: false,
            primaryKey: true
          },
          value: {
            allowNull: false,
            type: Sequelize.JSONB
          },
          associatedRecord: {
            allowNull: false,
            type: Sequelize.STRING
          },
          size: {
            type: Sequelize.INTEGER,
            allowNull: false
          },
          uploader: {
            type: Sequelize.STRING,
            allowNull: false,
            references: {
              model: "Users",
              key: "id"
            }
          },

          createdAt: {
            type: Sequelize.DATE
          },
          updatedAt: {
            type: Sequelize.DATE
          }
        },
        {
          indexes: [
            {
              fields: ["associatedRecord"]
            }
          ]
        }
      )
    ];
  },

  down: (queryInterface, Sequelize) => {
    return [queryInterface.dropTable("Docs")];
  }
};
