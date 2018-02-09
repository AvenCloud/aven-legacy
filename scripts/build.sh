#!/usr/bin/env bash


echo  "Initiate build sequence!"
echo  "------------------------"

babel src --out-dir dist

browserify dist/BrowserApp.js -o dist/BrowserApp.bundle.js