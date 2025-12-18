# Backend Dockerfile
FROM node:18-alpine

# Install curl for healthcheck
RUN apk add --no-cache curl

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application files
COPY . .

# Create data directory
RUN mkdir -p data

# Expose port
EXPOSE 3001

# Health check (using curl as preferred by docker-compose, but keeping node fallback in image if needed elsewhere, 
# though docker-compose overrides this)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

# Start server
CMD ["node", "server.js"]
