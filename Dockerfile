# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# Install deps using only package files first
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund

# Copy source code
COPY backend/. .

# Build the application
RUN npm run build

# Runtime
EXPOSE 3001
CMD ["npm", "start"]
