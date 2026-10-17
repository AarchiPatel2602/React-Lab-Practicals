# ==============================================================================
# Practical 11: Backend Dockerfile
# Service: Express.js REST API with MongoDB (Mongoose)
# ==============================================================================
FROM node:20-alpine

WORKDIR /app

# Install dependencies first for optimal Docker layer caching
COPY package*.json ./
RUN npm install

# Copy application source code
COPY . .

# Express backend port
EXPOSE 5000

# Start the application
CMD ["node", "app.js"]
