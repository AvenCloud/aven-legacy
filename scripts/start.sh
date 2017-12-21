#!/usr/bin/env bash


# This script is only meant to be used in production. Use "yarn dev" for local development

echo "STARTING PRODUCTION AVEN SERVER"
echo "-------------------------------"

echo "Performing Production DB migration.."

./node_modules/sequelize-cli/lib/sequelize db:migrate

echo "Starting Production App at directory $PWD.."

node dist/Server.js
