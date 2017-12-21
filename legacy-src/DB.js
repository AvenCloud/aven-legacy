const pg = require("pg");

const url = require("url");
const denodeify = require("denodeify");
const Sequelize = require("sequelize");
import Configuration from "./Configuration";

let sequelize = null;

const params = url.parse(Configuration.DATABASE_URL);
const auth = params.auth.split(":");
const database = params.pathname.split("/")[1];

const shouldUseSSL = Configuration.POSTGRES_DANGER_DISABLE_SSL ? false : true;

const Model = {};

async function init() {
  sequelize = new Sequelize(
    database,
    auth[0],
    auth[1], {
      dialect: "postgres",
      host: params.hostname,
      port: params.port,
      dialectOptions: {
        ssl: shouldUseSSL
      }
    }
  );
  Model.User = sequelize.define("user", {
    id: {
      type: Sequelize.STRING,
      primaryKey: true,
    },
    displayName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    password: {
      // checksum
      allowNull: false,
      type: Sequelize.STRING
    }
  });
  Model.AuthenticationMethod = sequelize.define('authenticationmethod', {
    id: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    type: {
      type: Sequelize.ENUM('PHONE', 'EMAIL'),
      allowNull: false,
    },
    owner: {
      allowNull: false,
      type: Sequelize.STRING,
      references: {
        model: Model.User,
        key: 'id'
      }
    },
    primaryOwner: {
      unique: true,
      type: Sequelize.STRING,
      references: {
        model: Model.User,
        key: 'id'
      }
    },
    verificationKey: { // verification is incomplete unless this is empty!
      type: Sequelize.STRING,
    },
    verificationExpiration: {
      type: Sequelize.TIME,
    }
  });
  Model.UserToken = sequelize.define("usertoken", {
    user: {
      type: Sequelize.STRING,
      allowNull: false,
      references: {
        model: Model.User,
        key: "id"
      }
    },
    expiryTime: {
      type: Sequelize.TIME
    },
    permission: {
      allowNull: false,
      type: Sequelize.ENUM("WRITE", "READ", "NONE")
    }
  });
  Model.UserSession = sequelize.define("usersession", {
    id: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    },
    user: {
      allowNull: false,
      type: Sequelize.STRING,
      references: {
        model: Model.User,
        key: "id"
      }
    },
    secret: {
      // checksum
      allowNull: false,
      type: Sequelize.STRING
    },
    logoutToken: {
      // checksum
      allowNull: false,
      type: Sequelize.STRING
    },
    ip: {
      allowNull: false,
      type: Sequelize.STRING
    },
    authMethod: {
      allowNull: false,
      type: Sequelize.STRING,
      references: {
        model: Model.AuthenticationMethod,
        key: 'id'
      }
    }
  });
  Model.Doc = sequelize.define("doc", {
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
      type: Sequelize.STRING,
    },
    size: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    uploader: {
      type: Sequelize.STRING,
      allowNull: false,
      references: {
        model: Model.User,
        key: 'id'
      }
    }
  }, {
    indexes: [{
      fields: ['associatedRecord'],
    }]
  });

  Model.Record = sequelize.define("record", {
    id: {
      allowNull: false,
      type: Sequelize.STRING,
      primaryKey: true
    },
    doc: {
      allowNull: true,
      type: Sequelize.STRING,
      references: {
        model: Model.Doc,
        key: "id"
      }
    },
    owner: {
      allowNull: false,
      type: Sequelize.STRING,
      references: {
        model: Model.User,
        key: "id"
      }
    },
    permission: {
      allowNull: false,
      type: Sequelize.ENUM('PUBLIC', 'PRIVATE'),
    }
  });
  Model.RecordPermission = sequelize.define('recordpermission', {
    record: {
      allowNull: false,
      type: Sequelize.STRING,
      references: {
        model: Model.Record,
        key: 'id'
      }
    },
    user: {
      allowNull: false,
      type: Sequelize.STRING,
      references: {
        model: Model.User,
        key: 'id'
      }
    },
    permission: {
      allowNull: false,
      type: Sequelize.ENUM('ADMIN', 'WRITE', 'READ', 'DENY'),
    }
  });
  Model.RecordToken = sequelize.define("recordtoken", {
    record: {
      allowNull: false,
      type: Sequelize.STRING,
      references: {
        model: Model.Record,
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
    }
  });

  await sequelize.authenticate();
  console.log("Sequelize has been established successfully.");



  // uncomment to DROP ALL TABLES AND RE_CREATE THEM!!! TODO: use migrations
  // let sequence = null;
  // Object.keys(Model).forEach(modelName => {
  //   const doSync = () => {
  //     console.log('Syncing ' + modelName);
  //     return Model[modelName].sync({
  //       force: true
  //     });
  //   }
  //   sequence = sequence ? sequence.then(doSync) : doSync();
  // });
  // await sequence;



  // await Model.User.create({
  //   id: "evv",
  //   password: 'foo',
  //   email: 'eric@aven.io',
  //   displayName: "Eric Vicenti"
  // });
  // const doc = await Model.User.findOne({
  //   where: {
  //     id: "evv"
  //   }
  // });
  // console.log("ok!!", doc.email);
}

const DB = {
  Model,
  init
};

export default DB;