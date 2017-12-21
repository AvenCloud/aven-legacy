"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return [
      queryInterface.createTable("RecordPermissions", {
        record: {
          allowNull: false,
          type: Sequelize.STRING,
          references: {
            model: "Records",
            key: "id"
          }
        },
        user: {
          allowNull: false,
          type: Sequelize.STRING,
          references: {
            model: "Users",
            key: "id"
          }
        },
        permission: {
          allowNull: false,
          type: Sequelize.ENUM("ADMIN", "WRITE", "READ", "DENY")
        },
        createdAt: {
          type: Sequelize.DATE
        },
        updatedAt: {
          type: Sequelize.DATE
        }
      }),
      queryInterface.createTable("RecordTokens", {
        record: {
          allowNull: false,
          type: Sequelize.STRING,
          references: {
            model: "Records",
            key: "id"
          }
        },
        secret: {
          // checksum
          allowNull: false,
          type: Sequelize.STRING
        },
        expiryTime: {
          allowNull: false,
          type: Sequelize.TIME
        },
        permission: {
          allowNull: false,
          type: Sequelize.ENUM("WRITE", "READ", "NONE")
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
    return [
      queryInterface.dropTable("RecordPermissions"),
      queryInterface.dropTable("RecordTokens")
    ];
  }
};
