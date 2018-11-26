#!/bin/bash

echo "Building the site..."

npm run build

echo "Building docker container.."

docker-compose build

echo "Please run docker-compose up to start the server at port 3000"