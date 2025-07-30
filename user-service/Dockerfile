FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package files first and verify
COPY package*.json ./

# Debug: List files to confirm copy worked
RUN ls -la && cat package.json

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose port
EXPOSE 3000

CMD ["npm", "run", "dev"]