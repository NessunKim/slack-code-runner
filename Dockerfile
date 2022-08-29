FROM node:18-alpine
WORKDIR /app

ARG NPM_TOKEN
COPY ./package.json ./package.json
COPY ./src ./src
COPY ./yarn.lock ./yarn.lock
COPY ./tsconfig.json ./tsconfig.json

RUN echo //npm.pkg.github.com/:_authToken=$NPM_TOKEN >> ~/.npmrc
RUN echo @scatterlab:registry=https://npm.pkg.github.com/ >> ~/.npmrc
RUN yarn --frozen-lockfile
RUN yarn build

CMD yarn start
