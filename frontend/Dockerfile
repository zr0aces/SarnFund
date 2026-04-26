# Builds the React app. The compiled output lands in /app/dist.
# docker-compose runs: cp -r /app/dist/. /app/html/
# which populates the shared "frontend_dist" volume for nginx to serve.
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build
