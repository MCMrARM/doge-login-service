# syntax=docker/dockerfile:1

FROM node:18

WORKDIR /app

ADD release.tar.gz /app

RUN npm install --production

CMD [ "node", "build/start.js" ]
