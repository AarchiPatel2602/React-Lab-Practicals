# ==============================================================================
# Practical 11: Frontend Dockerfile
# Service: React + Vite Single Page Application served via Nginx
# Multi-stage build for optimal image size and production performance
# ==============================================================================

# Stage 1: Build React application
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency manifests and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build production bundle
COPY . .
RUN npm run build

# Stage 2: Production Web Server
FROM nginx:alpine

# Copy built assets to Nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration supporting SPA client-side routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
