#!/usr/bin/env bash

echo  "Initiate the test sequence!"
echo  "---------------------------"

docker_compose_up() {
  docker-compose -f docker-compose.yml up -d
}

docker_compose_down() {
  docker-compose -f docker-compose.yml down
}

run_jest() {
  NODE_EXECUTABLE="node"
  if [[ -n "$NODE_ARGS" ]]; then
    NODE_EXECUTABLE="$NODE_EXECUTABLE $NODE_ARGS"
  fi
  $NODE_EXECUTABLE ./node_modules/.bin/jest --testPathIgnorePatterns=/dist "$@"
}

echo  "Initializing Docker containers.."

# Silently close existing docker containers
docker-compose down &>/dev/null

docker_compose_up

echo "Containers created. Waiting for DB to start up.."

# This needs to be relatively on some computers when the db is starting up, such as a MacBook 2015 12"
sleep 7

echo  "Running database migration.."

./node_modules/sequelize-cli/lib/sequelize db:migrate

echo  "Migration complete."

sleep 2

echo "Running tests.."

if run_jest "$@"; then
  echo  "Tests pass!"
  docker_compose_down
else
  echo  "Tests failed."
  docker_compose_down
  exit 1
fi

exit 0
