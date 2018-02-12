#!/usr/bin/env bash

run_app_dev() {
  echo "Running app in dev mode.."
  NODE_ENV=development
  babel-watch src/RunServer.js
}

echo  "Running Migration!"
cp -f sequelizeConfig.sqlite.json sequelizeConfig.json
./node_modules/sequelize-cli/lib/sequelize db:migrate

if run_app_dev "$@"; then
  echo  "App Complete!"
else
  echo "App Exited with error."
fi

exit 0
