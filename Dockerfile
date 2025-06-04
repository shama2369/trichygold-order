# Use a lightweight Node.js base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies
# Use npm ci for clean installs suitable for CI/CD
RUN npm ci

# Copy the rest of your source code
COPY . .

# Run the build script defined in package.json
# This will create the dist directory
RUN npm run build:all

# Expose the port your app listens on (Railway sets PORT env var)
EXPOSE 5000 # Although your code uses process.env.PORT, Dockerfile needs an exposed port. Railway will map this.

# Command to run the application
CMD [ "npm", "start" ] 