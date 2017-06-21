
FROM node:boron

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . .
RUN npm install
RUN npm run build

EXPOSE 5000
CMD [ "npm", "run", "run-prod" ]

