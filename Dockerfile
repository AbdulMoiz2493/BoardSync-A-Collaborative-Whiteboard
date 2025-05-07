# Use Node.js 22 as the base image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json for both frontend and backend
COPY app/server/package*.json ./server/
COPY app/client/package*.json ./client/

# Install dependencies for backend
RUN cd server && npm install

# Install dependencies for frontend
RUN cd client && npm install

# Copy the application code
COPY app/server ./server/
COPY app/client ./client/

# Install concurrently to run both frontend and backend
RUN npm install -g concurrently

# Expose ports for backend (3000) and frontend (5173)
EXPOSE 3000 5173

# Run both backend and frontend with environment variable logging
CMD ["sh", "-c", "echo MONGODB_URI=$MONGODB_URI && concurrently --kill-others 'cd server && node server.js' 'cd client && npm run dev -- --host 0.0.0.0'"]