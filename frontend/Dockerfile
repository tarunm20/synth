# Development/Testing Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (dev and prod)
RUN npm install

# Copy source code
COPY . .

# Set environment variables
ENV NODE_ENV=development
ENV PORT=3000

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev"]