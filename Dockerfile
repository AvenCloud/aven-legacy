
FROM node:6-wheezy

RUN apt-get update
RUN apt-get install -y curl
RUN apt-get install -y postgresql postgresql-client

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY src src
COPY mobile/common mobile/common
COPY .babelrc .babelrc
COPY package.json package.json
RUN yarn install

EXPOSE 5000
