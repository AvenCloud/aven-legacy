#!/usr/bin/env bash


docker_compose_up() {
  docker-compose -f docker-compose.yml up -d
}

docker_compose_down() {
  docker-compose -f docker-compose.yml down
}

run_app_dev() {
  echo "Running app in dev mode.."
  NODE_ENV=development
  PG_NO_SSL=true
  DATABASE_URL=postgresql://postgres:aven-test-password@localhost:5432/postgres
  babel-watch src/RunServer.js
}


echo  "Initiate development sequence!"
echo  "------------------------------"

echo "Starting Postgres in docker.."

docker_compose_up

echo "Containers created. Waiting for DB to start up.."

sleep 12

echo  "Running database migration.."

cp -f sequelizeConfig.postgres.json sequelizeConfig.json
./node_modules/sequelize-cli/lib/sequelize db:migrate

echo  "Migration complete."

sleep 2

if run_app_dev "$@"; then
  echo  "App Complete!"

  echo "Cleaning up Postgres container.."
  docker_compose_down
else
  echo "App Exited with error."

  echo "Cleaning up Postgres container.."
  docker_compose_down
  exit 1
  echo "Done. \n"
fi


echo "Done. \n"

exit 0
