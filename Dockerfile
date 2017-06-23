
FROM node:6-wheezy

RUN apt-get update
RUN apt-get install -y curl
RUN apt-get install -y postgresql postgresql-client

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY src src
COPY .babelrc .babelrc
COPY package.json package.json
COPY secrets.json secrets.json
RUN yarn install
RUN yarn build

EXPOSE 5000
CMD yarn run-prod
