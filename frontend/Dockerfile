# Builds the React app. The compiled output lands in /app/dist.
# docker-compose runs: cp -r /app/dist/. /app/html/
# which populates the shared "frontend_dist" volume for nginx to serve.
FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build
