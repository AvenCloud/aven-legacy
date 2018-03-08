#!/usr/bin/env bash
echo "STARTING SERVER WITH ENV '$NODE_ENV' "

if [ "$NODE_ENV" == 'production' ] 
then
    echo "STARTING PRODUCTION AVEN SERVER"
    echo "-------------------------------"

    echo "Performing Production DB migration.."

    cp -f sequelizeConfig.postgres.json sequelizeConfig.json
    ./node_modules/sequelize-cli/lib/sequelize db:migrate

    echo "Starting Production App at directory $PWD.."

    node dist/RunServer.js

else

    run_app_dev() {

    echo "STARTING DEVELOPMENT AVEN SERVER"
    echo "--------------------------------"

        node dist/RunServer.js
    }

    cp -f sequelizeConfig.sqlite.json sequelizeConfig.json
    ./node_modules/sequelize-cli/lib/sequelize db:migrate

    if run_app_dev "$@"; then
        echo  "App Complete!"
        else
        echo "App Exited with error."
    fi

    exit 0


fi