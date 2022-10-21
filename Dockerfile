FROM node:18-alpine
WORKDIR /app

COPY ./package.json ./package.json
COPY ./src ./src
COPY ./yarn.lock ./yarn.lock
COPY ./tsconfig.json ./tsconfig.json

RUN yarn --frozen-lockfile
RUN yarn build

CMD yarn start
