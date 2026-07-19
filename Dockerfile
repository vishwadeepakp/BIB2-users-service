# Use Node.js 24 official image
FROM node:24

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the application port
EXPOSE 5001

# Start the application
CMD ["npm", "start"]