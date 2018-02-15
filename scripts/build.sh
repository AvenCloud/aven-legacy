#!/usr/bin/env bash


echo  "Initiate build sequence!"
echo  "------------------------"

babel src --out-dir dist

browserify dist/BrowserApp.js -o dist/BrowserApp.bundle.js

cp -f sequelizeConfig.sqlite-dist.json sequelizeConfig.json
./node_modules/sequelize-cli/lib/sequelize db:migrate
