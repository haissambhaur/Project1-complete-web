FROM node:23-alpine

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm install --legacy-peer-dep

COPY . .

EXPOSE 8083

CMD [ "npm","start"]