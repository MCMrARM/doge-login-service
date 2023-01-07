# syntax=docker/dockerfile:1

FROM node:18

WORKDIR /app

ADD release.tar.gz /app

RUN npm install --production

RUN adduser -D app && chown -R app /app

USER app
CMD [ "node", "build/start.js" ]
