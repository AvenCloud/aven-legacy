"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return [
      queryInterface.createTable("AuthMethods", {
        id: {
          type: Sequelize.STRING,
          primaryKey: true
        },
        type: {
          type: Sequelize.ENUM("PHONE", "EMAIL"),
          allowNull: false
        },
        owner: {
          allowNull: false,
          type: Sequelize.STRING,
          references: {
            model: "Users",
            key: "id"
          }
        },
        primaryOwner: {
          unique: true,
          type: Sequelize.STRING,
          references: {
            model: "Users",
            key: "id"
          }
        },
        verificationKey: {
          // verification is incomplete unless this is empty!
          type: Sequelize.STRING
        },
        verificationExpiration: {
          type: Sequelize.TIME
        },
        createdAt: {
          type: Sequelize.DATE
        },
        updatedAt: {
          type: Sequelize.DATE
        }
      }),
      queryInterface.createTable("UserTokens", {
        user: {
          type: Sequelize.STRING,
          allowNull: false,
          references: {
            model: "Users",
            key: "id"
          }
        },
        expiryTime: {
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
      queryInterface.dropTable("AuthenticationMethods"),
      queryInterface.dropTable("UserTokens")
    ];
  }
};
