# Development

## Prerequisites
# Node.js 22+
# npm

## Setup Environment
cp .env.example .env

## Setup Backend
cd backend && npm install

## Initialize Backend Mock Data
cd backend && npm run init

## Run Scraper Pipeline
cd backend && npm run scrape

## Run Scraper Pipeline (Full Refresh)
cd backend && npm run scrape:refresh

## Run Backend Server (Development)
cd backend && npm run dev

## Run Backend Server (Production)
cd backend && npm start

## Setup Frontend
cd frontend && npm install

## Run Frontend Dashboard (Development)
cd frontend && npm run dev

## Lint Frontend Code
cd frontend && npm run lint

## Build Frontend Dashboard
cd frontend && npm run build

## Preview Frontend Build
cd frontend && npm run preview
