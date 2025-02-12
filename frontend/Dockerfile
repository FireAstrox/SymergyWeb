FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies including necessary type definitions
RUN npm install && \
    npm install --save-dev @types/react @types/react-dom @types/node && \
    npm cache clean --force

# Copy the rest of the application
COPY . .

# Create empty .env file if it doesn't exist
RUN touch .env

# Set environment variables
ENV REACT_APP_API_URL=http://localhost:5000
ENV NODE_ENV=development
ENV WATCHPACK_POLLING=true

# Expose port 3000
EXPOSE 3000

# Start the development server
CMD ["npm", "start"]
